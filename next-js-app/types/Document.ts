import { AzureField } from "./AzureField";

interface DetectedField {
  confidence: number;
  content: string;
  coordinates: number[];
  page: number;
  value: any;
}

interface Field {
  name: string;
  value: any;
}

export default interface Document {
  filename: string;
  id: string;
  organization: string;
  reviewed: boolean;
  timeCreated: string;
  updated: string;
  detectedFields: Partial<Record<AzureField, DetectedField>>;
  fields: { [key: string]: Field };
}
