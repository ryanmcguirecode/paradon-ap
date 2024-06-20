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
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import InfoOutlined from "@mui/icons-material/InfoOutlined";

import { useAuth } from "@/components/AuthContext";
import { azureInvoiceFields, Document, DocumentField } from "@/types/Document";

function idErrorCheck(value: string, usedValues: string[]) {
  if (!value || value.length === 0) {
    return {
      error: true,
      message: "Field ID cannot be empty",
    };
  } else if (value.includes(" ")) {
    return {
      error: true,
      message: "Field ID must contain no spaces",
    };
  } else if (
    usedValues.reduce((count, current) => {
      return current === value ? count + 1 : count;
    }, 0) > 1
  ) {
    return {
      error: true,
      message: "Field ID used more than once",
    };
  }
  return {
    error: false,
    message: "",
  };
}

function displayNameErrorCheck(value: string) {
  if (!value || value.length === 0) {
    return {
      error: true,
      message: "Display Name cannot be empty",
    };
  }
  return {
    error: false,
    message: "",
  };
}

function fieldTypeErrorCheck(value: string) {
  if (!value) {
    return {
      error: true,
      message: "Field Type cannot be empty",
    };
  }
  return {
    error: false,
    message: "",
  };
}

function fieldColorErrorCheck(value: [number, number, number]) {
  if (
    !value ||
    value.length !== 3 ||
    value.some((v) => v === null) ||
    value.some((v) => v < 0 || v > 255)
  ) {
    return {
      error: true,
      message: "Field color values must be between 0 and 255",
    };
  }
  return {
    error: false,
    message: "",
  };
}

function isEmptyDocument(document: Document) {
  return (
    !document.id &&
    !document.displayName &&
    document.fields.length === 1 &&
    isEmptyField(document.fields[0])
  );
}

function isEmptyField(field: DocumentField) {
  return field === null || (!field.id && !field.displayName);
}

function isFieldOk(field: DocumentField) {
  if (isEmptyField(field)) {
    return true;
  }
  const fieldIdError = idErrorCheck(field.id, []).error;
  const displayNameError = displayNameErrorCheck(field.displayName).error;
  const kindError = fieldTypeErrorCheck(field.kind).error;
  const colorError = fieldColorErrorCheck(field.color).error;

  return !fieldIdError && !displayNameError && !kindError && !colorError;
}

function isDocumentOk(document: Document) {
  if (isEmptyDocument(document)) {
    return true;
  }
  const idError = idErrorCheck(document.id, []).error;
  const displayNameError = displayNameErrorCheck(document.displayName).error;
  const fieldErrors = document.fields.map((field) => {
    return !isFieldOk(field);
  });

  return !idError && !displayNameError && !fieldErrors.some((error) => error);
}

interface InputPropertyProps {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  errorFunction?: (value: string) => { error: boolean; message: string };
  maxWidth?: string;
  disabled?: boolean;
  indentation?: number;
}

function InputProperty({
  label,
  value = null,
  onChange = (s) => {},
  errorFunction = (s) => ({ error: false, message: "" }),
  maxWidth = null,
  disabled = false,
  indentation = 0,
}: InputPropertyProps) {
  const error = errorFunction(value);

  return (
    <FormControl
      error={error.error}
      sx={{ marginLeft: indentation * 20 + "px" }}
    >
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
      {error.error && (
        <FormHelperText>
          <InfoOutlined />
          {error.message}
        </FormHelperText>
      )}
    </FormControl>
  );
}

interface SelectPropertyProps {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  errorFunction?: (value: string) => { error: boolean; message: string };
  options: string[];
  disabled?: boolean;
  indentation?: number;
}

function SelectProperty({
  label,
  value,
  onChange = (s) => {},
  errorFunction = (s) => ({ error: false, message: "" }),
  options,
  disabled = false,
  indentation = 0,
}: SelectPropertyProps) {
  const error = errorFunction(value);

  return (
    <FormControl
      error={error.error}
      sx={{ marginLeft: indentation * 20 + "px" }}
    >
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
      {error.error && (
        <FormHelperText>
          <InfoOutlined />
          {error.message}
        </FormHelperText>
      )}
    </FormControl>
  );
}

interface ColorPickerProps {
  initialColor?: [number, number, number];
  onChange?: (color: [number, number, number]) => void;
  indentation?: number;
  errorFunction?: (value: [number, number, number]) => {
    error: boolean;
    message: string;
  };
}

function ColorPicker({
  initialColor = [235, 64, 52],
  onChange = (color: [number, number, number]) => {},
  indentation = 0,
  errorFunction = (color) => ({ error: false, message: "" }),
}: ColorPickerProps) {
  const [color, setColor] = useState({
    r: initialColor[0],
    g: initialColor[1],
    b: initialColor[2],
  });
  const error = errorFunction([color.r, color.g, color.b]);

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
              onChange([value, color.g || 0, color.b || 0]);
            }}
            sx={{ maxWidth: "75px" }}
          />
          <Input
            type="number"
            value={color.g}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              setColor({ ...color, g: value });
              onChange([color.r || 0, value, color.b || 0]);
            }}
            sx={{ maxWidth: "75px" }}
          />
          <Input
            type="number"
            value={color.b}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              setColor({ ...color, b: value });
              onChange([color.r || 0, color.g || 0, value]);
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
        {error.error && (
          <FormHelperText sx={{ marginTop: "-10px" }}>
            <InfoOutlined />
            {error.message}
          </FormHelperText>
        )}
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
  isNew?: boolean;
  onChange?: (field: DocumentField) => void;
  onCreate?: () => void;
  onDelete?: () => void;
  usedFieldIds: string[];
  indentation?: number;
  isNewField?: boolean;
}

function FieldProperty({
  field,
  isNew = false,
  onChange = (field) => {},
  onCreate = () => {},
  onDelete = () => {},
  usedFieldIds = [],
  indentation = 0,
  isNewField = false,
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
    color = [0, 0, 0];
    modelField = null;
  } else {
    id = field.id;
    displayName = field.displayName;
    kind = field.kind;
    color = field.color;
    modelField = field.modelField || null;
  }

  const fieldHasError = !isFieldOk(field);
  let fieldTitle = null;
  if (isNew) {
    let color: "danger" | "primary" = fieldHasError ? "danger" : "primary";
    let icon = fieldHasError ? (
      <ErrorOutlineOutlinedIcon />
    ) : (
      <AddCircleOutlineOutlinedIcon />
    );

    fieldTitle = (
      <Typography endDecorator={icon} color={color}>
        Create New Field
      </Typography>
    );
  } else {
    let color: "danger" | null = fieldHasError ? "danger" : null;
    let icon = fieldHasError ? <ErrorOutlineOutlinedIcon /> : null;
    fieldTitle = (
      <Typography endDecorator={icon} color={color}>
        {displayName}
      </Typography>
    );
  }

  const fieldIsEmpty = isEmptyField(field);

  return (
    <Accordion sx={{ marginLeft: indentation * 20 + "px" }}>
      <AccordionSummary>{fieldTitle}</AccordionSummary>
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
            errorFunction={
              !fieldIsEmpty
                ? (value) => idErrorCheck(value, usedFieldIds)
                : undefined
            }
            disabled={!isNew}
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
            errorFunction={!fieldIsEmpty ? displayNameErrorCheck : undefined}
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
            errorFunction={!fieldIsEmpty ? fieldTypeErrorCheck : undefined}
            options={["string", "number", "date", "currency"]}
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
            errorFunction={!fieldIsEmpty ? fieldColorErrorCheck : undefined}
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
            options={[null, ...Object.keys(azureInvoiceFields)]}
            indentation={indentation + 1}
          />
          {!isNewField && (
            <Button
              size="md"
              color="danger"
              onClick={onDelete}
              disabled={isEmptyField(field) || !isFieldOk(field)}
              sx={{ margin: "auto", marginTop: "20px" }}
            >
              Delete Field
            </Button>
          )}

          {isNewField && (
            <Button
              size="md"
              color="primary"
              onClick={onCreate}
              disabled={isEmptyField(field) || !isFieldOk(field)}
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
  onChange: (document: Document) => void,
  usedDocumentIds: string[],
  usedFieldIds: string[],
  onDelete = () => {}
) {
  const documentIsEmpty = isEmptyDocument(document);

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
          value={document.id}
          onChange={(value) => {
            onChange({
              ...document,
              id: value,
            });
          }}
          disabled={!isNew}
          indentation={1}
          errorFunction={
            !documentIsEmpty
              ? (value) => idErrorCheck(value, usedDocumentIds)
              : undefined
          }
        />
        <InputProperty
          label="Display Name"
          onChange={(value) => {
            onChange({
              ...document,
              displayName: value,
            });
          }}
          value={document.displayName}
          indentation={1}
          errorFunction={!documentIsEmpty ? displayNameErrorCheck : undefined}
        />
        <Typography level="h4">Fields</Typography>
        <AccordionGroup key={document.fields.length}>
          {document.fields.map((field, index) => (
            <FieldProperty
              key={index}
              field={field}
              isNew={index === document.fields.length - 1}
              onChange={(field) => {
                onChange({
                  ...document,
                  fields: [
                    ...document.fields.slice(0, index),
                    field,
                    ...document.fields.slice(index + 1),
                  ],
                });
              }}
              onCreate={() => {
                onChange({
                  ...document,
                  fields: [...document.fields, null],
                });
              }}
              onDelete={() => {
                onChange({
                  ...document,
                  fields: document.fields.filter((_, i) => i !== index),
                });
              }}
              usedFieldIds={usedFieldIds}
              indentation={1}
              isNewField={index === document.fields.length - 1}
            />
          ))}
        </AccordionGroup>
        <Button
          size="lg"
          color="danger"
          endDecorator={<DeleteOutlineOutlinedIcon />}
          onClick={onDelete}
          sx={{ margin: "auto" }}
        >
          Delete Document
        </Button>
      </Box>
    </Box>
  );
}

export default function DocumentsTab() {
  const [originalDocumentTypes, setOriginalDocumentTypes] =
    useState<string>("");
  const [documentTypes, setDocumentTypes] = useState<Array<Document>>([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [rerenderTrigger, setRerenderTrigger] = useState(false);
  const { user, loading, level, organization } = useAuth();

  const usedDocumentIds = documentTypes
    .filter((doc) => !isEmptyDocument(doc))
    .map((document) => document.id);

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
      // Add a null document for creating new document
      data.push(null);
      // Add a null field for creating new fields
      const documents = data.map((document: Document) => {
        if (!document) {
          return {
            id: null,
            displayName: null,
            fields: [
              {
                id: null,
                displayName: null,
                kind: null,
                color: [0, 0, 0],
                modelField: null,
              },
            ],
          };
        }
        return {
          ...document,
          fields: [...document.fields, null],
        };
      });

      setDocumentTypes(documents);
      setOriginalDocumentTypes(JSON.stringify(documents));
      setDocumentsLoading(false);
    } catch (error) {
      //   setError(true);
      //   setErrorMessage("Error fetching users");
      console.error("Error fetching users: ", error);
    }
  }

  async function setOrganizationDocuments() {
    const formattedDocuments = documentTypes
      .filter((doc) => !isEmptyDocument(doc))
      .map((document) => {
        const fields = document.fields.filter((field) => !isEmptyField(field));
        return {
          ...document,
          fields: fields,
        };
      });

    try {
      const response = await fetch("/api/set-organization-document-types", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organization: organization,
          documentTypes: formattedDocuments,
        }),
      });

      const data = await response.json();

      getOrganizationDocuments();
    } catch (error) {
      //   setError(true);
      //   setErrorMessage("Error fetching users");
      console.error("Error fetching users: ", error);
    }
  }

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
        key={String(rerenderTrigger)}
        size="lg"
        orientation="vertical"
        onChange={(event, value) => setSelectedTab(value as number)}
        sx={{
          height: "calc(100% - 90px)",
          backgroundColor: "transparent",
        }}
      >
        <TabList
          sx={{
            width: "300px",
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
            index !== selectedTab && !isDocumentOk(document) ? (
              <Tab key={document.id} color="danger">
                {index !== documentTypes.length - 1
                  ? document.displayName
                  : "Create New"}
                <ErrorOutlineOutlinedIcon />
              </Tab>
            ) : index !== documentTypes.length - 1 ? (
              <Tab key={document.id}>{document.displayName}</Tab>
            ) : (
              <Tab key={document.id} sx={{ color: "primary.500" }}>
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
              },
              usedDocumentIds,
              document.fields
                .filter((field) => !isEmptyField(field))
                .map((field) => field.id),
              () => {
                setDocumentTypes((documentTypes) => {
                  let newDocumentTypes = [...documentTypes];
                  if (index === documentTypes.length - 1) {
                    newDocumentTypes = [
                      ...newDocumentTypes,
                      {
                        id: null,
                        displayName: null,
                        fields: [
                          {
                            id: null,
                            displayName: null,
                            kind: null,
                            color: [0, 0, 0],
                            modelField: null,
                          },
                        ],
                      },
                    ];
                  }
                  return newDocumentTypes.filter((document, i) => i !== index);
                });
                setRerenderTrigger(!rerenderTrigger);
              }
            )}
          </TabPanel>
        ))}
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
        <Button
          size="lg"
          color="success"
          onClick={setOrganizationDocuments}
          disabled={
            !documentTypes.every(isDocumentOk) ||
            originalDocumentTypes === JSON.stringify(documentTypes)
          }
        >
          Save Changes
        </Button>
      </Box>
    </>
  );
}
