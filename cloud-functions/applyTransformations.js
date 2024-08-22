require("@google-cloud/firestore");
const Fuse = require("fuse.js");
const sql = require("mssql");

const internalConfig = {
  user: process.env.INTERNAL_DB_USER, // DB username
  password: process.env.INTERNAL_DB_PASSWORD, // DB password
  server: process.env.INTERNAL_DB_SERVER, // DB server (e.g., localhost)
  database: process.env.INTERNAL_DB_NAME, // DB name
  options: {
    encrypt: true, // Use encryption
    trustServerCertificate: true, // Change to true if needed
  },
};

// Singleton pattern for database connection pool
let internalConnectionPool = null;

async function openInternalDB() {
  if (!internalConnectionPool) {
    try {
      internalConnectionPool = await sql.connect(internalConfig);
    } catch (error) {
      console.error("Error opening database connection:", error);
      throw error;
    }
  } else if (!internalConnectionPool.connected) {
    try {
      await internalConnectionPool.connect();
    } catch (error) {
      console.error("Error opening database connection:", error);
      throw error;
    }
  }
  return internalConnectionPool;
}

async function fetchTransformation(organization, transformation, orgRef) {
  const transformations = await orgRef.get().then((doc) => {
    if (doc.exists) {
      return doc.data().transformations;
    }
  });

  const transformationData = transformations.find(
    (t) => t.name.toLowerCase() === transformation.toLowerCase()
  );

  if (transformationData) {
    return transformationData;
  } else {
    console.error("transformation does not exist");
  }
}

const currencyToNumber = (currency) => {
  if (!currency) {
    return currency;
  } else if (typeof currency === "number") {
    return currency;
  }
  return currency.amount;
};

const dateToIsoString = (date) => {
  if (!date || !(date._seconds || date._nanoseconds)) {
    return date;
  }

  return new Timestamp(date._seconds, date._nanoseconds)
    .toDate()
    .toISOString()
    .slice(0, 10);
};

const regexReplace = (str, regexPattern, replacementValue) => {
  const regex = new RegExp(regexPattern, "g");
  return str.replace(regex, replacementValue);
};

async function fetchDocumentConfig(documentType, orgRef) {
  const org = await orgRef.get();
  const data = org.data();
  return data.documentTypes.find((d) => {
    return d.id == documentType;
  });
}

async function fetchMappings(organization, transformation, key) {
  if (key) key = encodeURIComponent(key.toLowerCase());
  organization = encodeURIComponent(organization);
  transformation = encodeURIComponent(transformation?.toLowerCase());

  const db = await openInternalDB();

  let query = `SELECT * FROM ${organization}Mappings`;
  const conditions = [];

  if (key) {
    conditions.push(`[key] = '${key}'`);
  }
  if (transformation) {
    conditions.push(`[transformation] = '${transformation}'`);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  return await db.query(query); // Execute the query with parameters
}

async function applyTransformationsStatically(
  organization,
  detectedFields,
  documentType,
  orgRef
) {
  var newInputValues = {};
  const configFields =
    (await fetchDocumentConfig(documentType, orgRef))?.fields || [];

  for (const field of configFields) {
    if (field.modelField === "Items") {
      continue;
    }
    let detectedField = detectedFields[field.modelField]?.value;

    if (field.kind === "currency" && typeof detectedField !== "string") {
      detectedField = currencyToNumber(detectedField);
    } else if (field.kind === "date") {
      detectedField = dateToIsoString(detectedField);
    } else {
      detectedField = detectedField;
    }
    // If the field is not detected or the field is already filled out, skip
    if (!detectedField) {
      continue;
    }

    if (
      !field.transformationMetadata ||
      field.transformationMetadata.length === 0
    ) {
      newInputValues[field.id] = detectedField;
      continue;
    }

    for (let transformationMetadata of field.transformationMetadata) {
      // If the field is not a string or has a transformation, skip
      if (!(field.kind === "string" && transformationMetadata?.id)) {
        continue;
      }

      // Default value is the detected value, value to be outputted
      var defaultValue = detectedField;

      // where we will store the transformed value
      var outField = field.id;

      let transformation = await fetchTransformation(
        organization,
        transformationMetadata?.id,
        orgRef
      );

      if (!transformation) {
        continue;
      }

      outField = transformationMetadata.outputField;

      if (transformation?.type === "replace") {
        defaultValue = regexReplace(
          defaultValue,
          transformation?.body.regexPattern,
          transformation?.body.replacementValue
        );
      } else if (
        transformation?.type === "lookup" &&
        transformation?.body?.lookupMethod === "fuzzy"
      ) {
        try {
          if (!defaultValue) {
            continue;
          }
          const defaultValueURI = encodeURIComponent(defaultValue);
          let data = await fetchMappings(
            organization,
            transformationMetadata.id,
            defaultValueURI
          );
          data = data.recordset;
          if (data.length > 0) {
            defaultValue = data[0].value;
          } else {
            let data = await fetchMappings(
              organization,
              transformationMetadata.id
            );
            data = data.recordset;
            if (data.length > 0) {
              // set default value to the closest fuzzy match
              const options = {
                keys: ["value"],
                includeScore: true,
              };

              const fuseInstance = new Fuse(data, options);
              const searchTerm = defaultValue;
              const result = fuseInstance.search(searchTerm);
              if (result.length > 0) {
                // Sort results by score in ascending order (best match first)
                result.sort((a, b) => {
                  if (!a || !b || !a.score || !b.score) {
                    return 100;
                  }
                  return a.score - b.score;
                });
                // Get the best match (first item after sorting)
                defaultValue = result[0].item.value;
              }
            }
          }
        } catch (error) {
          console.error("Error fetching mapping:", error);
        }
      }
      newInputValues[outField] = defaultValue;
    }
    newInputValues = await applyTransformationDynamically(
      newInputValues,
      field.id,
      detectedFields,
      organization,
      configFields,
      orgRef
    );
  }
  return newInputValues;
}

async function applyTransformationDynamically(
  inputValues,
  id,
  detectedFields,
  organization,
  configFields,
  orgRef
) {
  const newInputValues = inputValues;
  const field = configFields?.find((field) => field.id === id);

  // Default value is the detected value, value to be outputted
  var defaultValue = detectedFields?.[id] || newInputValues[id];

  if (
    !defaultValue ||
    !field.transformationMetadata ||
    field.kind !== "string"
  ) {
    return;
  }

  for (let transformationMetadata of field.transformationMetadata) {
    // If the field is not a string or has a transformation, skip
    if (!transformationMetadata?.id) {
      continue;
    }

    let transformation = await fetchTransformation(
      organization,
      transformationMetadata?.id,
      orgRef
    );

    // where we will store the transformed value
    var outField = transformationMetadata.outputField;

    if (transformation?.type === "lookup") {
      try {
        const defaultValueURI = encodeURIComponent(defaultValue);
        let data = await fetchMappings(organization, transformationMetadata.id);
        data = data.recordset;
        if (data.length > 0) {
          defaultValue = data[0].value;
        } else {
          continue;
        }
      } catch (error) {
        console.error("Error fetching mapping:", error);
      }
    }
    newInputValues[outField] = defaultValue;
  }
  return newInputValues;
}

module.exports = {
  applyTransformationsStatically,
};
