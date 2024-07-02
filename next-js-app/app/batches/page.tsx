"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import FolderCopyOutlinedIcon from "@mui/icons-material/FolderCopyOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import { Batch } from "@/types/Batch";
import NavigationLayout from "@/components/NavigationLayout";
import { useAuth } from "@/components/AuthContext";

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
}

function BatchComponent({ batch, onClick }: BatchComponentProps) {
  return (
    <Button
      color="neutral"
      variant="plain"
      disabled={batch.isCheckedOut}
      onClick={onClick}
      sx={{
        marginLeft: "60px",
        marginBottom: "20px",
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
  );
}

export default function BatchesPage() {
  const router = useRouter();
  const { user, loading, level, organization } = useAuth();

  const [documentsLoading, setDocumentsLoading] = useState<boolean>(false);

  const [batches, setBatches] = useState<Batch[]>([]);
  const [currentFilters, setCurrentFilters] = useState<any>({
    createdFromDate: null,
    createdToDate: null,
    isFull: null,
    isCheckedOut: null,
  });
  const [createdFromDate, setCreatedFromDate] = useState<string | null>(null);
  const [createdToDate, setCreatedToDate] = useState<string | null>(null);
  const [isFull, setIsFull] = useState<boolean | null>(null);
  const [isCheckedOut, setIsCheckedOut] = useState<boolean | null>(null);

  const canFilter =
    currentFilters.createdFromDate !== createdFromDate ||
    currentFilters.createdToDate !== createdToDate ||
    currentFilters.isFull !== isFull ||
    currentFilters.isCheckedOut !== isCheckedOut;

  const getFilteredBatches = (
    offset: number,
    filters: any = currentFilters,
    append: boolean = false
  ) => {
    const url = new URL("/api/get-batches", window.location.origin);
    url.searchParams.append("createdFromDate", filters.createdFromDate);
    url.searchParams.append("createdToDate", filters.createdToDate);
    url.searchParams.append("isCheckedOut", filters.isCheckedOut);
    url.searchParams.append("isFinished", filters.isFinished);
    url.searchParams.append("isFull", filters.isFull);
    url.searchParams.append("organization", organization);
    url.searchParams.append("offset", offset.toString());

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
              onChange={(e, value: boolean | null) => setIsFull(value)}
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
              onChange={(e, value: boolean | null) => setIsCheckedOut(value)}
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
              onChange={(e) => {
                setCreatedFromDate(e.target.value);
              }}
            ></Input>
          </Box>
          <Box>
            <FormLabel sx={{ paddingBottom: "5px" }}>Created To</FormLabel>
            <Input
              type="date"
              onChange={(e) => {
                setCreatedToDate(e.target.value);
              }}
            ></Input>
          </Box>
          <Button
            disabled={!canFilter}
            onClick={() => {
              const newFilters = {
                createdFromDate: createdFromDate,
                createdToDate: createdToDate,
                isCheckedOut: isCheckedOut,
                // isFinished: isFinished,
                isFull: isFull,
              };
              setCurrentFilters(newFilters);
              getFilteredBatches(0, newFilters);
            }}
          >
            Filter
          </Button>
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
