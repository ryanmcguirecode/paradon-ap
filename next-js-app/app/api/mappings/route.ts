import { NextRequest, NextResponse } from "next/server";
import { openDB } from "../../../sqlite/db.js";
import getUrlSearchParameter from "@/utils/getUrlSearchParameter";

export async function GET(req) {
  try {
    const key = getUrlSearchParameter(req.nextUrl.searchParams, "key");
    const transformation = getUrlSearchParameter(
      req.nextUrl.searchParams,
      "transformation"
    );
    console.log("key", key, "transformation", transformation);
    const db = await openDB();
    if (transformation && key) {
      return NextResponse.json(
        await db.all(
          "SELECT * FROM mappings WHERE key = ? AND transformation = ?",
          key,
          transformation
        )
      );
    } else if (transformation) {
      return NextResponse.json(
        await db.all(
          "SELECT * FROM mappings WHERE transformation = ?",
          transformation
        )
      );
    } else {
      return NextResponse.json(await db.all("SELECT * FROM mappings"));
    }
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
    const { data }: { data: any[] } = await req.json();
    const db = await openDB();

    // Construct the query with placeholders
    let query =
      "INSERT INTO mappings (key, value, created_by, transformation) VALUES ";
    const values = [];

    // Add placeholders and corresponding values
    data.forEach((item, index) => {
      if (index !== 0) query += ", ";
      query += "(?, ?, ?, ?)";
      values.push(item.key, item.value, item.createdBy, item.transformation);
    });

    await db.run(query, values);

    return NextResponse.json({ message: "Mapping created successfully" });
  } catch (error) {
    console.error("Error creating mapping:", error);
    return NextResponse.json(
      { error: "Failed to create mapping" },
      { status: 500 }
    );
  }
}
