"use client";

import { useEffect, useState } from "react";
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

const inputStyle: InputProps = {
  variant: "outlined",
  sx: { marginBottom: "5px", boxShadow: "sm" },
};

export default function ReviewPage() {
  const router = useRouter();
  const params = useSearchParams();
  const batchId = params.get("batchId");

  const [documents, setDocuments] = useState<Document[]>([]);

  const [documentType, setDocumentType] = useState<string | null>("Invoice");
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [documentIndex, setDocumentIndex] = useState<number>(0);
  const [documentsFetched, setDocumentsFetched] = useState(false);

  useEffect(() => {
    async function acquireBatch(batchId: string) {
      const response = await fetch(
        `/api/acquire-batch?batchId=${batchId}&callerId=test`
      );
      const responseJson = await response.json();
      const acquired = responseJson.acquired;
      if (!acquired) {
        router.push("/batches");
      }
    }
    const fetchDocuments = async () => {
      const documentsResponse = await fetch(
        `/api/get-documents?batchId=${batchId}`
      );
      if (!documentsResponse.ok) {
        throw new Error("Failed to fetch documents");
      }
      const documents = await documentsResponse.json();
      setDocuments(documents);
    };

    acquireBatch(batchId || "").then(() =>
      fetchDocuments().then(() => setDocumentsFetched(true))
    );
  }, []);

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
            <Typography level="h3">{documentType}</Typography>
            <Select
              size="lg"
              defaultValue="Invoice"
              onChange={(event, newValue: string | null) =>
                setDocumentType(newValue)
              }
              sx={{ boxShadow: "sm" }}
            >
              <Option key={"invoice"} value="Invoice">
                Invoice
              </Option>
              <Option key={"credit"} value="Credit">
                Credit
              </Option>
            </Select>
          </Sheet>
          <Sheet sx={{ padding: "5px", overflow: "scroll" }}>
            {fields.map((field, index) => {
              let defaultValue = undefined;
              if (field.databaseId && documents.length > 0) {
                defaultValue = (documents[documentIndex] as any)[
                  field.databaseId + "Detected"
                ];
              }

              return (
                <div key={index}>
                  {field.name && (
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
                      {field.name}
                    </Typography>
                  )}
                  {field.type === "currency" ? (
                    <CurrencyInput
                      {...inputStyle}
                      defaultValue={defaultValue}
                    />
                  ) : field.type === "date" ? (
                    <DateInput {...inputStyle} defaultValue={defaultValue} />
                  ) : field.type === "number" ? (
                    <Input
                      {...inputStyle}
                      defaultValue={defaultValue}
                      type="number"
                    ></Input>
                  ) : (
                    <Input {...inputStyle} defaultValue={defaultValue}></Input>
                  )}
                </div>
              );
            })}
          </Sheet>
        </Box>
      </Box>
    </NavigationLayout>
  );
}
