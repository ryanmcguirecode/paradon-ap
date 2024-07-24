import * as React from "react";
import Button from "@mui/joy/Button";
import { styled, Box } from "@mui/joy";
import { useEffect, useState } from "react";
import Papa from "papaparse";
import DriveFolderUploadIcon from "@mui/icons-material/DriveFolderUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const VisuallyHiddenInput = styled("input")`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  white-space: nowrap;
  width: 1px;
`;

export default function CsvUpload({
  onDataParsed,
  disabled,
}: {
  onDataParsed: any;
  disabled: boolean;
}) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type !== "text/csv") {
      setError("Please upload a valid CSV file");
      return;
    }
    setFile(selectedFile);
    setError(null);

    if (selectedFile) {
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          onDataParsed(results.data);
        },
        error: (err) => {
          setError(`Error parsing file: ${err.message}`);
        },
      });
    }
  };

  useEffect(() => {
    return () => {
      setFile(null);
    };
  }, [disabled]);

  return !file ? (
    <Box>
      <Button
        component="label"
        tabIndex={-1}
        variant="outlined"
        color="neutral"
        startDecorator={<DriveFolderUploadIcon />}
        disabled={disabled}
        sx={{ width: "auto", minWidth: "200px" }}
      >
        Upload a file
        <VisuallyHiddenInput
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          disabled={disabled}
        />
      </Button>
    </Box>
  ) : (
    <Box>
      <Button
        component="label"
        tabIndex={-1}
        color="success"
        startDecorator={<CheckCircleIcon />}
        sx={{ width: "auto", minWidth: "200px" }}
      >
        {file.name}
      </Button>
    </Box>
  );
}
