"use client";

import { use, useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Autocomplete,
  Typography,
  Input,
  FormControl,
  FormLabel,
  Select,
  Option,
} from "@mui/joy";
import {
  DocumentConfig as Document,
  DocumentConfigField as DocumentField,
} from "@/types/DocumentConfig";
import { Transformation } from "@/types/Transformation";
import { useAuth } from "@/components/AuthContext";
import { useRouter } from "next/navigation";

interface TransformationProps {
  auth: AuthContext;
  refresh?: any;
  isNew?: boolean;
  transformation?: Transformation;
}

export function TransformationComponent({
  auth,
  refresh,
  isNew,
  transformation,
}: TransformationProps) {
  const router = useRouter();
  const [options, setOptions] = useState([]);

  const [transformationName, setTransformationName] = useState(
    transformation?.name || ""
  );
  const [transformationType, setTransformationType] = useState(
    transformation?.type || "lookup"
  );
  const [regexPattern, setRegexPattern] = useState(
    transformation?.body?.regexPattern || ""
  );
  const [replacementValue, setReplacementValue] = useState(
    transformation?.body?.replacementValue || ""
  );
  const [lookupMethod, setLookupMethod] = useState(
    transformation?.body?.lookupMethod || "exact"
  );
  const [csvData, setCsvData] = useState([]);
  const [learning, setLearning] = useState(
    transformation?.body?.learning || false
  );
  const [lookupTable, setLookupTable] = useState(
    transformation?.body?.lookupTable || ""
  );
  const [keyColumn, setKey] = useState(
    transformation?.body?.lookupKeyColumn || ""
  );
  const [valueColumn, setValue] = useState(
    transformation?.body?.lookupValueColumn || ""
  );

  const isValid =
    transformationName &&
    ((transformationType === "lookup" &&
      lookupTable &&
      keyColumn &&
      valueColumn) ||
      (transformationType === "replace" && regexPattern));

  async function addTransformation() {
    // Add transformation
    const response = await fetch("/api/transformations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        organization: auth.organization,
        transformation: {
          name: transformationName,
          type: transformationType,
          body: {
            regexPattern: regexPattern,
            replacementValue: replacementValue,
            lookupMethod: lookupMethod,
            lookupTable: lookupTable,
            lookupKeyColumn: keyColumn,
            lookupValueColumn: valueColumn,
            learning: learning,
          },
        },
      }),
    });
    if (transformationType === "lookup") {
      try {
        const response = await fetch("/api/mssql-sync-mappings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transformation: transformationName,
            keyColumn: keyColumn,
            valueColumn: valueColumn,
            tableName: lookupTable,
            organization: auth.organization,
          }),
        });
      } catch (error) {
        console.error("Error creating mapping:", error);
      }
    }
    response.json().then((data) => {
      refresh();
    });
    setTransformationName("");
    setTransformationType("lookup");
    setRegexPattern("");
    setReplacementValue("");
    setLookupMethod("exact");
    setLookupTable("");
    setKey("");
    setValue("");
    setCsvData([]);
    setLearning(false);
  }

  useEffect(() => {
    async function fetchDocumentConfigurations() {
      // Fetch document configurations
      const response = await fetch("/api/get-organization-document-types", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organization: auth.organization,
        }),
      });
      response.json().then((data) => {
        data.forEach((document: Document) => {
          document.fields.forEach((field: DocumentField) => {
            setOptions((prev) => [...prev, field.id]);
          });
        });
      });
    }
    fetchDocumentConfigurations();
  }, []);

  const deleteTransformation = async () => {
    // Delete transformation
    const response = await fetch("/api/transformations", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        organization: auth.organization,
        transformation: transformation,
      }),
    });
    response.json().then((data) => {
      refresh();
    });
  };

  const uploadCsvData = (data) => {
    var body = [];
    data.forEach((row) => {
      var rowArray = Object.values(row);
      const key = rowArray[0]?.toString().trim();
      const value = rowArray[1]?.toString().trim();
      if (!key || !value) {
        return;
      }
      body.push({
        key: key,
        value: value,
        createdBy: auth.user.email,
        transformation: transformationName,
      });
    });
    setCsvData(body);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column", // Changed to column to stack items vertically
        alignItems: "flex-start", // Align items to the start of the container
        backgroundColor: "background.surface",
        border: ".5px solid",
        borderColor: "black",
        my: "20px",
        width: "100%",
        minWidth: "fit-content",
        p: "20px", // Added padding to create some space around the content
      }}
    >
      <FormControl
        sx={{
          my: "10px", // Reduced margin for better spacing
          width: "100%", // Ensure form control takes the full width
        }}
      >
        <FormLabel>Transformation Name</FormLabel>
        <Input
          value={transformationName}
          onChange={(event) => {
            setTransformationName(event.target.value);
          }}
          disabled={!isNew}
          placeholder="Transformation Name"
          sx={{ width: "100%" }}
        />
      </FormControl>
      <FormControl
        sx={{
          my: "10px",
          width: "100%",
        }}
      >
        <FormLabel>Transformation</FormLabel>
        <Select
          defaultValue={"lookup"}
          value={transformationType}
          onChange={(event, value) => {
            setTransformationType(value);
          }}
          disabled={!isNew}
          sx={{ width: "100%" }}
        >
          <Option key="lookup" value="lookup">
            <Typography level="body-lg" color="neutral">
              Lookup
            </Typography>
          </Option>
          <Option key="replace" value="replace">
            <Typography level="body-lg" color="neutral">
              Replace
            </Typography>
          </Option>
        </Select>
      </FormControl>
      {transformationType === "replace" ? (
        <Box
          sx={{
            width: "100%",
          }}
        >
          <FormControl
            sx={{
              my: "10px",
              width: "100%",
            }}
          >
            <FormLabel>Regex Pattern</FormLabel>
            <Input
              value={regexPattern}
              onChange={(event) => {
                setRegexPattern(event.target.value);
              }}
              placeholder="Regex pattern to replace"
              disabled={!isNew}
              sx={{ width: "100%" }}
            />
          </FormControl>
          <FormControl
            sx={{
              my: "10px",
              width: "100%",
            }}
          >
            <FormLabel>Replacement Value</FormLabel>
            <Input
              value={replacementValue}
              onChange={(event) => {
                setReplacementValue(event.target.value);
              }}
              disabled={!isNew}
              placeholder="Replacement value"
              sx={{ width: "100%" }}
            />
          </FormControl>
        </Box>
      ) : (
        <Box
          sx={{
            width: "100%",
          }}
        >
          <FormControl
            sx={{
              my: "10px",
              width: "100%",
            }}
          >
            <FormLabel>Match</FormLabel>
            <Select
              value={lookupMethod}
              onChange={(event, value) => {
                setLookupMethod(value);
              }}
              disabled={!isNew}
              sx={{ width: "100%" }}
            >
              <Option key="exact" value="exact">
                <Typography level="body-lg" color="neutral">
                  Exact
                </Typography>
              </Option>
              <Option key="fuzzy" value="fuzzy">
                <Typography level="body-lg" color="neutral">
                  Fuzzy
                </Typography>
              </Option>
            </Select>
          </FormControl>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column", // Stack lookup table inputs vertically
              width: "100%",
            }}
          >
            <Box sx={{ width: "100%" }}>
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                }}
              >
                <FormControl
                  sx={{
                    flex: 1, // Allow the FormControl to take up available space
                  }}
                >
                  <FormLabel>Lookup Table</FormLabel>
                  <Input
                    value={lookupTable}
                    onChange={(event) => {
                      setLookupTable(event.target.value);
                    }}
                    disabled={!isNew}
                    sx={{ width: "100%" }}
                  />
                </FormControl>

                {!isNew && (
                  <Button
                    sx={{ width: "auto", mt: "25px" }} // The button's width is determined by its content
                    onClick={() => {
                      router.push(
                        `/api/mssql-mappings?organization=${auth.organization}&transformation=${transformationName}`
                      );
                    }}
                  >
                    Show Mappings
                  </Button>
                )}
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row", // Align key and value side by side
                  justifyContent: "space-between", // Distribute space between the key and value inputs
                  width: "100%",
                  mt: "10px", // Add margin at the top for better spacing
                }}
              >
                <FormControl
                  sx={{
                    width: "48%", // Give key and value inputs equal width
                  }}
                >
                  <FormLabel>Key</FormLabel>
                  <Input
                    value={keyColumn}
                    onChange={(event) => {
                      setKey(event.target.value);
                    }}
                    disabled={!isNew}
                  />
                </FormControl>
                <FormControl
                  sx={{
                    width: "48%",
                  }}
                >
                  <FormLabel>Value</FormLabel>
                  <Input
                    value={valueColumn}
                    onChange={(event) => {
                      setValue(event.target.value);
                    }}
                    disabled={!isNew}
                  />
                </FormControl>
              </Box>
            </Box>
          </Box>
          <FormControl
            sx={{
              my: "10px",
              width: "100%",
            }}
          >
            <FormLabel>Learning</FormLabel>
            <Checkbox
              checked={learning}
              onChange={() => setLearning(!learning)}
              disabled={!isNew}
            >
              Learning
            </Checkbox>
          </FormControl>
        </Box>
      )}
      <FormControl
        sx={{
          my: "10px",
          width: "100%",
        }}
      >
        {isNew ? (
          <Button
            color="success"
            onClick={addTransformation}
            disabled={!isValid}
            sx={{ width: "100%" }} // Make the button take full width
          >
            Save Changes
          </Button>
        ) : (
          <Button
            color="danger"
            onClick={deleteTransformation}
            sx={{ width: "100%" }} // Make the button take full width
          >
            Delete
          </Button>
        )}
      </FormControl>
    </Box>
  );
}

interface AuthContext {
  user: any;
  loading: boolean;
  level: string;
  organization: string;
}

export default function TransformationsTab() {
  const [transformations, setTransformations] = useState([]);
  const [transformationsLoading, setTransformationsLoading] = useState(true);
  const { user, loading, level, organization }: AuthContext = useAuth();
  const [syncMappings, setSyncMappings] = useState(false);

  async function fetchTransformations() {
    // Fetch transformations
    const response = await fetch(
      `/api/transformations?organization=${organization}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    response.json().then((data) => {
      setTransformations(data);
    });
  }

  useEffect(() => {
    fetchTransformations();
    setTransformationsLoading(false);
  }, []);

  if (loading || transformationsLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          paddingTop: "20%",
        }}
      >
        <CircularProgress variant="outlined" />
      </Box>
    );
  }
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column", // Stack TransformationComponent instances vertically
        alignItems: "center",
        width: "100%",
        pb: "20px", // Add margin at the bottom for better spacing
      }}
    >
      <TransformationComponent
        auth={{ user, loading, level, organization }}
        isNew
        refresh={fetchTransformations}
      ></TransformationComponent>
      {transformations.length > 0 &&
        transformations.map((transformation, index) => {
          return (
            <TransformationComponent
              auth={{ user, loading, level, organization }}
              transformation={transformation}
              isNew={false}
              refresh={fetchTransformations}
              key={index} // Added a key for React list rendering
            ></TransformationComponent>
          );
        })}
      <Button
        color="warning"
        disabled={syncMappings}
        onClick={() => {
          var promises = [];
          transformations.forEach((transformation) => {
            if (
              transformation.type !== "lookup" ||
              !transformation.body.lookupTable
            ) {
              return;
            }
            promises.push(
              fetch("/api/mssql-sync-mappings", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  transformation: transformation.name,
                  keyColumn: transformation.body.lookupKeyColumn,
                  valueColumn: transformation.body.lookupValueColumn,
                  tableName: transformation.body.lookupTable,
                  organization: organization,
                }),
              })
            );
          });
          Promise.all(promises).then(() => {
            fetchTransformations();
            // setSyncMappings(true);
          });
        }}
      >
        Sync Databases
      </Button>
    </Box>
  );
}
