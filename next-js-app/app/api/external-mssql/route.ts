import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
import { openInternalDB } from "@/mssql/internal";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const table = searchParams.get("table");
  const columns = searchParams.get("columns");

  if (!table) {
    return NextResponse.json(
      { error: "Table name is required" },
      { status: 400 }
    );
  }

  try {
    // Connect to the database
    const pool = await openInternalDB();

    // Parameterize the query to avoid SQL injection
    const result = await pool
      .request()
      .query(`SELECT ${columns || "*"} FROM ${table}`);

    // Return the results
    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error("SQL error", error);
    return NextResponse.json(
      { error: "An error occurred while querying the database" },
      { status: 500 }
    );
  } finally {
    // Close the connection
    sql.close();
  }
}
