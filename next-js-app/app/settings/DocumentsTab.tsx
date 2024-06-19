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
  onChange?: (value: string) => void;
  maxWidth?: string;
  disabled?: boolean;
  indentation?: number;
}

function InputProperty({
  label,
  value = null,
  onChange = (s) => {},
  maxWidth = null,
  disabled = false,
  indentation = 0,
}: InputPropertyProps) {
  const error = false;

  return (
    <FormControl error={error} sx={{ marginLeft: indentation * 20 + "px" }}>
      <FormLabel>{label}</FormLabel>
      <Input
        onChange={(e) => {
          onChange(e.target.value);
        }}
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
  onChange?: (value: string) => void;
  options: string[];
  disabled?: boolean;
  indentation?: number;
}

function SelectProperty({
  label,
  value,
  onChange = (s) => {},
  options,
  disabled = false,
  indentation = 0,
}: SelectPropertyProps) {
  const error = false;

  return (
    <FormControl error={error} sx={{ marginLeft: indentation * 20 + "px" }}>
      <FormLabel>{label}</FormLabel>
      <Select
        disabled={disabled}
        defaultValue={value}
        onChange={(e, value) => {
          onChange(value);
        }}
      >
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

interface ColorPickerProps {
  initialColor?: [number, number, number];
  onChange?: (color: [number, number, number]) => void;
  indentation?: number;
}

function ColorPicker({
  initialColor = [235, 64, 52],
  onChange = (color: [number, number, number]) => {},
  indentation = 0,
}) {
  const [color, setColor] = useState({
    r: initialColor[0],
    g: initialColor[1],
    b: initialColor[2],
  });
  return (
    <Box sx={{ marginLeft: indentation * 20 + "px" }}>
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
              const value = parseInt(e.target.value);
              setColor({ ...color, r: value });
              onChange([value, color.g, color.b]);
            }}
            sx={{ maxWidth: "75px" }}
          />
          <Input
            type="number"
            value={color.g}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              setColor({ ...color, g: value });
              onChange([color.r, value, color.b]);
            }}
            sx={{ maxWidth: "75px" }}
          />
          <Input
            type="number"
            value={color.b}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              setColor({ ...color, b: value });
              onChange([color.r, color.g, value]);
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
        <Box sx={{ marginLeft: "25px", marginBottom: "15px" }}>
          <RgbColorPicker
            color={color}
            onChange={(color) => {
              setColor(color);
              onChange([color.r, color.g, color.b]);
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}

interface FieldPropertyProps {
  field: DocumentField;
  onChange?: (field: DocumentField) => void;
  indentation?: number;
}

function FieldProperty({
  field,
  onChange = (field) => {},
  indentation = 0,
}: FieldPropertyProps) {
  let id: string,
    displayName: string,
    kind: "string" | "number" | "date" | "currency" | null,
    color: [number, number, number],
    modelField: string | null;

  if (!field) {
    id = "";
    displayName = "";
    kind = null;
    color = [235, 64, 52];
    modelField = null;
  } else {
    id = field.id;
    displayName = field.displayName;
    kind = field.kind;
    color = field.color;
    modelField = field.modelField || null;
  }

  return (
    <Accordion sx={{ marginLeft: indentation * 20 + "px" }}>
      <AccordionSummary>
        {displayName || (
          <Typography
            endDecorator={<AddCircleOutlineOutlinedIcon />}
            sx={{
              color: "primary.500",
            }}
          >
            Create New Field
          </Typography>
        )}
      </AccordionSummary>
      <AccordionDetails>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            paddingTop: "10px",
            paddingBottom: "20px",
          }}
        >
          <InputProperty
            label="Field ID"
            value={id}
            onChange={(value) => {
              onChange({
                ...field,
                id: value,
              });
            }}
            disabled={field !== null}
            indentation={indentation + 1}
          />
          <InputProperty
            label="Field Display Name"
            value={displayName}
            onChange={(value) => {
              onChange({
                ...field,
                displayName: value,
              });
            }}
            indentation={indentation + 1}
          />
          <SelectProperty
            label="Field Type"
            value={kind}
            onChange={(value) => {
              onChange({
                ...field,
                kind: value as "string" | "number" | "date" | "currency", // TODO: Fix this
              });
            }}
            options={[null, "string", "number", "date", "currency"]}
            indentation={indentation + 1}
          />

          <ColorPicker
            initialColor={color}
            onChange={(color) => {
              onChange({
                ...field,
                color: color,
              });
            }}
            indentation={indentation + 1}
          />
          <SelectProperty
            label="Model Field"
            value={modelField}
            onChange={(value) => {
              onChange({
                ...field,
                modelField: value as typeof field.modelField, // TODO: Fix this
              });
            }}
            options={Object.keys(azureInvoiceFields)}
            indentation={indentation + 1}
          />
          {field === null && (
            <Button
              size="md"
              color="primary"
              sx={{ margin: "auto", marginTop: "20px" }}
            >
              Create Field
            </Button>
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}

function DocumentConfig(
  document: Document,
  isNew: boolean,
  onChange: (document: Document) => void
) {
  let id: string,
    displayName: string,
    model: "azure-invoice" | null,
    fields: DocumentField[];
  if (!document) {
    id = "";
    displayName = "";
    model = null;
    fields = [];
  } else {
    id = document.id;
    displayName = document.displayName;
    model = document.model || null;
    fields = document.fields || [];
  }

  return (
    <Box
      sx={{
        height: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          height: "100%",
          overflow: "scroll",
        }}
      >
        <Typography level="h4">Document</Typography>
        <InputProperty
          label="Document ID"
          value={id}
          onChange={(value) => {
            onChange({
              ...document,
              id: value,
            });
          }}
          disabled={!isNew}
          indentation={1}
        />
        <InputProperty
          label="Display Name"
          onChange={(value) => {
            onChange({
              ...document,
              displayName: value,
            });
          }}
          value={displayName}
          indentation={1}
        />
        <SelectProperty
          label="Model"
          onChange={(value) => {
            onChange({
              ...document,
              model: value as "azure-invoice" | null, // TODO: Fix this
            });
          }}
          value={model}
          options={[null, "azure-invoice"]}
          indentation={1}
        />
        <Typography level="h4">Fields</Typography>
        <AccordionGroup>
          {fields.map((field, index) => (
            <FieldProperty
              field={field}
              onChange={(field) => {
                onChange({
                  ...document,
                  fields: [
                    ...fields.slice(0, index),
                    field,
                    ...fields.slice(index + 1),
                  ],
                });
              }}
              indentation={1}
            />
          ))}
          {/* <FieldProperty field={null} indentation={1} /> */}
        </AccordionGroup>
      </Box>
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
      data.push(null); // Add a null document for creating new documents
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
    <>
      <Tabs
        size="lg"
        orientation="vertical"
        sx={{
          height: "calc(100% - 90px)",
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
          {documentTypes.map((document, index) =>
            index !== documentTypes.length - 1 ? (
              <Tab key={document.id}>{document.displayName}</Tab>
            ) : (
              <Tab sx={{ color: "primary.500" }}>
                Create New <AddCircleOutlineOutlinedIcon />
              </Tab>
            )
          )}
        </TabList>

        {documentTypes.map((document, index) => (
          <TabPanel key={index} value={index}>
            {DocumentConfig(
              document,
              index === documentTypes.length - 1,
              (document) => {
                setDocumentTypes((documentTypes) => {
                  const newDocumentTypes = [...documentTypes];
                  newDocumentTypes[index] = document;
                  return newDocumentTypes;
                });
                console.log(document);
              }
            )}
          </TabPanel>
        ))}
        {/* <TabPanel value={documentTypes.length}>{DocumentConfig(null)}</TabPanel> */}
      </Tabs>
      <Box
        sx={{
          marginTop: "45px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          justifyContent: "flex-end",
        }}
      >
        <Button size="lg" color="success">
          Save Changes
        </Button>
      </Box>
    </>
  );
}
