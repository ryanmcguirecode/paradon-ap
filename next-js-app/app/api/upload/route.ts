import { NextRequest, NextResponse } from "next/server";
import { BigQuery } from "@google-cloud/bigquery";
import { Storage } from "@google-cloud/storage";
import {
  BoundingRegion,
  DocumentAddressField,
  DocumentArrayField,
  DocumentBooleanField,
  DocumentCurrencyField,
  DocumentDateField,
  DocumentField,
  DocumentIntegerField,
  DocumentNumberField,
  DocumentStringField,
  DocumentTimeField,
  Point2D,
} from "@azure/ai-form-recognizer";

function getBigQueryCurrentTime() {
  const now = new Date();

  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  const hours = String(now.getUTCHours()).padStart(2, "0");
  const minutes = String(now.getUTCMinutes()).padStart(2, "0");
  const seconds = String(now.getUTCSeconds()).padStart(2, "0");
  const milliseconds = String(now.getUTCMilliseconds()).padStart(6, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;
}

function convertFieldToBigQueryType(field: DocumentField): any {
  const fieldKind = field.kind;
  if (fieldKind === "string") {
    return (field as DocumentStringField).value;
  } else if (fieldKind === "integer") {
    return (field as DocumentIntegerField).value;
  } else if (fieldKind === "number") {
    return (field as DocumentNumberField).value;
  } else if (fieldKind === "date") {
    const value = (field as DocumentDateField).value;
    if (typeof value === "string") {
      return (value as string).split("T")[0];
    }
  } else if (fieldKind === "time") {
    return new Date((field as DocumentTimeField).value?.split("T")[0] || 0);
  } else if (fieldKind === "boolean") {
    return (field as DocumentBooleanField).value;
  } else if (fieldKind === "currency") {
    return (field as DocumentCurrencyField).value?.amount;
  } else if (fieldKind === "array") {
    return (field as DocumentArrayField).values.map((subField) =>
      convertFieldToBigQueryType(subField)
    );
  } else if (fieldKind === "address") {
    return (field as DocumentAddressField).content;
  } else if (
    fieldKind === "countryRegion" ||
    fieldKind === "phoneNumber" ||
    fieldKind === "signature" ||
    fieldKind === "selectionMark"
  ) {
    return field.content;
  } else if (fieldKind === "object") {
    console.error("Object fields are not supported");
    return field.content;
  } else {
    console.error("Unknown field kind: ", field, fieldKind);
    return null;
  }
}

function formatRow(fields: { [key: string]: DocumentField }, fileName: string) {
  const randomValue = Math.random();
  let batchId;
  if (randomValue < 0.33) {
    batchId = "45dbccda-5071-4cd7-9115-8095fc15c293";
  } else if (randomValue < 0.66) {
    batchId = "b68d9255-7ffb-4a78-9d18-663d85e66854";
  } else {
    batchId = "4b83e5eb-6fdf-4e86-9d3e-936c10a0fcb8";
  }

  const row: { [key: string]: any } = {
    DocumentType: "invoice",
    TimeReceived: getBigQueryCurrentTime(),
    TimeProcessed: null,
    TimeReviewed: null,
    Reviewer: null,
    Filename: fileName,
    BatchId: batchId,
  };
  for (let key of Object.keys(fields)) {
    if (key === "Items") {
      console.log("Items:", fields[key]);
    } else {
      let page = null;
      let coordinates: number[] = [];

      const pages = (fields[key].boundingRegions || []).map(
        (region: BoundingRegion) => region.pageNumber
      );
      if (pages.length > 0) {
        page = Math.min(...pages);
      }

      const polygons = (fields[key].boundingRegions || []).map(
        (region: BoundingRegion) => region.polygon
      );
      const xValues = polygons
        .map((polygon) => (polygon as Point2D[]).map((point) => point.x))
        .flat();
      const yValues = polygons
        .map((polygon) => (polygon as Point2D[]).map((point) => point.y))
        .flat();

      if (xValues.length > 0 || yValues.length > 0) {
        coordinates = [
          Math.min(...xValues),
          Math.max(...xValues),
          Math.min(...yValues),
          Math.max(...yValues),
        ];
      }

      row[key + "Coordinates"] = coordinates;
      row[key + "Page"] = page;
      row[key + "Confidence"] = fields[key].confidence || null;
      row[key + "Final"] = null;
      row[key + "Detected"] = convertFieldToBigQueryType(fields[key]);
    }
  }

  return row;
}

export async function PUT(req: NextRequest) {
  const credentials = JSON.parse(
    process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || "{}"
  );

  const storage = new Storage({
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key,
    },
  });

  const bigquery = new BigQuery({
    projectId: credentials.project_id,
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key.replace(/\\n/gm, "\n"),
    },
  });

  try {
    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get("fileName");

    if (!fileName) {
      return NextResponse.json({ error: "Missing fileName" }, { status: 400 });
    }

    const buffer = await req.arrayBuffer();
    const fileContent = Buffer.from(buffer);

    const bucket = storage.bucket("paradon-test-invoices");
    const file = bucket.file(fileName);
    await file.save(fileContent);

    const extractFieldsResponse = await fetch(
      `${req.nextUrl.origin}/api/extract-fields`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/octet-stream",
        },
        body: fileContent,
      }
    );

    const { fields } = await extractFieldsResponse.json();
    const newRow = formatRow(fields, fileName);
    bigquery
      .dataset("test_invoices")
      .table("metadata")
      .insert(newRow)
      .catch((err: any) => {
        console.error("Error adding row:", err);
        for (const rowError of err.errors) {
          for (const fieldError of rowError.errors) {
            if (fieldError.message) {
              throw Object.assign(new Error(fieldError.message), {
                reason: fieldError.reason,
                row: rowError.row,
                errors: err.errors,
              });
            }
          }
        }
      });

    return NextResponse.json(
      { message: "File uploaded successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to upload PDF" },
      { status: 500 }
    );
  }
}
