"use client";

import { useEffect, useState } from "react";
import { RgbColorPicker } from "react-colorful";

import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Option,
  Select,
  Tab,
  tabClasses,
  TabList,
  TabPanel,
  Tabs,
  Typography,
} from "@mui/joy";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import InfoOutlined from "@mui/icons-material/InfoOutlined";

import { useAuth } from "@/components/AuthContext";
import { azureInvoiceFields, Document, DocumentField } from "@/types/Document";

interface InputPropertyProps {
  label: string;
  value?: string;
  maxWidth?: string;
  disabled?: boolean;
  indentation?: number;
}

function InputProperty({
  label,
  value = null,
  maxWidth = null,
  disabled = false,
  indentation = 0,
}: InputPropertyProps) {
  const error = false;

  return (
    <FormControl error={error} sx={{ marginLeft: indentation * 20 + "px" }}>
      <FormLabel>{label}</FormLabel>
      <Input
        disabled={disabled}
        defaultValue={value}
        sx={{
          maxWidth: maxWidth ? maxWidth : "auto",
        }}
      ></Input>
      {error && (
        <FormHelperText>
          <InfoOutlined />
          Oops! something is wrong.
        </FormHelperText>
      )}
    </FormControl>
  );
}

interface SelectPropertyProps {
  label: string;
  value?: string;
  options: string[];
  disabled?: boolean;
  indentation?: number;
}

function SelectProperty({
  label,
  value,
  options,
  disabled = false,
  indentation = 0,
}: SelectPropertyProps) {
  const error = false;

  return (
    <FormControl error={error} sx={{ marginLeft: indentation * 20 + "px" }}>
      <FormLabel>{label}</FormLabel>
      <Select disabled={disabled} defaultValue={value}>
        {options.map((option) => (
          <Option key={option} value={option}>
            {option}
          </Option>
        ))}
      </Select>
      {error && (
        <FormHelperText>
          <InfoOutlined />
          Oops! something is wrong.
        </FormHelperText>
      )}
    </FormControl>
  );
}

function ColorPicker({ initialColor = [235, 64, 52] }) {
  const [color, setColor] = useState({
    r: initialColor[0],
    g: initialColor[1],
    b: initialColor[2],
  });
  return (
    <>
      <Typography level="title-sm">Field Color</Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          marginTop: "10px",
        }}
      >
        <Box sx={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
          <Input
            type="number"
            value={color.r}
            onChange={(e) => {
              setColor({ ...color, r: parseInt(e.target.value) });
            }}
            sx={{ maxWidth: "75px" }}
          />
          <Input
            type="number"
            value={color.g}
            onChange={(e) => {
              setColor({ ...color, g: parseInt(e.target.value) });
            }}
            sx={{ maxWidth: "75px" }}
          />
          <Input
            type="number"
            value={color.b}
            onChange={(e) => {
              setColor({ ...color, b: parseInt(e.target.value) });
            }}
            sx={{ maxWidth: "75px" }}
          />
          <Box
            sx={{
              width: "36px",
              height: "36px",
              borderRadius: "5px",
              backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})`,
            }}
          />
        </Box>
        <Box sx={{ marginLeft: "30px" }}>
          <RgbColorPicker color={color} onChange={setColor} />
        </Box>
      </Box>
    </>
  );
}

interface FieldPropertyProps {
  field: DocumentField;
  indentation?: number;
}

function FieldProperty({ field, indentation = 0 }: FieldPropertyProps) {
  return (
    <Accordion sx={{ marginLeft: indentation * 20 + "px" }}>
      <AccordionSummary>{field.displayName}</AccordionSummary>
      <AccordionDetails>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <InputProperty
            label="Field ID"
            value={field.id}
            disabled
            indentation={indentation + 1}
          />
          <InputProperty
            label="Field Display Name"
            value={field.displayName}
            indentation={indentation + 1}
          />
          <SelectProperty
            label="Field Type"
            value={field.kind}
            options={[null, "string", "number", "date", "currency"]}
            indentation={indentation + 1}
          />
          <Box sx={{ marginLeft: (indentation + 1) * 20 + "px" }}>
            <ColorPicker initialColor={field.color} />
          </Box>
          {field.modelField && (
            <SelectProperty
              label="Model Field"
              value={field.modelField}
              options={Object.keys(azureInvoiceFields)}
              indentation={indentation + 1}
            />
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}

function DocumentConfig(document: Document) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        height: "100%",
      }}
    >
      <Typography level="h4">Document</Typography>
      <InputProperty
        label="Document ID"
        value={document.id}
        disabled
        indentation={1}
      />
      <InputProperty
        label="Display Name"
        value={document.displayName}
        indentation={1}
      />
      <SelectProperty
        label="Model"
        value={document.model}
        options={[null, "azure-invoice"]}
        indentation={1}
      />
      <Typography level="h4">Fields</Typography>
      <AccordionGroup>
        {document.fields.map((field) => (
          <FieldProperty field={field} indentation={1} />
        ))}
        <Accordion sx={{ marginLeft: 1 * 20 + "px" }}>
          <AccordionSummary>
            <Typography
              endDecorator={<AddCircleOutlineOutlinedIcon />}
              sx={{ color: "primary.500" }}
            >
              Add New Field
            </Typography>
          </AccordionSummary>

          <AccordionDetails>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <InputProperty label="Field ID" indentation={2} />
              <InputProperty label="Field Display Name" indentation={2} />
              <SelectProperty
                label="Field Type"
                options={[null, "string", "number", "date", "currency"]}
                indentation={2}
              />
              <Box sx={{ marginLeft: 2 * 20 + "px" }}>
                <ColorPicker />
              </Box>
              <SelectProperty
                label="Model Field"
                options={Object.keys(azureInvoiceFields)}
                indentation={2}
              />
            </Box>
          </AccordionDetails>
        </Accordion>
      </AccordionGroup>
    </Box>
  );
}

export default function DocumentsTab() {
  const [documentTypes, setDocumentTypes] = useState<Array<Document>>([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);

  async function getOrganizationDocuments() {
    try {
      setDocumentsLoading(true);
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
      setDocumentTypes(data);
      setDocumentsLoading(false);
    } catch (error) {
      //   setError(true);
      //   setErrorMessage("Error fetching users");
      console.error("Error fetching users: ", error);
    }
  }

  const { user, loading, level, organization } = useAuth();

  useEffect(() => {
    if (organization) {
      getOrganizationDocuments();
    }
  }, [organization]);

  if (documentsLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          paddingTop: "20%",
        }}
      >
        <CircularProgress variant="outlined" />
      </Box>
    );
  }

  return (
    <Tabs
      size="lg"
      orientation="vertical"
      sx={{
        height: "100%",
        backgroundColor: "transparent",
      }}
    >
      <TabList
        sx={{
          [`& .${tabClasses.root}`]: {
            fontSize: "md",
            fontWeight: "lg",
            [`&[aria-selected="true"]`]: {
              bgcolor: "background.surface",
            },
            [`&.${tabClasses.focusVisible}`]: {
              outlineOffset: "-4px",
            },
          },
        }}
      >
        {documentTypes.map((document, index) => (
          <Tab key={document.id}>{document.displayName}</Tab>
        ))}
        <Tab sx={{ color: "primary.500" }}>
          Create New <AddCircleOutlineOutlinedIcon />
        </Tab>
      </TabList>

      {documentTypes.map((document, index) => (
        <TabPanel
          key={document.id}
          value={index}
          sx={{
            overflow: "scroll",
          }}
        >
          {DocumentConfig(document)}
        </TabPanel>
      ))}
      <TabPanel
        value={documentTypes.length}
        sx={{
          overflow: "scroll",
        }}
      >
        {}
      </TabPanel>
    </Tabs>
  );
}
