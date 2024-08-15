import { NextResponse } from "next/server";
import { openInternalDB } from "../../../mssql/internal"; // Ensure this points to your MSSQL connection utility

export async function POST(req) {
  try {
    const { mappings, organization } = await req.json(); // Assuming you send mappings and organization in the request body

    const db = await openInternalDB();
    if (mappings && mappings.length > 0) {
      // Create a temporary table
      const createTempTableQuery = `
        CREATE TABLE #tempMappings (
          [key] NVARCHAR(255),
          [value] NVARCHAR(255),
          [created_by] NVARCHAR(255),
          [transformation] NVARCHAR(255),
          [source] NVARCHAR(255)
        );
      `;
      await db.query(createTempTableQuery);

      // Insert mappings into the temporary table
      const insertValues = mappings.map(() => "(?, ?, ?, ?, ?)").join(", ");
      const insertParams = mappings.flatMap(
        ({ key, value, createdBy, transformation, source }) => [
          key,
          value,
          createdBy,
          transformation,
          source,
        ]
      );
      const insertQuery = `
        INSERT INTO #tempMappings ([key], [value], [created_by], [transformation], [source])
        VALUES ${insertValues};
      `;
      await db.query(insertQuery, insertParams);

      // Perform the anti-join to find new or changed mappings
      const selectQuery = `
        SELECT t.[key], t.[value], t.[created_by], t.[transformation], t.[source]
        FROM #tempMappings t
        LEFT JOIN ${organization}Mappings o 
        ON t.[key] = o.[key] AND t.[transformation] = o.[transformation] AND t.[source] = o.[source]
        WHERE o.[key] IS NULL OR o.[value] != t.[value]
        GROUP BY t.[key], t.[value], t.[created_by], t.[transformation], t.[source];
      `;
      const results = await db.query(selectQuery);

      // Drop the temporary table
      const dropTempTableQuery = `DROP TABLE #tempMappings;`;
      await db.query(dropTempTableQuery);

      return NextResponse.json(results.recordset);
    } else {
      return NextResponse.json(
        { error: "No mappings provided" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error executing query:", error);
    return NextResponse.json(
      { error: "Failed to execute query" },
      { status: 500 }
    );
  }
}
