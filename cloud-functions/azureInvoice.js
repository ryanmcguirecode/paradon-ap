const {
  AzureKeyCredential,
  DocumentAnalysisClient,
} = require("@azure/ai-form-recognizer");

/* FOR TESTING: REMOVE FOR CLOUD FUNCTION */
require("dotenv").config({ path: ".env.local" });
/* FOR TESTING: REMOVE FOR CLOUD FUNCTION */

function formatFields(fields) {
  const formattedFields = {};

  for (let key of Object.keys(fields)) {
    if (key === "Items") {
      //   console.log("Items:", fields[key]);
    } else {
      let page = null;
      let coordinates = [];

      const pages = (fields[key].boundingRegions || []).map(
        (region) => region.pageNumber
      );
      if (pages.length > 0) {
        page = Math.min(...pages);
      }

      const polygons = (fields[key].boundingRegions || []).map(
        (region) => region.polygon
      );
      const xValues = polygons
        .map((polygon) => polygon.map((point) => point.x))
        .flat();
      const yValues = polygons
        .map((polygon) => polygon.map((point) => point.y))
        .flat();
      if (xValues.length > 0 || yValues.length > 0) {
        coordinates = [
          Math.min(...xValues),
          Math.max(...xValues),
          Math.min(...yValues),
          Math.max(...yValues),
        ];
      }

      formattedFields[key] = {
        kind: fields[key].kind,
        value: fields[key].value,
        page: page,
        coordinates: coordinates,
        content: fields[key].content,
        confidence: fields[key].confidence,
      };
    }
  }
  return formattedFields;
}

module.exports = async function extractFields(fileContent) {
  const endpoint = "https://centralus.api.cognitive.microsoft.com/";
  const key = process.env.AZURE_FORM_RECOGNIZER_KEY;

  if (!fileContent) {
    console.error("No file content for Azure Form Recognizer to analyze");
  } else if (!key || !endpoint) {
    console.error("Azure Form Recognizer credentials not configured");
  }

  try {
    const client = new DocumentAnalysisClient(
      endpoint,
      new AzureKeyCredential(key)
    );
    const poller = await client.beginAnalyzeDocument(
      "prebuilt-invoice",
      fileContent
    );
    const {
      pages, // pages extracted from the document, which contain lines and words
      tables, // extracted tables, organized into cells that contain their contents
      styles, // text styles (ex. handwriting) that were observed in the document
      keyValuePairs, // extracted pairs of elements  (directed associations from one element in the input to another)
      documents, // extracted fields from the document
    } = await poller.pollUntilDone();

    if (!documents || documents.length === 0) {
      console.error("Azure found no document");
    } else if (documents.length > 1) {
      console.error("Azure found more than 1 document");
    }

    const { fields } = documents[0];
    return formatFields(fields);
  } catch (error) {
    console.error(error);
  }
};
