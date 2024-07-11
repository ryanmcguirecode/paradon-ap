import { AzureField } from "./AzureField";

export interface DocumentConfigField {
  id: string;
  displayName: string;
  kind: "string" | "number" | "date" | "currency";
  color: [number, number, number];
  required: boolean;
  modelField?: AzureField | null;
}

export interface DocumentConfig {
  id: string;
  displayName: string;
  fields?: DocumentConfigField[];
}
