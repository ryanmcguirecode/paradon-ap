// TODO: Make more general and configurable

import { useEffect, useState } from "react";

import {
  Drawer,
  ModalClose,
  Box,
  Tab,
  Tabs,
  TabList,
  TabPanel,
  tabClasses,
  Typography,
  Sheet,
} from "@mui/joy";

interface FileViewPopupProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  filename: string | null;
}

export default function FileViewPopup({
  open,
  setOpen,
  filename,
}: FileViewPopupProps) {
  const [pdfUrl, setPdfUrl] = useState<string>("");

  useEffect(() => {
    const fetchPdf = async () => {
      if (!filename) {
        return;
      }
      try {
        const response = await fetch(`/api/get-pdf?filename=${filename}`);
        if (!response.ok) {
          throw new Error("Failed to fetch PDF");
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (error) {
        console.error("Error fetching PDF:", error);
      }
    };

    fetchPdf();
  }, [filename]);

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
      {open && (
        <iframe
          src={pdfUrl}
          style={{
            flex: 1,
            paddingTop: "55px",
            paddingLeft: "40px",
            paddingRight: "40px",
          }}
        />
      )}
    </Drawer>
  );
}
