import { NextRequest, NextResponse } from "next/server";
import { openInternalDB } from "../../../mssql/internal";
import getUrlSearchParameter from "@/utils/getUrlSearchParameter";
import { sanitizeInput } from "@/utils/sanitizeInput";

export async function GET(req) {
  try {
    const key = sanitizeInput(
      getUrlSearchParameter(req.nextUrl.searchParams, "key")
    );
    const organization = sanitizeInput(
      getUrlSearchParameter(req.nextUrl.searchParams, "organization")
    );
    const transformation = sanitizeInput(
      getUrlSearchParameter(
        req.nextUrl.searchParams,
        "transformation"
      )?.toLowerCase()
    );
    const source = sanitizeInput(
      getUrlSearchParameter(req.nextUrl.searchParams, "source")
    );

    const db = await openInternalDB();

    let query = `SELECT * FROM ${organization}Mappings`;
    const conditions = [];

    if (key) {
      conditions.push(`[key] = '${key}'`);
    }
    if (transformation) {
      conditions.push(`[transformation] = '${transformation}'`);
    }
    if (source) {
      conditions.push(`[source] = '${source}'`);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    const result = await db.query(query); // Execute the query with parameters
    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error("Error executing query:", error);
    return NextResponse.json(
      { error: "Failed to execute query" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const { data, organization } = await req.json();
    const db = await openInternalDB();

    let query = `
      MERGE INTO ${sanitizeInput(organization)}Mappings AS target
      USING (VALUES ${data
        .map((item) => {
          return `('${sanitizeInput(item.key)}', '${sanitizeInput(
            item.value
          )}', '${sanitizeInput(item.createdBy)}', '${sanitizeInput(
            item.transformation
          )}', ${sanitizeInput(item.source)})`;
        })
        .join(
          ", "
        )}) AS source ([key], [value], [created_by], [transformation], [source])
      ON (target.[key] = source.[key] AND target.[transformation] = source.[transformation])
      WHEN MATCHED THEN
        UPDATE SET
          [value] = source.[value],
          [created_by] = source.[created_by],
          [transformation] = source.[transformation],
          [source] = source.[source]
      WHEN NOT MATCHED THEN
        INSERT ([key], [value], [created_by], [transformation], [source])
        VALUES (source.[key], source.[value], source.[created_by], source.[transformation], source.[source]);
    `;
    await db.query(query);
    return NextResponse.json({
      message: "Mapping created/updated successfully",
    });
  } catch (error) {
    console.error("Error creating mapping:", error);
    return NextResponse.json(
      { error: "Failed to create mapping" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const { transformation, organization } = await req.json();
    const db = await openInternalDB();

    const query = `DELETE FROM ${sanitizeInput(
      organization
    )}Mappings WHERE [transformation] = '${transformation}'`;

    await db.query(query);
    return NextResponse.json({ message: "Mapping deleted successfully" });
  } catch (error) {
    console.error("Error deleting mapping:", error);
    return NextResponse.json(
      { error: "Failed to delete mapping" },
      { status: 500 }
    );
  }
}
