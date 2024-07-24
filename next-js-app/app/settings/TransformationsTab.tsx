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
import CsvUpload from "./CsvUpload";

import { auth } from "firebase-admin";
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

  const isValid =
    transformationName &&
    (transformationType === "lookup" ||
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
            learning: learning,
          },
        },
      }),
    });
    if (transformationType === "lookup") {
      try {
        fetch("/api/mappings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data: csvData }),
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
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "background.surface",
        border: ".5px solid",
        borderColor: "black",
        my: "20px",
        width: "100%",
        minWidth: "fit-content", // Ensure the Box is at least as wide as its children
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center", // Add this line
          backgroundColor: "background.surface",
          width: "100%",
        }}
      >
        <FormControl
          sx={{
            mx: "20px",
            my: "20px",
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
            sx={{ width: 200 }}
          />
        </FormControl>
        <FormControl
          sx={{
            mx: "20px",
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
            sx={{ width: 125 }}
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
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "background.surface",
            }}
          >
            <FormControl
              sx={{
                mx: "20px",
                my: "20px",
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
                sx={{ width: "auto", minWidth: "225x" }}
              />
            </FormControl>
            <FormControl
              sx={{
                mx: "20px",
                my: "20px",
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
                sx={{ width: "auto", minWidth: "225px" }}
              />
            </FormControl>
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "background.surface",
            }}
          >
            <FormControl
              sx={{
                mx: "20px",
                my: "20px",
              }}
            >
              <FormLabel>Match</FormLabel>
              <Select
                value={lookupMethod}
                onChange={(event, value) => {
                  setLookupMethod(value);
                }}
                disabled={!isNew}
                sx={{ width: "auto", minWidth: "100px" }}
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
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "background.surface",
              }}
            >
              <FormControl
                sx={{
                  mx: "20px",
                  my: "20px",
                }}
              >
                <FormLabel>Lookup Table</FormLabel>
                <Box>
                  {isNew ? (
                    <CsvUpload
                      disabled={csvData == null || transformationName == ""}
                      onDataParsed={(data) => uploadCsvData(data)}
                    />
                  ) : (
                    <Button
                      sx={{ width: "auto", minWidth: "200px" }}
                      onClick={() => {
                        router.push(
                          `/api/mappings?transformation=${transformationName}`
                        );
                      }}
                    >
                      Show Mappings
                    </Button>
                  )}
                </Box>
              </FormControl>
              <FormControl
                sx={{
                  mx: "20px",
                  my: "20px",
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
          </Box>
        )}
      </Box>
      <FormControl
        sx={{
          mx: "40px",
          mb: "20px",
          minWidth: "100px",
        }}
      >
        <FormLabel sx={{ color: "transparent" }}>_</FormLabel>
        {isNew ? (
          <Button
            color="success"
            onClick={addTransformation}
            disabled={!isValid}
          >
            Save Changes
          </Button>
        ) : (
          <Button color="danger" onClick={deleteTransformation}>
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
    <Box>
      {transformations.length > 0 &&
        transformations.map((transformation, index) => {
          return (
            <TransformationComponent
              auth={{ user, loading, level, organization }}
              transformation={transformation}
              isNew={false}
              refresh={fetchTransformations}
            ></TransformationComponent>
          );
        })}
      <TransformationComponent
        auth={{ user, loading, level, organization }}
        isNew
        refresh={fetchTransformations}
      ></TransformationComponent>
    </Box>
  );
}
