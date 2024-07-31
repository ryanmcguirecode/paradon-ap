import { NextResponse } from "next/server";
import { openDB } from "../../../sqlite/db.js";

export interface Mapping {
  key: string;
  value: string;
  createdBy: string;
  transformation: string;
}

export async function POST(req) {
  try {
    const { mappings, organization } = await req.json(); // Assuming you send mappings and organization in the request body

    const db = await openDB();
    if (mappings && mappings.length > 0) {
      // Create a temporary table
      await db.exec(`
        CREATE TEMPORARY TABLE tempMappings (
          key TEXT,
          value TEXT,
          created_by TEXT,
          transformation TEXT
        );
      `);

      // Insert mappings into the temporary table
      const insertValues = mappings.map(() => "(?, ?, ?, ?)").join(", ");
      const insertParams = mappings.flatMap(
        ({ key, value, createdBy, transformation }) => [
          key,
          value,
          createdBy,
          transformation,
        ]
      );
      await db.run(
        `INSERT INTO tempMappings (key, value, created_by, transformation) VALUES ${insertValues}`,
        insertParams
      );

      // Perform the anti-join to find new or changed mappings
      const results = await db.all(`
        SELECT t.key, t.value, t.created_by, t.transformation
        FROM tempMappings t
        LEFT JOIN ${organization}Mappings o ON t.key = o.key
        WHERE o.key IS NULL OR o.value != t.value
        GROUP BY t.key, t.value, t.created_by, t.transformation
      `);

      // Drop the temporary table
      await db.exec(`DROP TABLE tempMappings;`);

      return NextResponse.json(results);
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
