import { AzureField } from "./AzureField";

export interface DetectedField {
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
  kickedOut: boolean;
  timeCreated: string;
  updated: string;
  detectedFields: Partial<Record<AzureField, DetectedField>>;
  fields: { [key: string]: any };
  items: { [key: string]: any };
  documentType?: string;
}
