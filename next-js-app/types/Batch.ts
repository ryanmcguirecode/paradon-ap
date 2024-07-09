import Document from "./Document";

export interface Batch {
  batchId: string;
  batchName: string;
  documentCount: number;
  documentIndex: number;
  documents: Document[];
  isCheckedOut: boolean;
  isFinished: boolean;
  organization: string;
  owner: string;
  reviewers: string[];
  timeCreated: string;
  timeFinished: string;
}
