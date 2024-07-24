export interface Transformation {
  name: string;
  type: string;
  body: {
    regexPattern: string;
    replacementValue: string;
    lookupMethod: string;
    learning: boolean;
  };
}
