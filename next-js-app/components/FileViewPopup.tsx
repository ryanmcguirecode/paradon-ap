import { useEffect, useState } from "react";
import {
  Drawer,
  ModalClose,
  Box,
  Typography,
  Input,
  Button,
  Grid,
} from "@mui/joy";
import PdfViewer from "./PdfViewer";
import { PDFDocument } from "pdf-lib";
import Document from "@/types/Document";
import CheckCircle from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

interface FileViewPopupProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  file: Document;
}

export default function FileViewPopup({
  open,
  setOpen,
  file,
}: FileViewPopupProps) {
  const [pdfData, setPdfData] = useState(null);
  const [pageNumbers, setPageNumbers] = useState("");
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchPdf = async () => {
      try {
        const response = await fetch(`/api/get-pdf?filename=${file.filename}`);
        if (!response.ok) {
          throw new Error("Failed to fetch PDF");
        }

        const arrayBuffer = await response.arrayBuffer();
        setPdfData(arrayBuffer);
      } catch (error) {
        console.error("Error fetching PDF:", error);
      }
    };

    if (file) {
      fetchPdf();
    }
  }, [file]);

  const handleSplit = async () => {
    let pages = pageNumbers.split(",").map((num) => parseInt(num.trim(), 10));
    pages = [...pages, null]; // Adding null to handle the end of the last range

    if (pdfData) {
      try {
        const pdfDoc = await PDFDocument.load(pdfData);

        for (let i = 0; i < pages.length - 1; i++) {
          const start = pages[i] - 1;
          const end = pages[i + 1]
            ? pages[i + 1] - 2 // decrement once for 0-based index and once for exclusive range
            : pdfDoc.getPageCount() - 1; // Handle the last range properly
          const splitPdfDoc = await PDFDocument.create();

          for (let j = start; j <= end; j++) {
            const [copiedPage] = await splitPdfDoc.copyPages(pdfDoc, [j]);
            splitPdfDoc.addPage(copiedPage);
          }

          const pdfBytesNew = await splitPdfDoc.save();
          const pdfBytesBase64 = Buffer.from(pdfBytesNew).toString("base64"); // Encode as base64

          fetch(`/api/upload`, {
            method: "POST",
            body: JSON.stringify({
              pdfBytes: pdfBytesBase64, // Send as base64 string
              orgId: file.organization,
              fileName: `${file.filename}-split-${i + 1}`,
            }),
            headers: {
              "Content-Type": "application/json",
            },
          }).then((response) => {
            if (response.ok) {
              setSuccess(true);
            } else {
              setSuccess(false);
            }
          });
        }
      } catch (error) {
        console.error("Error splitting PDF:", error);
      }
    }
  };

  return (
    <Drawer
      open={open}
      onClose={() => {
        setOpen(false);
      }}
      anchor="bottom"
      size="lg"
      slotProps={{
        content: {
          sx: { width: "100%", height: "100vh", padding: "0px" },
        },
      }}
    >
      <ModalClose variant="plain" color="neutral" sx={{ zIndex: 10 }} />
      <Grid container sx={{ height: "100%" }}>
        <Grid xs={10} sx={{ height: "100%" }}>
          {open && (
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
                <Box
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    height: "0px",
                  }}
                >
                  <PdfViewer arrayBuffer={pdfData} />
                </Box>
              </Box>
            </Box>
          )}
        </Grid>
        {(file?.kickedOut || file?.kickedOut == null) && (
          <Grid
            xs={2}
            sx={{
              display: "flex",
              flexDirection: "column",
              padding: 2,
              borderLeft: "1px solid #ccc",
              height: "100%",
              backgroundColor: "background.paper",
            }}
          >
            <Typography>Split PDF</Typography>
            <Input
              placeholder="Page Numbers (e.g. 1,2,5)"
              value={pageNumbers}
              onChange={(e) => setPageNumbers(e.target.value)}
              sx={{ mt: 2 }}
            />
            {success === true && (
              <Button
                variant="solid"
                color="success"
                sx={{ mt: 2 }}
                endDecorator={<CheckCircle />}
              >
                Success
              </Button>
            )}
            {success === false && (
              <Button
                variant="solid"
                color="danger"
                onClick={() => setSuccess(null)}
                endDecorator={<CancelIcon />}
                sx={{ mt: 2 }}
              >
                Failed, Try Again
              </Button>
            )}
            {success === null && (
              <Button
                onClick={handleSplit}
                variant="solid"
                color="primary"
                sx={{ mt: 2 }}
              >
                Split and Reprocess
              </Button>
            )}
            {/* Display splitPages or any additional split logic here */}
          </Grid>
        )}
      </Grid>
    </Drawer>
  );
}
