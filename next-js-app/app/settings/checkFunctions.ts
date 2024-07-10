import { DocumentConfig, DocumentConfigField } from "@/types/DocumentConfig";

export function idErrorCheck(value: string, usedValues: string[]) {
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

export function displayNameErrorCheck(value: string) {
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

export function fieldTypeErrorCheck(value: string) {
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

export function fieldColorErrorCheck(value: [number, number, number]) {
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

export function isEmptyDocument(document: DocumentConfig) {
  return (
    !document.id &&
    !document.displayName &&
    document.fields.length === 1 &&
    isEmptyField(document.fields[0])
  );
}

export function isEmptyField(field: DocumentConfigField) {
  return field === null || (!field.id && !field.displayName);
}

export function isFieldOk(field: DocumentConfigField) {
  if (isEmptyField(field)) {
    return true;
  }
  const fieldIdError = idErrorCheck(field.id, []).error;
  const displayNameError = displayNameErrorCheck(field.displayName).error;
  const kindError = fieldTypeErrorCheck(field.kind).error;
  const colorError = fieldColorErrorCheck(field.color).error;

  return !fieldIdError && !displayNameError && !kindError && !colorError;
}

export function isDocumentOk(document: DocumentConfig) {
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
