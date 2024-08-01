"use client";

import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

import {
  AspectRatio,
  Box,
  Button,
  CircularProgress,
  FormLabel,
  Input,
  Option,
  Select,
  Typography,
} from "@mui/joy";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";

import NavigationLayout from "@/components/NavigationLayout";
import FileViewPopup from "@/components/FileViewPopup";
import Document from "@/types/Document";
import { useAuth } from "@/components/AuthContext";

function formatDate(date: string | null) {
  if (!date) {
    return "";
  }
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return new Intl.DateTimeFormat("en-US", options).format(
    new Date(date.split("T")[0])
  );
}

function getPreviewImage(filename: string) {
  return (
    <AspectRatio
      variant="plain"
      minHeight="50px"
      maxHeight="50px"
      sx={{ backgroundColor: "transparent" }}
    >
      <DescriptionOutlinedIcon />
    </AspectRatio>
  );
}

const FILES_PER_QUERY = 200;

export default function DocumentsPage() {
  const { user, loading, level, organization } = useAuth();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState<boolean>(true);
  const [moreDocuments, setMoreDocuments] = useState<boolean>(true);
  const [openFile, setOpenFile] = useState<string | null>(null);
  const [fileViewPopupOpen, setFileViewPopupOpen] = useState(false);

  const [currentFilters, setCurrentFilters] = useState<any>({
    // documentType: null,
    reviewed: true,
    createdFromDate: null,
    createdToDate: null,
    filename: null,
  });
  // const [documentType, setDocumentType] = useState<string | null>(null);
  const [reviewed, setReviewed] = useState<boolean | null>(true);
  const [createdFromDate, setCreatedFromDate] = useState<string | null>(null);
  const [createdToDate, setCreatedToDate] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);

  const canFilter =
    // currentFilters.documentType !== documentType ||
    currentFilters.reviewed !== reviewed ||
    currentFilters.createdFromDate !== createdFromDate ||
    currentFilters.createdToDate !== createdToDate ||
    currentFilters.filename !== filename;

  const getFilteredDocuments = (
    offset: number,
    filters: any = currentFilters,
    append: boolean = false
  ) => {
    const url = new URL("/api/get-documents", window.location.origin);
    url.searchParams.append("organization", organization);
    url.searchParams.append("limit", String(FILES_PER_QUERY));
    url.searchParams.append("offset", String(offset));
    url.searchParams.append("reviewed", String(filters.reviewed));
    url.searchParams.append("createdFromDate", filters.createdFromDate);
    url.searchParams.append("createdToDate", filters.createdToDate);
    url.searchParams.append("filename", filters.filename);

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (append) {
          setDocuments(documents.concat(data));
        } else {
          setDocuments(data);
        }
        if (data.length < FILES_PER_QUERY) {
          setMoreDocuments(false);
        } else {
          setMoreDocuments(true);
        }
      })
      .then(() => setLoadingDocuments(false));
  };

  const fetchMoreData = () => {
    getFilteredDocuments(documents.length, currentFilters, true);
  };

  useEffect(() => {
    if (!loading) {
      getFilteredDocuments(0);
    }
  }, [loading]);

  let documentsDisplayComponent = null;
  if (loadingDocuments) {
    documentsDisplayComponent = (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          paddingTop: "30px",
        }}
      >
        <CircularProgress variant="outlined" />
      </Box>
    );
  } else if (documents.length === 0) {
    documentsDisplayComponent = (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          paddingTop: "50px",
        }}
      >
        <Typography level="body-lg">No documents found</Typography>
      </Box>
    );
  } else {
    documentsDisplayComponent = (
      <div
        id="scrollableDiv"
        style={{
          flex: 1,
          overflow: "auto",
          margin: "auto",
          paddingTop: "20px",
          paddingBottom: "20px",
        }}
      >
        <InfiniteScroll
          dataLength={documents.length}
          next={fetchMoreData}
          hasMore={moreDocuments}
          loader={
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                paddingTop: "10px",
              }}
            >
              <CircularProgress variant="outlined" />
            </Box>
          }
          scrollableTarget="scrollableDiv"
        >
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              width: "80%",
              margin: "auto",
            }}
          >
            {documents.map((file, index) => (
              <Box
                key={index}
                onClick={() => {
                  setOpenFile(file.filename);
                  setFileViewPopupOpen(true);
                }}
                sx={{
                  marginBottom: "20px",
                  width: "135px",
                  borderRadius: "10px",
                  margin: "4px",
                  "&:hover": {
                    backgroundColor: "rgb(243, 246, 252)",
                    transition: "background-color 0.3s ease",
                    cursor: "pointer",
                  },
                }}
              >
                {getPreviewImage(file.filename)}
                <Typography
                  level="title-sm"
                  textAlign="center"
                  sx={{
                    marginTop: "10px",
                    overflowWrap: "break-word",
                    wordWrap: "break-word",
                  }}
                >
                  {file.filename}
                </Typography>
                <Typography
                  level="body-xs"
                  textAlign="center"
                  sx={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {file.documentType
                    ? file.documentType.toLocaleUpperCase()
                    : ""}
                </Typography>
                <Typography
                  level="body-xs"
                  textAlign="center"
                  sx={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {formatDate(file.timeCreated)}
                </Typography>
              </Box>
            ))}
          </Box>
        </InfiniteScroll>
      </div>
    );
  }

  return (
    <>
      <FileViewPopup
        open={fileViewPopupOpen}
        setOpen={setFileViewPopupOpen}
        filename={openFile}
      />
      <NavigationLayout>
        <Box
          sx={{ display: "flex", flexDirection: "column", maxHeight: "100%" }}
        >
          <Box
            sx={{
              width: "100%",
              display: "flex",
              gap: "30px",
              justifyContent: "center",
              alignItems: "flex-end",
              margin: "auto",
              padding: "10px",
              paddingBottom: "25px",
              boxShadow: "sm",
            }}
          >
            {/* <Box>
              <FormLabel sx={{ paddingBottom: "5px" }}>Document Type</FormLabel>
              <Select
                defaultValue={null}
                onChange={(e, value: string | null) => {
                  setDocumentType(value);
                }}
              >
                <Option key="any" value={null}>
                  Any
                </Option>
                <Option key="invoice" value="invoice">
                  Invoice
                </Option>
                <Option key="credit" value="credit">
                  Credit
                </Option>
              </Select>
            </Box> */}
            <Box>
              <FormLabel sx={{ paddingBottom: "5px" }}>Reviewed</FormLabel>
              <Select
                defaultValue={true}
                onChange={(e, value: boolean | null) => {
                  setReviewed(value);
                }}
              >
                <Option key="any" value={null}>
                  Any
                </Option>
                <Option key="yes" value={true}>
                  Yes
                </Option>
                <Option key="no" value={false}>
                  No
                </Option>
              </Select>
            </Box>
            <Box>
              <FormLabel sx={{ paddingBottom: "5px" }}>From</FormLabel>
              <Input
                type="date"
                onChange={(e) => {
                  setCreatedFromDate(e.target.value);
                }}
              />
            </Box>
            <Box>
              <FormLabel sx={{ paddingBottom: "5px" }}>To</FormLabel>
              <Input
                type="date"
                onChange={(e) => {
                  setCreatedToDate(e.target.value);
                }}
              />
            </Box>
            <Box>
              <FormLabel sx={{ paddingBottom: "5px" }}>Filename</FormLabel>
              <Input
                onChange={(e) => {
                  setFilename(e.target.value);
                }}
              />
            </Box>
            <Button
              disabled={!canFilter}
              onClick={() => {
                const newFilters = {
                  // documentType: documentType,
                  reviewed: reviewed,
                  createdFromDate: createdFromDate,
                  createdToDate: createdToDate,
                  filename: filename,
                };
                setCurrentFilters(newFilters);
                getFilteredDocuments(0, newFilters);
              }}
            >
              Filter
            </Button>
          </Box>
          {documentsDisplayComponent}
        </Box>
      </NavigationLayout>
    </>
  );
}
