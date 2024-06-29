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

function formatDateString(dateString: string) {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return new Intl.DateTimeFormat("en-US", options).format(date);
}

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
          {"Batch " + batch.batchId}
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
        {/* <Typography
          level="body-sm"
          textAlign="center"
          sx={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {formatDateString(batch.dateCreated)}
        </Typography> */}
      </Box>
    </Button>
  );
}

export default function BatchesPage() {
  const router = useRouter();
  const { user, loading, level, organization } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [currentFilters, setCurrentFilters] = useState<any>({
    batchType: null,
    createdFromDate: null,
    createdToDate: null,
    isFull: null,
    isCheckedOut: null,
  });
  const [batchType, setBatchType] = useState<string | null>(null);
  const [createdFromDate, setCreatedFromDate] = useState<string | null>(null);
  const [createdToDate, setCreatedToDate] = useState<string | null>(null);
  const [isFull, setIsFull] = useState<boolean | null>(null);
  const [isCheckedOut, setIsCheckedOut] = useState<boolean | null>(null);

  const canFilter =
    currentFilters.batchType !== batchType ||
    currentFilters.createdFromDate !== createdFromDate ||
    currentFilters.createdToDate !== createdToDate ||
    currentFilters.isFull !== isFull ||
    currentFilters.isCheckedOut !== isCheckedOut;

  const getFilteredBatches = (
    offset: number,
    filters: any = currentFilters,
    append: boolean = false
  ) => {
    fetch(
      `/api/get-batches?` +
        (batchType ? `&batchType=${filters.batchType}` : "") +
        (createdFromDate ? `&createdFromDate=${filters.createdFromDate}` : "") +
        (createdToDate ? `&createdToDate=${filters.createdToDate}` : "") +
        (isFull != null ? `&isFull=${filters.isFull}` : "") +
        (isCheckedOut != null ? `&isCheckedOut=${filters.isCheckedOut}` : "") +
        `&organization=${organization}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (append) {
          setBatches(batches.concat(data));
        } else {
          setBatches(data);
        }
      });
  };

  useEffect(() => {
    if (!loading) {
      getFilteredBatches(0);
    }
  }, [loading]);

  return (
    <NavigationLayout>
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
          <FormLabel sx={{ paddingBottom: "5px" }}>Batch Type</FormLabel>
          <Select
            defaultValue={null}
            onChange={(e, value: string | null) => {
              setBatchType(value);
            }}
          >
            <Option key="all" value={null}>
              Any
            </Option>
            <Option key="A-L" value="A-L">
              A-L
            </Option>
            <Option key="M-Z" value="M-Z">
              M-Z
            </Option>
            <Option key="credit" value="Credit">
              Credit
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
        <Button
          disabled={!canFilter}
          onClick={() => {
            const newFilters = {
              batchType: batchType,
              createdFromDate: createdFromDate,
              createdToDate: createdToDate,
              isFull: isFull,
              isCheckedOut: isCheckedOut,
            };
            setCurrentFilters(newFilters);
            getFilteredBatches(0, newFilters);
          }}
        >
          Filter
        </Button>
      </Box>
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            paddingTop: "10px",
          }}
        >
          <CircularProgress variant="outlined" />
        </Box>
      ) : (
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
      )}
    </NavigationLayout>
  );
}
