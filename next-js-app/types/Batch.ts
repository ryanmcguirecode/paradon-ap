import { Document } from "./Document";

export interface Batch {
  batchId: string;
  batchName: string;
  timeCreated: string;
  timeFinished: string;
  documentCount: number;
  documents: Document[];
  isCheckedOut: boolean;
  isFinished: boolean;
  organization: string;
  owner: string;
  reviewers: string[];
}
