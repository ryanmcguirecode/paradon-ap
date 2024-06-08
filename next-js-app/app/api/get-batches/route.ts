import { BigQuery, BigQueryDate } from "@google-cloud/bigquery";
import { NextRequest, NextResponse } from "next/server";
import { capitalizedToCamelObject } from "@/app/utils/snakeToCamel";

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

    const batchType = req.nextUrl.searchParams.get("batchType");
    const createdFromDate = req.nextUrl.searchParams.get("createdFromDate");
    const createdToDate = req.nextUrl.searchParams.get("createdToDate");
    const isFull = req.nextUrl.searchParams.get("isFull");
    const isCheckedOut = req.nextUrl.searchParams.get("isCheckedOut");

    const offset = req.nextUrl.searchParams.get("offset");
    const limit = req.nextUrl.searchParams.get("limit");

    let query = `
          SELECT * FROM \`test_invoices.batches\`
        `;

    const conditions: string[] = [];

    if (batchType) {
      conditions.push(`BatchType = '${batchType}'`);
    }
    if (createdFromDate) {
      conditions.push(
        `DateCreated >= PARSE_DATE('%Y-%m-%d', '${createdFromDate}')`
      );
    }
    if (createdToDate) {
      conditions.push(
        `DateCreated <= PARSE_DATE('%Y-%m-%d', '${createdToDate}')`
      );
    }
    if (isFull != null) {
      conditions.push(`IsFull = ${isFull}`);
    }

    if (isCheckedOut !== null) {
      conditions.push(`IsCheckedOut = ${isCheckedOut}`);
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
        if (row[key] instanceof BigQueryDate) {
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
