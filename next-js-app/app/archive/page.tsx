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
import Document from "@/components/Document";
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

const FILES_PER_QUERY = 50;

export default function DocumentsPage() {
  const { user, loading, level, organization } = useAuth();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [moreDocuments, setMoreDocuments] = useState<boolean>(true);
  const [openFile, setOpenFile] = useState<string | null>(null);
  const [fileViewPopupOpen, setFileViewPopupOpen] = useState(false);

  const [currentFilters, setCurrentFilters] = useState<any>({
    documentType: null,
    reviewed: null,
    fromDate: null,
    toDate: null,
    filename: null,
  });
  const [documentType, setDocumentType] = useState<string | null>(null);
  const [reviewed, setReviewed] = useState<boolean | null>(null);
  const [fromDate, setFromDate] = useState<string | null>(null);
  const [toDate, setToDate] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);

  const canFilter =
    currentFilters.documentType !== documentType ||
    currentFilters.reviewed !== reviewed ||
    currentFilters.fromDate !== fromDate ||
    currentFilters.toDate !== toDate ||
    currentFilters.filename !== filename;

  const getFilteredDocuments = (
    offset: number,
    filters: any = currentFilters,
    append: boolean = false
  ) => {
    var url = `/api/get-documents?limit=${FILES_PER_QUERY}&offset=${offset}`;
    if (documentType) url = url.concat(`&documentType=${filters.documentType}`);
    if (reviewed != null) url.concat(`&reviewed=${filters.reviewed}`);
    if (fromDate) url.concat(`&fromDate=${filters.fromDate}`);
    if (toDate) url.concat(`&toDate=${filters.toDate}`);
    if (filename) url.concat(`&filename=${filters.filename}`);
    url = url.concat(`&organization=${organization}`);

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
      });
  };

  const fetchMoreData = () => {
    getFilteredDocuments(documents.length, currentFilters, true);
  };

  useEffect(() => getFilteredDocuments(0), [loading]);

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
              width: "80%",
              display: "flex",
              gap: "30px",
              justifyContent: "center",
              alignItems: "flex-end",
              margin: "auto",
              padding: "10px",
              paddingBottom: "35px",
            }}
          >
            <Box>
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
            </Box>
            <Box>
              <FormLabel sx={{ paddingBottom: "5px" }}>Reviewed</FormLabel>
              <Select
                defaultValue={null}
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
                  setFromDate(e.target.value);
                }}
              />
            </Box>
            <Box>
              <FormLabel sx={{ paddingBottom: "5px" }}>To</FormLabel>
              <Input
                type="date"
                onChange={(e) => {
                  setToDate(e.target.value);
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
                  documentType: documentType,
                  reviewed: reviewed,
                  fromDate: fromDate,
                  toDate: toDate,
                  filename: filename,
                };
                setCurrentFilters(newFilters);
                getFilteredDocuments(0, newFilters);
              }}
            >
              Filter
            </Button>
          </Box>
          <div
            id="scrollableDiv"
            style={{
              flex: 1,
              overflow: "auto",
              margin: "auto",
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
                        textOverflow: "ellipsis",
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
                      {formatDate(file.timeReceived)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </InfiniteScroll>
          </div>
        </Box>
      </NavigationLayout>
    </>
  );
}
