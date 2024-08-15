export interface Transformation {
  name: string;
  type: string;
  body: {
    regexPattern: string;
    replacementValue: string;
    lookupMethod: string;
    lookupTable: string;
    lookupKeyColumn: string;
    lookupValueColumn: string;
    learning: boolean;
  };
}

export async function fetchTransformation(
  organization,
  transformation
): Promise<Transformation> {
  const response = await fetch(
    `/api/transformations?organization=${organization}&transformation=${transformation}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  const data = await response.json();
  return data;
}
