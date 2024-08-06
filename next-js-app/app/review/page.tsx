"use client";

import { useEffect, useState } from "react";
import PdfViewer from "@/components/PdfViewer";

import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

import {
  Box,
  Button,
  Input,
  Option,
  Select,
  Sheet,
  Typography,
  IconButton,
  FormControl,
  Divider,
  CircularProgress,
  Textarea,
} from "@mui/joy";
import SearchIcon from "@mui/icons-material/Search";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";

import { useAuth } from "@/components/AuthContext";
import NavigationLayout from "@/components/NavigationLayout";
import Document from "@/types/Document";
import { DocumentConfig, DocumentConfigField } from "@/types/DocumentConfig";
import { Transformation, fetchTransformation } from "@/types/Transformation";
import { Mapping } from "@/types/Mapping";

import CurrencyInput, { currencyToNumber } from "./CurrencyInput";
import DateInput, { dateToIsoString } from "./DateInput";
import InputStyle from "./InputStyle";

import { regexReplace } from "@/utils/regexReplace";
import AutocompleteComponent from "./Autocomplete";
import Fuse from "fuse.js";
import MappingsTable from "./MappingsTable";

export default function ReviewPage() {
  const router = useRouter();
  const { user, organization, loading } = useAuth();

  const params = useSearchParams();
  const batchId = params.get("batchId");

  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentsFetched, setDocumentsFetched] = useState(false);
  const [documentIndex, setDocumentIndex] = useState<number>(0);
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);
  const [scrollTo, setScrollTo] = useState<any>(null);
  const [activeField, setActiveField] = useState<string>("");
  const [searchedField, setSearchedField] = useState<string>("");
  const [activatedFields, setActivatedFields] = useState<string[]>([]);
  const [fields, setFields] = useState([]);
  const [transformationsApplied, setTransformationsApplied] = useState(false);

  const [documentType, setDocumentType] = useState<string>();
  const [documentConfigs, setDocumentConfigs] = useState<{
    [key: string]: DocumentConfig;
  }>({});

  const [showMappings, setShowMappings] = useState(false);
  const [mappings, setMappings] = useState<any[]>([]);
  const [finished, setFinished] = useState(false);

  // Acquire batch and fetch documents
  useEffect(() => {
    if (loading) {
      return;
    }

    async function acquireBatch(batchId: string) {
      const response = await fetch("/api/acquire-batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          batchId,
          callerId: user.email,
          organization,
        }),
      });
      const responseJson = await response.json();
      const acquired = responseJson.acquired;
      if (!acquired) {
        console.error("Failed to acquire batch:", responseJson.error);
        router.push("/batches");
      }
    }

    const fetchDocuments = async () => {
      const documentsResponse = await fetch(
        `/api/get-batch-documents?batchId=${batchId}&organization=${organization}`
      );
      if (!documentsResponse.ok) {
        throw new Error(
          "Failed to fetch documents: " + documentsResponse.status
        );
      }

      const documents = await documentsResponse.json();
      setDocuments(documents);
      setDocumentsFetched(true);
    };

    acquireBatch(batchId || "").then(() => fetchDocuments());
  }, [loading]);

  // Heartbeat to database that the user is still using the batch every 30s
  useEffect(() => {
    if (loading) {
      return;
    }
    const data = JSON.stringify({
      batchId: batchId,
      callerId: user.email,
      organization: organization,
    });
    fetch("/api/heartbeat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: data,
    });
    const interval = setInterval(() => {
      fetch("/api/heartbeat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: data,
      });
    }, 30000);
  }, [loading]);

  // Check batch back in when the user navigates away from the page
  useEffect(() => {
    if (loading) {
      return;
    }

    const releaseBatch = () => {
      const data = JSON.stringify({
        batchId: batchId,
        callerId: user.email,
        organization: organization,
      });

      // Use navigator.sendBeacon to ensure the batch release request is sent
      navigator.sendBeacon("/api/release-batch", data);
    };

    /* Check batch back in when clicking link */
    const handleClick = (event: MouseEvent) => {
      releaseBatch();
    };

    /* Check batch back in when pressing back button */
    const handlePopState = (event) => {
      releaseBatch();
    };

    /* Checking batch back in when loading a page on a different origin */
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      releaseBatch();
    };

    document.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", handleClick);
    });
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      /* Checking batch back in when navigating to page within application (local route change) */
      releaseBatch();
      document.querySelectorAll("a").forEach((link) => {
        link.removeEventListener("click", handleClick);
      });
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [loading]);

  useEffect(() => {
    applyTransformationsStatically();
  }, [documentsFetched]);

  // Fetch document configs
  useEffect(() => {
    if (loading) {
      return;
    }

    async function fetchDocumentConfigs() {
      if (loading) {
        return;
      }
      const response = await fetch("/api/get-organization-document-types", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organization: organization,
        }),
      });

      const data = await response.json();
      const mergedJson: { [key: string]: DocumentConfig } = {};
      data.map((documentType: DocumentConfig) => {
        mergedJson[documentType.displayName] = documentType;
      });
      setDocumentConfigs(mergedJson);
      setDocumentType(data[0].displayName);
    }

    fetchDocumentConfigs();
  }, [loading]);

  // Fetch PDF and render annotations
  useEffect(() => {
    if (!documentsFetched || !documentConfigs) {
      return;
    }

    const fetchPdf = async () => {
      try {
        const response = await fetch(
          `/api/get-pdf?filename=${documents[documentIndex].filename}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch PDF");
        }

        const arrayBuffer = await response.arrayBuffer();
        setPdfData(arrayBuffer);
      } catch (error) {
        console.error("Error fetching PDF:", error);
      }
    };
    setActivatedFields([]);
    fetchPdf();
  }, [documentsFetched, documentIndex, documentConfigs]);

  const jumpToField = (field: DocumentConfigField) => {
    const detectedField =
      documents[documentIndex].detectedFields[field.modelField];
    if (detectedField && detectedField.page) {
      setScrollTo({
        page: detectedField.page,
        coordinates: detectedField.coordinates,
      });
      setSearchedField(field.id);
      setActiveField(field.id);
    }
  };

  async function applyTransformationsStatically() {
    documents.forEach(async (document, index) => {
      const newInputValues = {};
      const configFields = documentConfigs[documentType]?.fields || [];

      for (const field of configFields) {
        if (field.modelField === "Items") {
          continue;
        }
        const savedValue = document?.fields?.[field.id];
        let detectedField = document?.detectedFields[field.modelField]?.value;

        if (field.kind === "currency" && typeof detectedField !== "string") {
          detectedField = currencyToNumber(detectedField);
        } else if (field.kind === "date") {
          detectedField = dateToIsoString(detectedField);
        } else {
          detectedField = detectedField;
        }
        // If the field is not detected or the field is already filled out, skip
        if (savedValue || !detectedField) {
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

          // only on string fields for now
          let transformation: Transformation = await fetchTransformation(
            organization,
            transformationMetadata?.id
          );

          outField = transformationMetadata.outputField;

          if (transformation?.type === "replace") {
            defaultValue = regexReplace(
              defaultValue,
              transformation?.body.regexPattern,
              transformation?.body.replacementValue
            );
          } else if (
            field.kind === "string" &&
            transformation?.type === "lookup"
          ) {
            if (
              transformation?.body?.lookupMethod === "exact" ||
              !transformation?.body?.lookupMethod
            ) {
              try {
                if (!defaultValue) {
                  continue;
                }
                const defaultValueURI = encodeURIComponent(defaultValue);
                const response = await fetch(
                  `/api/mappings?organization=${organization}&key=${defaultValueURI}&transformation=${transformationMetadata.id}`,
                  {
                    method: "GET",
                    headers: {
                      "Content-Type": "application/json",
                    },
                  }
                );
                const data = await response.json();
                if (data.length > 0) {
                  defaultValue = data[0].value;
                } else {
                  continue;
                }
              } catch (error) {
                console.error("Error fetching mapping:", error);
              }
            } else if (transformation?.body?.lookupMethod === "fuzzy") {
              try {
                if (!defaultValue) {
                  continue;
                }
                const defaultValueURI = encodeURIComponent(defaultValue);
                const response = await fetch(
                  `/api/mappings?organization=${organization}&transformation=${transformationMetadata.id}&key=${defaultValueURI}`,
                  {
                    method: "GET",
                    headers: {
                      "Content-Type": "application/json",
                    },
                  }
                );
                const data = await response.json();
                if (data.length > 0) {
                  defaultValue = data[0].value;
                } else {
                  const response = await fetch(
                    `/api/mappings?&organization=${organization}&transformation=${transformationMetadata.id}`,
                    {
                      method: "GET",
                      headers: {
                        "Content-Type": "application/json",
                      },
                    }
                  );
                  const data = await response.json();
                  if (data.length > 0) {
                    // set default value to the closest fuzzy match
                    const options = {
                      keys: ["value"],
                      includeScore: true,
                    };

                    const fuse = new Fuse(data, options);
                    const searchTerm = defaultValue;
                    const result: any[] = fuse.search(searchTerm);

                    if (result.length > 0) {
                      // Sort results by score in ascending order (best match first)
                      result.sort((a, b) => a.score - b.score);
                      // Get the best match (first item after sorting)
                      defaultValue = result[0].item.value;
                    }
                  }
                }
              } catch (error) {
                console.error("Error fetching mapping:", error);
              }
            }
          }
          newInputValues[outField] = defaultValue;
        }
        await applyTransformationDynamically(newInputValues, field.id, index);
      }
      setFields((fields) => {
        const newFields = [...fields];
        newFields[index] = newInputValues;
        return newFields;
      });
    });
    setTransformationsApplied(true);
  }

  async function applyTransformationDynamically(
    inputValues: any,
    id: string,
    index: number
  ) {
    if (!documentsFetched || !documentConfigs || !documentType) {
      return;
    }
    const newInputValues = inputValues;
    const field = documentConfigs[documentType]?.fields.find(
      (field) => field.id === id
    );

    // Default value is the detected value, value to be outputted
    var defaultValue = documents[index].fields?.[id] || newInputValues[id];

    if (!defaultValue) {
      return;
    }

    if (!field.transformationMetadata) {
      return;
    }

    if (field.kind !== "string") {
      return;
    }

    for (let transformationMetadata of field.transformationMetadata) {
      // If the field is not a string or has a transformation, skip
      if (!transformationMetadata?.id) {
        continue;
      }

      // where we will store the transformed value
      var outField = field.id;

      // only on string fields for now
      let transformation: Transformation = await fetchTransformation(
        organization,
        transformationMetadata?.id
      );

      outField = transformationMetadata.outputField;

      if (field.kind === "string" && transformation?.type === "lookup") {
        try {
          if (!defaultValue) {
            continue;
          }
          const defaultValueURI = encodeURIComponent(defaultValue);
          const response = await fetch(
            `/api/mappings?organization=${organization}&key=${defaultValueURI}&transformation=${transformationMetadata.id}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          const data = await response.json();
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
    setFields((fields) => {
      const newFields = [...fields];
      newFields[index] = {
        ...fields[index],
        ...newInputValues,
      };
      return newFields;
    });
  }

  function requiredFieldsFilledOut() {
    if (
      !documentConfigs ||
      !documentConfigs[documentType] ||
      !fields[documentIndex]
    ) {
      return false;
    }
    const requiredFields = documentConfigs[documentType].fields
      .filter((field) => field.required)
      .map((field) => field.id);
    for (const field of requiredFields) {
      if (!fields[documentIndex][field]) {
        return false;
      }
    }
    return true;
  }

  async function getMappingsDisplay() {
    // Save mappings from detected fields to fields
    const newMappings = new Array<Mapping>();

    for (let doc of documents) {
      if (!doc.documentType || doc.kickedOut) {
        continue;
      }
      const detectedFields = doc.detectedFields;
      const fields = documentConfigs[doc?.documentType].fields;

      for (const field of fields) {
        if (!field.transformationMetadata) {
          continue;
        }
        for (let transformationMetadata of field.transformationMetadata) {
          if (transformationMetadata?.id) {
            const transformation: Transformation = await fetchTransformation(
              organization,
              transformationMetadata?.id
            );

            const inputField = fields.find((f) => {
              return f.id === transformationMetadata?.inputField;
            });
            const outputField = fields.find(
              (f) => f.id === transformationMetadata?.outputField
            );

            if (!inputField || !outputField) {
              continue;
            }

            if (transformation?.body?.learning) {
              if (detectedFields[field.modelField]?.value) {
                newMappings.push({
                  key: detectedFields[inputField.modelField]?.value,
                  value: doc.fields[outputField.id],
                  createdBy: user.email,
                  transformation: transformationMetadata.id,
                });
              }
            }
          }
        }
      }
    }
    // display mappings in a table overlay for review
    if (newMappings.length > 0) {
      setShowMappings(true);
      setMappings(newMappings);
    } else {
      submitDocumentValues();
    }
  }

  useEffect(() => {
    if (!documentsFetched || !documentConfigs || !documentType) {
      return;
    }
    setFinished(documentIndex === documents.length);
  }, [documentIndex]);

  const saveDocumentValues = async (kickOut: boolean) => {
    const newDocument = {
      ...documents[documentIndex],
      documentType: kickOut ? "" : documentType,
      fields: {},
      kickedOut: kickOut,
    };
    if (!kickOut) {
      newDocument.fields = { ...fields[documentIndex] };
    }
    var newDocumentIndex = documentIndex;
    const newDocuments = documents.map((document, index) => {
      if (index === documentIndex) {
        return newDocument;
      }
      return document;
    });

    setDocuments(newDocuments);
    if (newDocumentIndex === documents.length - 1) {
      setFinished(true);
    } else {
      setDocumentIndex(documentIndex + 1);
    }
    var response: any = await fetch("/api/save-batch-progress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        batch: batchId,
        documentIndex: newDocumentIndex,
        document: newDocument,
        organization: organization,
      }),
    });

    response = await response.json();
    if (response.acquired === false) {
      alert(response.error);
      router.push("/batches");
    }
  };

  const submitDocumentValues = async () => {
    await fetch("/api/submit-batch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        batch: batchId,
        organization: organization,
      }),
    }).then(() => {
      router.push("/batches");
    });
  };

  const saveAndExit = async () => {
    await fetch("/api/save-and-exit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        batch: batchId,
        organization: organization,
      }),
    }).then(() => {
      router.push("/batches");
    });
  };

  return (
    <NavigationLayout disabled={true}>
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
        }}
      >
        {pdfData && transformationsApplied && fields.length !== 0 ? (
          <Box
            sx={{
              flex: 3,
              display: "flex",
              flexDirection: "column",
              height: "100%",
              width: "0px",
            }}
          >
            {(!pdfData || !transformationsApplied) && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  width: "100%",
                  backgroundColor: "white",
                }}
              >
                <CircularProgress />
              </Box>
            )}
            <Box
              sx={{
                height: "0px",
                flexGrow: 1,
                display: "flex",
              }}
            >
              <PdfViewer
                arrayBuffer={pdfData}
                doc={documents[documentIndex]}
                fields={documentConfigs[documentType].fields}
                activeDetectedField={
                  documents[documentIndex].detectedFields?.[
                    activeField &&
                      documentConfigs[documentType].fields.find(
                        (field) => field.id === searchedField
                      )?.modelField
                  ]
                }
                activeField={documentConfigs[documentType].fields.find(
                  (field) => field.id === searchedField
                )}
                scrollTo={scrollTo}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                padding: "10px",
                justifyContent: "space-between",
                alignItems: "center",
                flex: 0,
              }}
            >
              <Button
                size="sm"
                color="neutral"
                onClick={() =>
                  finished
                    ? setFinished(false)
                    : setDocumentIndex(documentIndex - 1)
                }
                disabled={documentIndex === 0}
                tabIndex={-1}
                sx={{ paddingLeft: "30px", paddingRight: "30px" }}
              >
                Back
              </Button>
              <Typography sx={{ fontWeight: 800 }}>
                {documentIndex + 1} / {documents.length}
              </Typography>
              <Box sx={{ display: "flex", gap: "10px" }}>
                {finished ? (
                  <></>
                ) : (
                  <Button
                    size="sm"
                    color="danger"
                    onClick={() => {
                      saveDocumentValues(true);
                    }}
                    sx={{ paddingLeft: "30px", paddingRight: "30px" }}
                  >
                    Kick Out
                  </Button>
                )}
                {finished ? (
                  <Button
                    size="sm"
                    color="success"
                    onClick={async () => {
                      getMappingsDisplay();
                    }}
                    sx={{ paddingLeft: "30px", paddingRight: "30px" }}
                  >
                    Submit
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => saveDocumentValues(false)}
                    sx={{ paddingLeft: "30px", paddingRight: "30px" }}
                    disabled={!requiredFieldsFilledOut()} // Remove the arrow function
                  >
                    Verify
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              width: "100%",
              backgroundColor: "white",
            }}
          >
            <CircularProgress />
          </Box>
        )}
        {pdfData && transformationsApplied && fields.length !== 0 && (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minWidth: "300px",
            }}
          >
            <Sheet
              variant="plain"
              sx={{
                padding: "4px",
                width: "100%",
                mt: "10px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <FormControl>
                {documentConfigs && (
                  <Select
                    size="lg"
                    defaultValue={"Invoice / Debit Memo"} // TODO: Change to first document type
                    startDecorator={<AssignmentOutlinedIcon />}
                    onChange={(event, newValue: string | null) => {
                      setDocumentType(newValue);
                    }}
                    renderValue={(value) => (
                      <Typography level="title-lg" color="neutral">
                        {value.label}
                      </Typography>
                    )}
                  >
                    {Object.values(documentConfigs).map((documentType) => (
                      <Option
                        key={documentType.id}
                        value={documentType.displayName}
                      >
                        <Typography level="body-lg" color="neutral">
                          {documentType.displayName}
                        </Typography>
                      </Option>
                    ))}
                  </Select>
                )}
              </FormControl>
            </Sheet>
            <Divider
              sx={{
                marginTop: "8px",
                marginBottom: "8px",
                marginLeft: "5px",
                width: "calc(100% - 10px)",
              }}
            />
            {documentConfigs[documentType] &&
            documentsFetched &&
            transformationsApplied &&
            organization ? (
              <Sheet
                sx={{
                  padding: "5px",
                  overflow: "auto",
                  flexGrow: 1,
                  backgroundColor: "white",
                }}
              >
                {documentConfigs[documentType]?.fields.map((field, index) => {
                  const handleInputChange = (
                    fieldId: string,
                    value: string | number
                  ) => {
                    setFields((fields) => {
                      const newFields = [...fields];
                      newFields[documentIndex] = {
                        ...newFields[documentIndex],
                        [fieldId]: value,
                      };
                      return newFields;
                    });
                  };

                  const searchable =
                    field.modelField &&
                    documents[documentIndex]?.detectedFields?.[field.modelField]
                      ?.value;

                  return (
                    <div key={index}>
                      {field.displayName && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            paddingLeft: "10px",
                            paddingRight: "10px",
                            height: "24px",
                            marginBottom: "2px",
                            borderRadius: "5px",
                            background:
                              activeField == field.id
                                ? `linear-gradient(to left, rgb(${field.color.join(
                                    ","
                                  )}) 50%, transparent 50%)`
                                : `linear-gradient(to left, transparent 50%, transparent 50%)`,
                            backgroundSize: "200% 100%",
                            backgroundPosition:
                              activeField == field.id
                                ? "right bottom"
                                : "left bottom",
                            transition: "background-position 0.25s ease-out",
                          }}
                        >
                          <Typography level="title-sm">
                            {field.displayName}
                          </Typography>
                          {searchable ? (
                            <IconButton
                              tabIndex={-1}
                              size="sm"
                              sx={{
                                "--IconButton-size": "2px",
                                transition: "background-color 0.3s ease",
                                backgroundColor: `rgb(${field.color.join(
                                  ","
                                )})`,
                                ":hover": {
                                  backgroundColor: `rgba(${field.color.join(
                                    ","
                                  )}, 0.35)`,
                                },
                              }}
                              onClick={() => jumpToField(field)}
                            >
                              <SearchIcon />
                            </IconButton>
                          ) : (
                            <Box
                              sx={{
                                width: "28px",
                                height: "24px",
                                borderRadius: "22%",
                                backgroundColor: `rgb(${field.color.join(
                                  ","
                                )})`,
                              }}
                            ></Box>
                          )}
                        </Box>
                      )}
                      {field.kind === "currency" ? (
                        <CurrencyInput
                          {...InputStyle}
                          value={
                            fields[documentIndex]
                              ? fields[documentIndex][field.id]
                              : 0
                          }
                          onChange={(
                            event: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            handleInputChange(field.id, event.target.value);
                          }}
                          onFocus={() => {
                            const detectedField =
                              documents[documentIndex]?.detectedFields?.[
                                field.modelField
                              ];
                            setActiveField(field.id);
                            setSearchedField(field.id);
                            if (
                              detectedField &&
                              !activatedFields.includes(field.id)
                            ) {
                              setScrollTo({
                                page: detectedField.page,
                                coordinates: detectedField.coordinates,
                              });
                              setActivatedFields([
                                ...activatedFields,
                                field.id,
                              ]);
                            }
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" && searchable) {
                              jumpToField(field);
                              setSearchedField(activeField);
                            }
                          }}
                        />
                      ) : field.kind === "date" ? (
                        <DateInput
                          {...InputStyle}
                          endDecorator={null}
                          slotProps={{
                            endDecorator: {}, // no end decorator
                            input: { tabIndex: 0 },
                            startDecorator: { tabIndex: 0 },
                          }}
                          value={
                            fields[documentIndex]
                              ? fields[documentIndex][field.id]
                              : ""
                          }
                          onChange={(
                            event: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            handleInputChange(field.id, event.target.value);
                          }}
                          onFocus={() => {
                            const detectedField =
                              documents[documentIndex]?.detectedFields[
                                field.modelField
                              ];
                            setActiveField(field.id);
                            setSearchedField(field.id);
                            if (
                              detectedField &&
                              !activatedFields.includes(field.id)
                            ) {
                              setScrollTo({
                                page: detectedField.page,
                                coordinates: detectedField.coordinates,
                              });
                              setActivatedFields([
                                ...activatedFields,
                                field.id,
                              ]);
                            }
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" && searchable) {
                              jumpToField(field);
                              setSearchedField(activeField);
                            }
                          }}
                        />
                      ) : field.kind === "number" ? (
                        <Input
                          {...InputStyle}
                          value={
                            fields[documentIndex]
                              ? fields[documentIndex][field.id]
                              : ""
                          }
                          type="number"
                          onChange={(
                            event: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            handleInputChange(field.id, event.target.value);
                          }}
                          onFocus={() => {
                            const detectedField =
                              documents[documentIndex]?.detectedFields[
                                field.modelField
                              ];
                            setActiveField(field.id);
                            setSearchedField(field.id);
                            if (
                              detectedField &&
                              !activatedFields.includes(field.id)
                            ) {
                              setScrollTo({
                                page: detectedField.page,
                                coordinates: detectedField.coordinates,
                              });
                              setActivatedFields([
                                ...activatedFields,
                                field.id,
                              ]);
                            }
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" && searchable) {
                              jumpToField(field);
                              setSearchedField(activeField);
                            }
                          }}
                        />
                      ) : field.kind === "string" ? (
                        <AutocompleteComponent
                          organization={organization}
                          inputValues={fields[documentIndex]}
                          field={field}
                          handleInputChange={handleInputChange}
                          documentIndex={documentIndex}
                          documents={documents}
                          activatedFields={activatedFields}
                          setActivatedFields={setActivatedFields}
                          setActiveField={setActiveField}
                          setSearchedField={setSearchedField}
                          jumpToField={jumpToField}
                          searchable={searchable}
                          activeField={activeField}
                          setScrollTo={setScrollTo}
                          applyTransformation={applyTransformationDynamically}
                        />
                      ) : field.kind === "longstring" ? (
                        <Textarea
                          variant="outlined"
                          size="sm"
                          sx={{ marginBottom: "5px", boxShadow: "sm" }}
                          value={
                            fields[documentIndex]
                              ? fields[documentIndex][field.id]
                              : ""
                          }
                          onChange={(event) => {
                            handleInputChange(field.id, event.target.value);
                          }}
                        />
                      ) : (
                        <></>
                      )}
                    </div>
                  );
                })}
              </Sheet>
            ) : null}
            <Box
              sx={{
                display: "flex",
                padding: "10px",
                justifyContent: "flex-end",
                alignItems: "center",
                flex: 0,
                borderTop: "1px solid #e0e0e0",
              }}
            >
              <Box sx={{ display: "flex", gap: "10px" }}>
                {documentsFetched && !finished ? (
                  <Button
                    size="sm"
                    color="success"
                    tabIndex={-1}
                    onClick={() => {
                      saveAndExit();
                    }}
                    sx={{
                      paddingLeft: "30px",
                      paddingRight: "30px",
                    }}
                  >
                    Save and Exit
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    tabIndex={-1}
                    disabled={true}
                    sx={{
                      paddingLeft: "30px",
                      paddingRight: "30px",
                      opacity: 0,
                    }}
                  ></Button>
                )}
              </Box>
            </Box>
          </Box>
        )}
      </Box>
      {showMappings && (
        <MappingsTable
          auth={{ user, organization }}
          data={mappings}
          showMappings={showMappings}
          setShowMappings={setShowMappings}
          submitDocumentValues={submitDocumentValues}
        />
      )}
    </NavigationLayout>
  );
}
