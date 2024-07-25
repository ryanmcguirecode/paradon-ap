import { use, useEffect, useState } from "react";
import { Input, Autocomplete } from "@mui/joy";
import { DocumentConfigField } from "@/types/DocumentConfig";
import { Transformation, fetchTransformation } from "@/types/Transformation";
import InputStyle from "./InputStyle";

const AutocompleteComponent = ({
  inputValues,
  organization,
  field,
  handleInputChange,
  documentIndex,
  documents,
  activatedFields,
  setActivatedFields,
  setActiveField,
  setSearchedField,
  jumpToField,
  searchable,
  activeField,
  setScrollTo,
  applyTransformation,
}: {
  inputValues: any;
  organization: string;
  field: DocumentConfigField;
  handleInputChange: any;
  documentIndex: number;
  documents: any;
  activatedFields: any;
  setActivatedFields: any;
  setActiveField: any;
  setSearchedField: any;
  jumpToField: any;
  searchable: any;
  activeField: any;
  setScrollTo: any;
  applyTransformation: any;
}) => {
  const [options, setOptions] = useState([]);
  const [inputChanged, setInputChanged] = useState(false);
  const [transformation, setTransformation] = useState<Transformation | null>(
    null
  );

  const fetchOptions = async () => {
    if (!field?.transformationMetadata?.id) {
      return;
    }
    try {
      const transformation = await fetchTransformation(
        organization,
        field.transformationMetadata.id
      );
      setTransformation(transformation);

      const response = await fetch(
        `/api/mappings?organization=${organization}&transformation=${field.transformationMetadata.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      let opts = (data as any[]).map((item) => item.value);
      if (
        field.transformationMetadata.outputField !==
        field.transformationMetadata.inputField
      ) {
        opts = (data as any[]).map((item) => item.key);
      }
      const uniqueOpts = Array.from(new Set(opts));
      setOptions(uniqueOpts);
    } catch (error) {
      console.error("Error fetching mapping:", error);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    if (inputChanged) {
      applyTransformation();
      setInputChanged(false);
    }
  }, [inputValues]);

  return transformation?.type === "lookup" ? (
    <Autocomplete
      key={field.id}
      variant="outlined"
      size="sm"
      sx={{ marginBottom: "5px", boxShadow: "sm" }}
      value={inputValues ? inputValues[field.id] : ""}
      inputValue={inputValues ? inputValues[field.id] : ""}
      options={options || []}
      onInputChange={(event, newValue, reason) => {
        handleInputChange(field.id, newValue);
        if (reason === "reset") {
          setInputChanged(true);
        }
        if (reason === "clear") {
          handleInputChange(field.id, "");
        }
      }}
      onChange={() => {
        setInputChanged(true);
      }}
      onFocus={() => {
        const detectedField =
          documents[documentIndex]?.detectedFields[field.modelField];
        setActiveField(field.id);
        setSearchedField(field.id);
        if (detectedField && !activatedFields.includes(field.id)) {
          setScrollTo({
            page: detectedField.page,
            coordinates: detectedField.coordinates,
          });
          setActivatedFields([...activatedFields, field.id]);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" && searchable) {
          jumpToField(field);
          setSearchedField(activeField);
        }
      }}
    />
  ) : (
    <Input
      key={field.id}
      {...InputStyle}
      value={inputValues ? inputValues[field.id] : ""}
      onChange={(event) => {
        handleInputChange(field.id, event.target.value);
      }}
      onFocus={() => {
        const detectedField =
          documents[documentIndex]?.detectedFields[field.modelField];
        setActiveField(field.id);
        setSearchedField(field.id);
        if (detectedField && !activatedFields.includes(field.id)) {
          setScrollTo({
            page: detectedField.page,
            coordinates: detectedField.coordinates,
          });
          setActivatedFields([...activatedFields, field.id]);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" && searchable) {
          jumpToField(field);
          setSearchedField(activeField);
        }
      }}
    />
  );
};

export default AutocompleteComponent;
