"use client";

import { useEffect, useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Timestamp } from "firebase/firestore";

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
} from "@mui/joy";
import SearchIcon from "@mui/icons-material/Search";

import { useAuth } from "@/components/AuthContext";
import NavigationLayout from "@/components/NavigationLayout";
import Document from "@/types/Document";
import { DocumentConfig } from "@/types/DocumentConfig";

import CurrencyInput from "./CurrencyInput";
import DateInput from "./DateInput";
import InputStyle from "./InputStyle";
import renderAnnotations from "@/utils/renderAnnotations";

export default function ReviewPage() {
  const router = useRouter();
  const { user, organization, loading } = useAuth();

  const params = useSearchParams();
  const batchId = params.get("batchId");

  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentsFetched, setDocumentsFetched] = useState(false);
  const [documentIndex, setDocumentIndex] = useState<number>(0);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [pageNum, setPageNum] = useState<number>(1);

  const [documentType, setDocumentType] = useState<string>();
  const [documentConfigs, setDocumentConfigs] = useState<{
    [key: string]: DocumentConfig;
  }>({});

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
    };

    acquireBatch(batchId || "").then(() =>
      fetchDocuments().then(() => setDocumentsFetched(true))
    );
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
    if (!documentsFetched || !documents.length || !documentConfigs) {
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
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        renderAnnotations(
          pdfDoc,
          documents[documentIndex],
          documentConfigs[documentType].fields
        );
        const pdfBytes = await pdfDoc.save();
        const annotatedBlob = new Blob([pdfBytes], { type: "application/pdf" });
        const annotatedUrl = URL.createObjectURL(annotatedBlob);
        setPdfUrl(annotatedUrl);
      } catch (error) {
        console.error("Error fetching PDF:", error);
      }
    };

    fetchPdf();
    setPageNum(1);
  }, [documentsFetched, documents, documentIndex, documentConfigs]);

  // Jump to page to find specific field
  useEffect(() => {
    const jumpToPage = async () => {
      try {
        const response = await fetch(
          `/api/get-pdf?filename=${documents[documentIndex].filename}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch PDF");
        }

        const arrayBuffer = await response.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        renderAnnotations(
          pdfDoc,
          documents[documentIndex],
          documentConfigs[documentType].fields
        );
        const pdfBytes = await pdfDoc.save();
        const annotatedBlob = new Blob([pdfBytes], { type: "application/pdf" });
        const annotatedUrl = URL.createObjectURL(annotatedBlob);
        setPdfUrl(annotatedUrl + "#page=" + pageNum);
      } catch (error) {
        console.error("Error fetching PDF:", error);
      }
    };
    jumpToPage();
  }, [pageNum]);

  return (
    <NavigationLayout disabled={true}>
      <Box sx={{ width: "100%", height: "100%", display: "flex" }}>
        <Box
          sx={{
            flex: 3,
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <iframe
            src={pdfUrl}
            style={{
              flex: 1,
              marginLeft: "10px",
              marginRight: "10px",
              marginTop: "10px",
            }}
          ></iframe>
          <Box
            sx={{
              display: "flex",
              padding: "10px",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Button
              size="sm"
              color="neutral"
              onClick={() => setDocumentIndex(documentIndex - 1)}
              disabled={documentIndex === 0}
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
                onClick={() => setDocumentIndex(documentIndex + 1)}
                disabled={documentIndex === documents.length - 1}
                sx={{ paddingLeft: "30px", paddingRight: "30px" }}
              >
                Kick Out
              </Button>
              <Button
                size="sm"
                onClick={() => setDocumentIndex(documentIndex + 1)}
                disabled={documentIndex === documents.length - 1}
                sx={{ paddingLeft: "30px", paddingRight: "30px" }}
              >
                Verify
              </Button>
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
              padding: "10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography level="h3">Doc Type</Typography>
            {documentConfigs && (
              <Select
                size="lg"
                defaultValue={"Invoice / Debit Memo"}
                onChange={(event, newValue: string | null) => {
                  setDocumentType(newValue);
                }}
                sx={{ boxShadow: "sm" }}
              >
                {Object.values(documentConfigs).map((documentType) => (
                  <Option
                    key={documentType.id}
                    value={documentType.displayName}
                  >
                    {documentType.displayName}
                  </Option>
                ))}
              </Select>
            )}
          </Sheet>
          {documentConfigs[documentType] && (
            <Sheet sx={{ padding: "5px", overflow: "scroll" }}>
              {organization &&
                documentConfigs[documentType].fields.map((field, index) => {
                  let defaultValue = undefined;
                  if (
                    documents[documentIndex] &&
                    documents[documentIndex]["detectedFields"][
                      field.modelField
                    ] &&
                    documents.length > 0
                  ) {
                    defaultValue =
                      documents[documentIndex]["detectedFields"][
                        field.modelField
                      ].value;
                  }

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
                            paddingTop: "2px",
                            paddingBottom: "2px",
                            marginBottom: "5px",
                            backgroundColor: `rgb(${field.color.join(",")})`,
                          }}
                        >
                          <Typography
                            level="title-md"
                            sx={{ textAlign: "center" }}
                          >
                            {field.displayName}
                          </Typography>
                          <IconButton
                            onClick={() => {
                              const targetField =
                                documents[documentIndex]["detectedFields"][
                                  field.modelField
                                ];
                              if (targetField && targetField.page) {
                                setPageNum(targetField.page);
                              }
                            }}
                          >
                            <SearchIcon />
                          </IconButton>
                        </Box>
                      )}
                      {field.kind === "currency" ? (
                        <CurrencyInput
                          {...InputStyle}
                          defaultValue={
                            defaultValue ? defaultValue.amount : null
                          }
                        />
                      ) : field.kind === "date" ? (
                        <DateInput
                          {...InputStyle}
                          defaultValue={
                            defaultValue
                              ? new Timestamp(
                                  defaultValue._seconds,
                                  defaultValue._nanoseconds
                                )
                                  .toDate()
                                  .toISOString()
                                  .slice(0, 10)
                              : null
                          }
                        />
                      ) : field.kind === "number" ? (
                        <Input
                          {...InputStyle}
                          defaultValue={defaultValue}
                          type="number"
                        ></Input>
                      ) : (
                        <Input
                          {...InputStyle}
                          defaultValue={defaultValue}
                        ></Input>
                      )}
                    </div>
                  );
                })}
            </Sheet>
          )}
        </Box>
      </Box>
    </NavigationLayout>
  );
}
