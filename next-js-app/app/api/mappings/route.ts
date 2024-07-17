import { NextRequest, NextResponse } from "next/server";
import { openDB } from "../../../sqlite/db.js";
import getUrlSearchParameter from "@/utils/getUrlSearchParameter";

export async function GET(req) {
  try {
    const key = getUrlSearchParameter(req.nextUrl.searchParams, "key");
    const db = await openDB();
    const mappings = key
      ? await db.all("SELECT * FROM mappings WHERE key = ?", key)
      : await db.all("SELECT * FROM mappings");
    return NextResponse.json(mappings);
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
    const { key, value, field, email } = await req.json();
    const db = await openDB();
    await db.run(
      "INSERT OR REPLACE INTO mappings (key, value, field, created_by) VALUES (?, ?, ?, ?)",
      [key, value, field, email]
    );
  } catch (error) {
    console.error("Error creating mapping:", error);
    return NextResponse.json(
      { error: "Failed to create mapping" },
      { status: 500 }
    );
  }
}
