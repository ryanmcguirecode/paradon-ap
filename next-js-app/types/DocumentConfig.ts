import { AzureField } from "./AzureField";
import { Transformation } from "./Transformation";

export interface DocumentConfigField {
  id: string;
  displayName: string;
  kind: "string" | "number" | "date" | "currency" | "longstring";
  color: [number, number, number];
  required: boolean;
  modelField?: AzureField | null;
  transformationMetadata?: {
    id: string;
    inputField: string;
    outputField: string;
  }[];
}

export interface LineItem extends DocumentConfigField {
  headers: string;
}

export interface DocumentConfig {
  id: string;
  displayName: string;
  fields?: DocumentConfigField[];
  lineItems?: LineItem;
}
