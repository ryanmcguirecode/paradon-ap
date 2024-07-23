import { use, useEffect, useState } from "react";
import PdfViewer from "@/components/PdfViewer";

import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

import { Input, Autocomplete } from "@mui/joy";

import { Transformation } from "@/types/Transformation";
import { DocumentConfigField } from "@/types/DocumentConfig";

import InputStyle from "./InputStyle";

import { regexReplace } from "@/utils/regexReplace";

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

  const fetchOptions = async () => {
    if (!field?.transformation?.id) {
      return;
    }
    try {
      fetch(
        `/api/mappings?organization=${organization}&transformation=${field.transformation.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
        .then((response) => response.json().then((data) => data))
        .then((data) => {
          var opts = (data as any[]).map((item) => item.value);
          if (
            field.transformation.outputField != field.transformation.inputField
          ) {
            opts = (data as any[]).map((item) => item.key);
          }
          setOptions(opts);
        });
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

  return field?.transformation?.transformation &&
    field.transformation.transformation.type == "lookup" ? (
    <Autocomplete
      {...InputStyle}
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
      onChange={(event, newValue) => {
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
