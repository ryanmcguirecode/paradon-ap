"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import {
  Box,
  Button,
  Input,
  InputProps,
  Option,
  Select,
  Sheet,
  Typography,
} from "@mui/joy";
import { PDFDocument } from "pdf-lib";

import NavigationLayout from "@/components/NavigationLayout";
import Document from "@/components/Document";

import CurrencyInput from "./CurrencyInput";
import DateInput from "./DateInput";
import { fields } from "./testData";
import renderAnnotations from "../../utils/renderAnnotations";

import { useAuth } from "@/components/AuthContext";
import { Document as DocumentType } from "@/types/Document";

const inputStyle: InputProps = {
  variant: "outlined",
  sx: { marginBottom: "5px", boxShadow: "sm" },
};

export default function ReviewPage() {
  const router = useRouter();
  const params = useSearchParams();
  const batchId = params.get("batchId");
  const { organization, loading } = useAuth();

  const [documents, setDocuments] = useState<Document[]>([]);

  const [documentType, setDocumentType] = useState<string>();
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [documentIndex, setDocumentIndex] = useState<number>(0);
  const [documentsFetched, setDocumentsFetched] = useState(false);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [documentTypesJson, setDocumentTypesJson] = useState<{
    [key: string]: DocumentType;
  }>({});

  const getTypes = async () => {
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
    const mergedJson: { [key: string]: DocumentType } = {};
    data.map((documentType: DocumentType) => {
      mergedJson[documentType.displayName] = documentType;
    });
    setDocumentTypes(data);
    setDocumentTypesJson(mergedJson);
    setDocumentType(data[0].displayName);
  };

  useEffect(() => {
    if (loading) {
      return;
    }

    async function acquireBatch(batchId: string) {
      // const response = await fetch(
      //   `/api/acquire-batch?batchId=${batchId}&callerId=test`
      // );
      // const responseJson = await response.json();
      // const acquired = responseJson.acquired;
      // if (!acquired) {
      //   router.push("/batches");
      // }
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

    getTypes();
  }, [loading]);

  useEffect(() => {
    if (!documentsFetched || !documents.length) {
      return;
    }

    const fetchPdf = async () => {
      try {
        const response = await fetch(
          `/api/get-pdf?fileName=${documents[documentIndex].filename}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch PDF");
        }

        const arrayBuffer = await response.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        renderAnnotations(pdfDoc, documents[documentIndex], fields);
        const pdfBytes = await pdfDoc.save();
        const annotatedBlob = new Blob([pdfBytes], { type: "application/pdf" });
        const annotatedUrl = URL.createObjectURL(annotatedBlob);
        setPdfUrl(annotatedUrl);
      } catch (error) {
        console.error("Error fetching PDF:", error);
      }
    };

    fetchPdf();
  }, [documentsFetched, documents, documentIndex]);

  return (
    <NavigationLayout>
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
            {documentTypes && documentTypes.length > 0 && (
              <Select
                size="lg"
                defaultValue={"Invoice / Debit Memo"}
                onChange={(event, newValue: string | null) => {
                  setDocumentType(newValue);
                }}
                sx={{ boxShadow: "sm" }}
              >
                {documentTypes &&
                  documentTypes.map((documentType) => (
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
          {documentTypesJson[documentType] && (
            <Sheet sx={{ padding: "5px", overflow: "scroll" }}>
              {organization &&
                documentTypesJson[documentType].fields.map((field, index) => {
                  let defaultValue = undefined;
                  if (field.id && documents.length > 0) {
                    defaultValue = (documents[documentIndex] as any)[
                      field.id + "Detected"
                    ];
                  }

                  return (
                    <div key={index}>
                      {field.displayName && (
                        <Typography
                          level="title-md"
                          sx={{
                            paddingLeft: "10px",
                            paddingRight: "10px",
                            paddingTop: "2px",
                            paddingBottom: "2px",
                            marginBottom: "5px",
                            textAlign: "center",
                            backgroundColor: `rgb(${field.color.join(",")})`,
                          }}
                        >
                          {field.displayName}
                        </Typography>
                      )}
                      {field.kind === "currency" ? (
                        <CurrencyInput
                          {...inputStyle}
                          defaultValue={defaultValue}
                        />
                      ) : field.kind === "date" ? (
                        <DateInput
                          {...inputStyle}
                          defaultValue={defaultValue}
                        />
                      ) : field.kind === "number" ? (
                        <Input
                          {...inputStyle}
                          defaultValue={defaultValue}
                          type="number"
                        ></Input>
                      ) : (
                        <Input
                          {...inputStyle}
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
