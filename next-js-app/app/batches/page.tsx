"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AspectRatio,
  Box,
  Button,
  CircularProgress,
  FormLabel,
  IconButton,
  Input,
  Option,
  Select,
  Typography,
} from "@mui/joy";
import LockOpen from "@mui/icons-material/LockOpen";

import FolderCopyOutlinedIcon from "@mui/icons-material/FolderCopyOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import { Batch } from "@/types/Batch";
import NavigationLayout from "@/components/NavigationLayout";
import { useAuth } from "@/components/AuthContext";
import ArrowDownward from "@mui/icons-material/ArrowDownward";
import ArrowUpward from "@mui/icons-material/ArrowUpward";
import { auth } from "firebase-admin";

function getPreviewImage(isCheckedOut: boolean | null) {
  return (
    <AspectRatio
      variant="plain"
      minHeight="55px"
      maxHeight="55px"
      sx={{ backgroundColor: "transparent" }}
    >
      {isCheckedOut ? <LockOutlinedIcon /> : <FolderCopyOutlinedIcon />}
    </AspectRatio>
  );
}

function formatDateString(dateString: string) {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return new Intl.DateTimeFormat("en-US", options).format(date);
}

interface BatchComponentProps {
  batch: Batch;
  onClick?: () => void;
  disabled?: boolean;
  auth: AuthContext;
  refreshPage: () => void;
}

function BatchComponent({
  batch,
  onClick,
  auth,
  refreshPage,
}: BatchComponentProps) {
  const [isHovered, setIsHovered] = useState(false);

  const onUnlock = () => {
    const url = new URL("/api/release-batch", window.location.origin);
    url.searchParams.append("batchId", batch.batchId);

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        batchId: batch.batchId,
        callerId: auth.user.email,
        organization: auth.organization,
      }),
    }).then(() => {
      refreshPage();
    });
  };

  if (auth.level === "admin" && batch.isCheckedOut && isHovered) {
    return (
      <Box
        sx={{
          display: "inline-flex",
          marginLeft: "60px",
          marginBottom: "20px",
          position: "relative",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Button
          color="neutral"
          variant="plain"
          onClick={onUnlock}
          sx={{
            borderRadius: "15px",
            padding: "10px",
            width: "140px",
            opacity: 1,
          }}
        >
          <Box sx={{ maxWidth: "100%" }}>
            <AspectRatio
              variant="plain"
              minHeight="55px"
              maxHeight="55px"
              sx={{ backgroundColor: "transparent" }}
            >
              <LockOpen />
            </AspectRatio>
            <Typography
              level="title-md"
              textAlign="center"
              sx={{
                marginTop: "5px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {batch.batchName}
            </Typography>
            <Typography
              level="body-sm"
              textAlign="center"
              sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {batch.documentCount + " documents"}
            </Typography>
            <Typography
              level="body-sm"
              textAlign="center"
              sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {formatDateString(batch.timeCreated)}
            </Typography>
          </Box>
        </Button>
      </Box>
    );
  } else {
    return (
      <Box
        sx={{
          display: "inline-flex",
          marginLeft: "60px",
          marginBottom: "20px",
          position: "relative",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Button
          color="neutral"
          variant="plain"
          disabled={batch.isCheckedOut}
          onClick={onClick}
          sx={{
            borderRadius: "15px",
            padding: "10px",
            width: "140px",
            opacity: batch.isCheckedOut ? 0.6 : 1,
          }}
        >
          <Box sx={{ maxWidth: "100%" }}>
            {getPreviewImage(batch.isCheckedOut)}
            <Typography
              level="title-md"
              textAlign="center"
              sx={{
                marginTop: "5px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {batch.batchName}
            </Typography>
            <Typography
              level="body-sm"
              textAlign="center"
              sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {batch.documentCount + " documents"}
            </Typography>
            <Typography
              level="body-sm"
              textAlign="center"
              sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {formatDateString(batch.timeCreated)}
            </Typography>
          </Box>
        </Button>
      </Box>
    );
  }
}

interface AuthContext {
  user: any;
  loading: boolean;
  level: string;
  organization: string;
}

export default function BatchesPage() {
  const router = useRouter();
  const { user, loading, level, organization } = useAuth();

  const [documentsLoading, setDocumentsLoading] = useState<boolean>(false);

  const [batches, setBatches] = useState<Batch[]>([]);
  const [descending, setDescending] = useState<boolean>(false);
  const [currentFilters, setCurrentFilters] = useState<any>({
    createdFromDate: null,
    createdToDate: null,
    isFull: null,
    isCheckedOut: null,
  });

  const getFilteredBatches = (
    offset: number,
    filters: any = currentFilters,
    append: boolean = false,
    desc: boolean = false
  ) => {
    const url = new URL("/api/get-batches", window.location.origin);
    url.searchParams.append("createdFromDate", filters.createdFromDate);
    url.searchParams.append("createdToDate", filters.createdToDate);
    url.searchParams.append("isCheckedOut", filters.isCheckedOut);
    url.searchParams.append("isFinished", filters.isFinished);
    url.searchParams.append("isFull", filters.isFull);
    url.searchParams.append("organization", organization);
    url.searchParams.append("offset", offset.toString());
    url.searchParams.append("descending", desc.toString());

    setDocumentsLoading(true);

    fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (append) {
          setBatches(batches.concat(data));
        } else {
          setBatches(data);
        }
      })
      .then(() => setDocumentsLoading(false));
  };

  useEffect(() => {
    if (!loading) {
      getFilteredBatches(0);
    }
  }, [loading]);

  let batchDisplayComponent = null;
  if (documentsLoading) {
    batchDisplayComponent = (
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
  } else if (batches.length === 0) {
    batchDisplayComponent = (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          paddingTop: "50px",
        }}
      >
        <Typography level="body-lg">No batches found</Typography>
      </Box>
    );
  } else {
    batchDisplayComponent = (
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          width: "80%",
          margin: "auto",
        }}
      >
        {batches.map((batch, index) => (
          <BatchComponent
            key={index}
            batch={batch}
            onClick={() => router.push(`/review?batchId=${batch.batchId}`)}
            auth={{ user, loading, level, organization }}
            refreshPage={() =>
              getFilteredBatches(0, currentFilters, false, descending)
            }
          />
        ))}
      </Box>
    );
  }

  return (
    <NavigationLayout disabled={false}>
      <Box sx={{ display: "flex", flexDirection: "column", maxHeight: "100%" }}>
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
          <Box>
            <FormLabel sx={{ paddingBottom: "5px" }}>Full</FormLabel>
            <Select
              defaultValue={null}
              value={currentFilters.isFull}
              onChange={(e, value: boolean | null) => {
                const newFilters = {
                  ...currentFilters,
                  isFull: value,
                };
                getFilteredBatches(0, newFilters, false, descending);
                setCurrentFilters(newFilters);
              }}
            >
              <Option key="all" value={null}>
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
            <FormLabel sx={{ paddingBottom: "5px" }}>Checked Out</FormLabel>
            <Select
              defaultValue={null}
              value={currentFilters.isCheckedOut}
              onChange={(e, value: boolean | null) => {
                const newFilters = {
                  ...currentFilters,
                  isCheckedOut: value,
                };
                getFilteredBatches(0, newFilters, false, descending);
                setCurrentFilters(newFilters);
              }}
            >
              <Option key="all" value={null}>
                Any
              </Option>
              <Option key="yes" value="true">
                Yes
              </Option>
              <Option key="no" value="false">
                No
              </Option>
            </Select>
          </Box>
          <Box>
            <FormLabel sx={{ paddingBottom: "5px" }}>Created From</FormLabel>
            <Input
              type="date"
              value={currentFilters.createdFromDate}
              onChange={(e) => {
                const newFilters = {
                  ...currentFilters,
                  createdFromDate: e.target.value,
                };
                getFilteredBatches(0, newFilters, false, descending);
                setCurrentFilters(newFilters);
              }}
            ></Input>
          </Box>
          <Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "auto",
              }}
            >
              <FormLabel sx={{ paddingBottom: "5px" }}>Created To</FormLabel>
              <IconButton
                size="sm"
                sx={{
                  pb: "5px",
                  ":hover": {
                    backgroundColor: "transparent",
                  },
                }}
              >
                {descending ? (
                  <ArrowDownward
                    fontSize="small"
                    onClick={() => {
                      setDescending(false);
                      getFilteredBatches(0, currentFilters, false, !descending);
                    }}
                  />
                ) : (
                  <ArrowUpward
                    fontSize="small"
                    onClick={() => {
                      setDescending(true);
                      getFilteredBatches(0, currentFilters, false, !descending);
                    }}
                  />
                )}
              </IconButton>
            </Box>
            <Input
              type="date"
              value={currentFilters.createdToDate}
              onChange={(e) => {
                const newFilters = {
                  ...currentFilters,
                  createdToDate: e.target.value,
                };
                getFilteredBatches(0, newFilters);
                setCurrentFilters(newFilters);
              }}
            ></Input>
          </Box>
          {/* broken */}{" "}
          {/* <Button
            disabled={!canClear}
            onClick={() => {
              const newFilters = {
                createdFromDate: null,
                createdToDate: null,
                isCheckedOut: null,
                // isFinished: isFinished,
                isFull: null,
              };
              setCurrentFilters(newFilters);
              getFilteredBatches(0, newFilters);
            }}
          >
            Clear
          </Button> */}
        </Box>
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            margin: "auto",
            paddingTop: "20px",
            paddingBottom: "20px",
          }}
        >
          {batchDisplayComponent}
        </Box>
      </Box>
    </NavigationLayout>
  );
}
