import {
  BigQuery,
  BigQueryDate,
  BigQueryDatetime,
} from "@google-cloud/bigquery";
import { NextRequest, NextResponse } from "next/server";
import { capitalizedToCamelObject } from "@/utils/snakeToCamel";

export async function GET(req: NextRequest) {
  try {
    const credentials = JSON.parse(
      process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || "{}"
    );

    const bigquery = new BigQuery({
      projectId: credentials.project_id,
      credentials: {
        client_email: credentials.client_email,
        private_key: credentials.private_key.replace(/\\n/gm, "\n"),
      },
    });

    const offset = req.nextUrl.searchParams.get("offset");
    const limit = req.nextUrl.searchParams.get("limit");
    const documentType = req.nextUrl.searchParams.get("documentType");
    const reviewed = req.nextUrl.searchParams.get("reviewed");
    const fromDate = req.nextUrl.searchParams.get("fromDate");
    const toDate = req.nextUrl.searchParams.get("toDate");
    const filename = req.nextUrl.searchParams.get("filename");
    const batchId = req.nextUrl.searchParams.get("batchId");

    let query = `
          SELECT * FROM \`test_invoices.metadata\`
        `;

    const conditions: string[] = [];

    if (batchId) {
      conditions.push(`BatchId = '${batchId}'`);
    }
    if (documentType) {
      conditions.push(`DocumentType = '${documentType}'`);
    }
    if (reviewed) {
      if (reviewed === "true") {
        conditions.push(`TimeReviewed IS NOT NULL`);
      } else {
        conditions.push(`TimeReviewed IS NULL`);
      }
    }
    if (fromDate) {
      conditions.push(`TimeReceived >= PARSE_DATE('%Y-%m-%d', '${fromDate}')`);
    }
    if (toDate) {
      conditions.push(`TimeReceived <= PARSE_DATE('%Y-%m-%d', '${toDate}')`);
    }
    if (filename) {
      conditions.push(`Filename = '${filename}'`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(" AND ");
    }

    if (limit) {
      query += ` LIMIT ${limit}`;
      if (offset) {
        query += ` OFFSET ${offset}`;
      }
    }

    const options = {
      query: query,
      location: "US",
    };

    const [rows] = await bigquery.query(options);

    const convertDatesToStrings = (row: any) => {
      const newRow: any = {};
      for (const key in row) {
        if (
          row[key] instanceof BigQueryDate ||
          row[key] instanceof BigQueryDatetime
        ) {
          newRow[key] = row[key].value;
        } else {
          newRow[key] = row[key];
        }
      }
      return newRow;
    };

    const formattedRows = rows.map(convertDatesToStrings);
    const camelCaseRows = formattedRows.map(capitalizedToCamelObject);

    return NextResponse.json(camelCaseRows);
  } catch (error) {
    console.error("Error executing query:", error);
    return NextResponse.json(
      { error: "Failed to execute query" },
      { status: 500 }
    );
  }
}
