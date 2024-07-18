import { AzureField } from "./AzureField";
import { Transformation } from "./Transformation";

export interface DocumentConfigField {
  id: string;
  displayName: string;
  kind: "string" | "number" | "date" | "currency";
  color: [number, number, number];
  required: boolean;
  modelField?: AzureField | null;
  transformation?: {
    id: string;
    inputField: string;
  };
}

export interface DocumentConfig {
  id: string;
  displayName: string;
  fields?: DocumentConfigField[];
}
