"use client";

import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormLabel,
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

import { useAuth } from "@/components/AuthContext";
import ColorPicker from "@/components/ColorPicker";
import {
  DocumentConfig as Document,
  DocumentConfigField as DocumentField,
} from "@/types/DocumentConfig";
import { Transformation, fetchTransformation } from "@/types/Transformation";
import { azureInvoiceFields } from "@/types/AzureField";

import {
  displayNameErrorCheck,
  fieldColorErrorCheck,
  fieldTypeErrorCheck,
  idErrorCheck,
  isEmptyDocument,
  isEmptyField,
  isFieldOk,
  isDocumentOk,
} from "./checkFunctions";
import {
  InputProperty,
  SelectProperty,
  TrueFalseProperty,
} from "./SettingsInputs";

interface FieldPropertyProps {
  fields: DocumentField[];
  field: DocumentField;
  isNew?: boolean;
  onChange?: (field: DocumentField) => void;
  onCreate?: () => void;
  onDelete?: () => void;
  usedFieldIds: string[];
  indentation?: number;
  isNewField?: boolean;
  transformations: Transformation[];
}

function FieldProperty({
  fields,
  field,
  isNew = false,
  onChange = () => {},
  onCreate = () => {},
  onDelete = () => {},
  usedFieldIds = [],
  indentation = 0,
  isNewField = false,
  transformations,
}: FieldPropertyProps) {
  let id: string,
    displayName: string,
    kind: "string" | "number" | "date" | "currency" | "longstring" | null,
    color: [number, number, number],
    modelField: string | null,
    required: boolean;

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
    required = field.required;
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
  var fieldOptions = fields.map((field) => field.id);
  if (isNew) fieldOptions.push(id);

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
                kind: value as
                  | "string"
                  | "number"
                  | "date"
                  | "currency"
                  | "longstring", // TODO: Fix this
              });
            }}
            errorFunction={!fieldIsEmpty ? fieldTypeErrorCheck : undefined}
            options={["string", "number", "date", "currency", "longstring"]}
            indentation={indentation + 1}
          />
          <TrueFalseProperty
            label="Required"
            value={required}
            onChange={(value) => {
              onChange({
                ...field,
                required: value,
              });
            }}
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
          <Typography>Transformations</Typography>
          <Box sx={{ marginLeft: `${(indentation + 1) * 20}px` }}>
            {field?.transformationMetadata?.map((transformation, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "20px",
                  flexWrap: "wrap",
                  marginBottom: "10px",
                }}
              >
                <FormControl sx={{ flex: 1, minWidth: "50px" }}>
                  <FormLabel>Input Field</FormLabel>
                  <Autocomplete
                    options={[]}
                    disabled={true}
                    inputValue={field.id || ""}
                    value={transformation.inputField || ""}
                    placeholder="Select Field"
                    sx={{ width: "100%" }}
                  />
                </FormControl>
                <FormControl sx={{ flex: 1, minWidth: "50px" }}>
                  <FormLabel>Transformation</FormLabel>
                  <Autocomplete
                    options={transformations.map(
                      (transformation) => transformation.name
                    )}
                    onInputChange={(event, newValue) => {
                      const newTransformations =
                        field.transformationMetadata || [];
                      newTransformations[index] = {
                        ...newTransformations[index],
                        id: newValue,
                      };
                      onChange({
                        ...field,
                        transformationMetadata: newTransformations,
                      });
                    }}
                    inputValue={transformation.id || ""}
                    value={transformation.id || ""}
                    placeholder="Select Transform"
                    sx={{ width: "100%" }}
                  />
                </FormControl>
                <FormControl sx={{ flex: 1, minWidth: "50px" }}>
                  <FormLabel>Output Field</FormLabel>
                  <Autocomplete
                    options={fieldOptions}
                    inputValue={transformation.outputField || ""}
                    value={transformation.outputField || ""}
                    onInputChange={(event, newValue) => {
                      const newTransformations =
                        field.transformationMetadata || [];
                      newTransformations[index] = {
                        ...newTransformations[index],
                        outputField: newValue,
                      };
                      onChange({
                        ...field,
                        transformationMetadata: newTransformations,
                      });
                    }}
                    placeholder="Select Field"
                    sx={{ width: "100%" }}
                  />
                </FormControl>
                <Button
                  size="md"
                  color="danger"
                  onClick={() => {
                    const newTransformations =
                      field.transformationMetadata.filter(
                        (_, i) => i !== index
                      );
                    onChange({
                      ...field,
                      transformationMetadata: newTransformations,
                    });
                  }}
                  sx={{ alignSelf: "center", marginTop: "auto" }}
                >
                  Delete Transformation
                </Button>
              </Box>
            ))}
            <Button
              size="md"
              color="primary"
              onClick={() => {
                const newTransformations = [
                  ...(field.transformationMetadata || []),
                  { id: "", inputField: "", outputField: "" },
                ];
                onChange({
                  ...field,
                  transformationMetadata: newTransformations,
                });
              }}
              sx={{ margin: "auto", marginTop: "20px" }}
            >
              Add Transformation
            </Button>
          </Box>
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
  onDelete = () => {},
  transformations: Transformation[]
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
              fields={document.fields.slice(0, document.fields.length - 1)}
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
              transformations={transformations}
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
  const [transformations, setTransformations] = useState<Transformation[]>([]);
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

  async function fetchTransformations() {
    // Fetch transformations
    const response = await fetch(
      `/api/transformations?organization=${organization}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    response.json().then((data) => {
      setTransformations(data);
    });
  }

  useEffect(() => {
    if (organization) {
      getOrganizationDocuments();
      fetchTransformations();
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
                            required: false,
                          },
                        ],
                      },
                    ];
                  }
                  return newDocumentTypes.filter((document, i) => i !== index);
                });
                setRerenderTrigger(!rerenderTrigger);
              },
              transformations
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
