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
} from "@mui/joy";
import SearchIcon from "@mui/icons-material/Search";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";

import { useAuth } from "@/components/AuthContext";
import NavigationLayout from "@/components/NavigationLayout";
import Document from "@/types/Document";
import { DocumentConfig, DocumentConfigField } from "@/types/DocumentConfig";

import CurrencyInput, { currencyToNumber } from "./CurrencyInput";
import DateInput, { dateToIsoString } from "./DateInput";
import InputStyle from "./InputStyle";

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

  const [documentType, setDocumentType] = useState<string>();
  const [documentConfigs, setDocumentConfigs] = useState<{
    [key: string]: DocumentConfig;
  }>({});

  const [inputValues, setInputValues] = useState<{ [key: string]: any }>();

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
      const result = navigator.sendBeacon("/api/release-batch", data);
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

  // Reset input values when document or document type changes
  useEffect(() => {
    if (!documentsFetched || !documentConfigs || !documentType) {
      return;
    }

    const newInputValues = {};
    documentConfigs[documentType]?.fields.forEach((field) => {
      let defaultValue: any;
      const detectedField =
        documents[documentIndex].fields?.[field.id] ||
        documents[documentIndex].detectedFields[field.modelField]?.value ||
        "";

      if (field.kind === "currency" && typeof detectedField !== "string") {
        defaultValue = currencyToNumber(detectedField);
      } else if (field.kind === "date") {
        defaultValue = dateToIsoString(detectedField);
      } else {
        defaultValue = detectedField;
      }
      newInputValues[field.id] = defaultValue;
    });
    setInputValues(newInputValues);
  }, [documentsFetched, documentConfigs, documentIndex, documentType]);

  function requiredFieldsFilledOut() {
    if (!documentConfigs || !documentConfigs[documentType] || !inputValues) {
      return false;
    }
    const requiredFields = documentConfigs[documentType].fields
      .filter((field) => field.required)
      .map((field) => field.id);
    for (const field of requiredFields) {
      if (!inputValues[field]) {
        return false;
      }
    }
    return true;
  }

  async function saveDocumentValues(submit: boolean) {
    const newDocument = {
      ...documents[documentIndex],
      fields: { ...inputValues },
    };
    const newDocumentIndex = submit ? documentIndex : documentIndex + 1;
    const newDocuments = documents.map((document, index) => {
      if (index === documentIndex) {
        return newDocument;
      }
      return document;
    });

    setDocuments(newDocuments);
    setDocumentIndex(newDocumentIndex);
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

    if (submit) {
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
    }
  }

  return (
    <NavigationLayout disabled={true}>
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
        }}
      >
        <Box
          sx={{
            flex: 3,
            display: "flex",
            flexDirection: "column",
            height: "100%",
            width: "0px",
          }}
        >
          {!pdfData && (
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
          {pdfData && (
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
                  documents[documentIndex].detectedFields[
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
          )}

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
              onClick={() => setDocumentIndex(documentIndex - 1)}
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
              <Button
                size="sm"
                color="danger"
                onClick={() => {
                  setDocumentIndex(documentIndex + 1);
                }}
                tabIndex={-1}
                disabled={documentIndex === documents.length - 1}
                sx={{ paddingLeft: "30px", paddingRight: "30px" }}
              >
                Kick Out
              </Button>
              {documentIndex === documents.length - 1 ? (
                <Button
                  size="sm"
                  color="success"
                  onClick={() => saveDocumentValues(true)}
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
          {documentConfigs[documentType] && documentsFetched && organization ? (
            <Sheet
              sx={{
                padding: "5px",
                overflow: "scroll",
                backgroundColor: "white",
              }}
            >
              {documentConfigs[documentType].fields.map((field, index) => {
                const handleInputChange = (
                  fieldId: string,
                  value: string | number
                ) => {
                  setInputValues({
                    ...inputValues,
                    [fieldId]: value,
                  });
                };

                const searchable =
                  field.modelField &&
                  documents[documentIndex].detectedFields?.[field.modelField]
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
                          height: "28px",
                          marginBottom: "5px",
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
                        <Typography level="title-md">
                          {field.displayName}
                        </Typography>
                        {searchable ? (
                          <IconButton
                            tabIndex={-1}
                            sx={{
                              "--IconButton-size": "20px",
                              transition: "background-color 0.3s ease",
                              backgroundColor: `rgb(${field.color.join(",")})`,
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
                              width: "31px",
                              height: "24px",
                              borderRadius: "22%",
                              backgroundColor: `rgb(${field.color.join(",")})`,
                            }}
                          ></Box>
                        )}
                      </Box>
                    )}
                    {field.kind === "currency" ? (
                      <CurrencyInput
                        {...InputStyle}
                        value={inputValues ? inputValues[field.id] : 0}
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
                            setActivatedFields([...activatedFields, field.id]);
                          }
                        }}
                        // onBlur={() => {
                        //   setSearchedField("");
                        // }}
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
                        value={inputValues ? inputValues[field.id] : ""}
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
                            setActivatedFields([...activatedFields, field.id]);
                          }
                        }}
                        // onBlur={() => {
                        //   setSearchedField("");
                        // }}
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
                        value={inputValues ? inputValues[field.id] : ""}
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
                            setActivatedFields([...activatedFields, field.id]);
                          }
                        }}
                        // onBlur={() => {
                        //   setSearchedField("");
                        // }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" && searchable) {
                            jumpToField(field);
                            setSearchedField(activeField);
                          }
                        }}
                      />
                    ) : (
                      <Input
                        {...InputStyle}
                        value={inputValues ? inputValues[field.id] : ""}
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
                            setActivatedFields([...activatedFields, field.id]);
                          }
                        }}
                        // onBlur={() => {
                        //   setSearchedField("");
                        // }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" && searchable) {
                            jumpToField(field);
                            setSearchedField(activeField);
                          }
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </Sheet>
          ) : null}
        </Box>
      </Box>
    </NavigationLayout>
  );
}
