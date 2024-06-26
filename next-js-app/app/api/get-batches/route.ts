import { Firestore, Timestamp } from "@google-cloud/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const organization = req.nextUrl.searchParams.get("organization");

    if (!organization) {
      return NextResponse.json(
        { error: "Missing organization" },
        { status: 400 }
      );
    }

    const credentials = JSON.parse(
      process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || "{}"
    );

    const firestore = new Firestore({
      projectId: credentials.project_id,
      credentials: {
        client_email: credentials.client_email,
        private_key: credentials.private_key.replace(/\\n/gm, "\n"),
      },
    });

    // const batchType = req.nextUrl.searchParams.get("batchType");
    // const createdFromDate = req.nextUrl.searchParams.get("createdFromDate");
    // const createdToDate = req.nextUrl.searchParams.get("createdToDate");
    // const isFull = req.nextUrl.searchParams.get("isFull");
    // const isCheckedOut = req.nextUrl.searchParams.get("isCheckedOut");

    const offset = req.nextUrl.searchParams.get("offset");
    const limit = req.nextUrl.searchParams.get("limit");

    let query = firestore
      .collection("batches")
      .where("organization", "==", organization);

    if (limit) {
      query = query.limit(Number(limit));
    }
    if (offset) {
      query = query.offset(Number(offset));
    }

    const snapshot = await query.get();
    const batches = snapshot.docs.map((doc) => doc.data());

    const convertDatesToStrings = (row: any) => {
      const newRow: any = {};
      for (const key in row) {
        if (row[key] instanceof Timestamp) {
          newRow[key] = row[key].toDate().toISOString();
        } else {
          newRow[key] = row[key];
        }
      }
      return newRow;
    };

    return NextResponse.json(batches.map(convertDatesToStrings));
  } catch (error) {
    console.error("Error executing query:", error);
    return NextResponse.json(
      { error: "Failed to execute query" },
      { status: 500 }
    );
  }
}
