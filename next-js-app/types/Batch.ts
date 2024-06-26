import { Document } from "./Document";

export interface Batch {
  batchId: string;
  batchType: string;
  batchNumber: number;
  documentCount: number;
  documents: Document[];
  dateCreated: string;
  dateFinished: string;
  isFull: boolean;
  isFinished: boolean;
  isCheckedOut: boolean;
  reviewer: string;
}
