import { NextResponse } from "next/server";
import { openInternalDB } from "@/mssql/internal"; // Ensure this points to your MSSQL connection utility
import { sanitizeInput } from "@/utils/sanitizeInput";

export async function POST(req) {
  var db;
  try {
    const { mappings, organization } = await req.json(); // Assuming you send mappings and organization in the request body

    db = await openInternalDB();
    if (mappings && mappings.length > 0) {
      // Create a temporary table
      const createTempTableQuery = `
        CREATE TABLE "tempMappings" (
          [key] NVARCHAR(255),
          [value] NVARCHAR(255),
          [created_by] NVARCHAR(255),
          [transformation] NVARCHAR(255),
          [source] NVARCHAR(255)
        );
      `;
      await db.query(createTempTableQuery);

      // Insert mappings into the temporary table
      let insertQuery = `
        INSERT INTO tempMappings ([key], [value], [created_by], [transformation], [source])
        VALUES 
      `;

      mappings.forEach((mapping) => {
        insertQuery += `('${sanitizeInput(mapping.key)}', '${
          mapping.value
        }', '${mapping.createdBy}', '${mapping.transformation}', 'db'),`;
      });

      // Remove the last comma from the query
      insertQuery = insertQuery.slice(0, -1);
      const insertRes = await db.query(insertQuery);

      // Perform the anti-join to find new or changed mappings
      const selectQuery = `
        SELECT t.[key], t.[value], t.[created_by], t.[transformation], t.[source]
        FROM tempMappings t
        LEFT JOIN ${organization}Mappings o 
        ON t.[key] = o.[key] AND t.[transformation] = o.[transformation]
        WHERE o.[key] IS NULL OR o.[value] != t.[value]`;

      const results = await db.query(selectQuery);

      // Drop the temporary table
      const dropTempTableQuery = `DROP TABLE tempMappings;`;
      await db.query(dropTempTableQuery);

      return NextResponse.json(results.recordset);
    } else {
      return NextResponse.json(
        { error: "No mappings provided" },
        { status: 400 }
      );
    }
  } catch (error) {
    // Drop the temporary table
    const dropTempTableQuery = `DROP TABLE tempMappings;`;
    await db.query(dropTempTableQuery);
    console.error("Error executing query:", error);
    return NextResponse.json(
      { error: "Failed to execute query" },
      { status: 500 }
    );
  }
}
