import { Firestore, Timestamp } from "@google-cloud/firestore";
import { NextRequest, NextResponse } from "next/server";
import { capitalizedToCamelObject } from "@/utils/snakeToCamel";

export async function GET(req: NextRequest) {
  try {
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

    const offset = req.nextUrl.searchParams.get("offset");
    const limit = req.nextUrl.searchParams.get("limit");
    const documentType = req.nextUrl.searchParams.get("documentType");
    const reviewed = req.nextUrl.searchParams.get("reviewed");
    const fromDate = req.nextUrl.searchParams.get("fromDate");
    const toDate = req.nextUrl.searchParams.get("toDate");
    const filename = req.nextUrl.searchParams.get("filename");
    const batchId = req.nextUrl.searchParams.get("batchId");
    const organization = req.nextUrl.searchParams.get("organization");

    if (!organization) {
      return NextResponse.json(
        { error: "Missing organization" },
        { status: 400 }
      );
    }

    let query = firestore
      .collection("documents")
      .where("organization", "==", organization);

    if (batchId) {
      query = query.where("BatchId", "==", batchId);
    }
    if (documentType) {
      query = query.where("DocumentType", "==", documentType);
    }
    if (reviewed) {
      if (reviewed === "true") {
        query = query.where("TimeReviewed", "!=", null);
      } else {
        query = query.where("TimeReviewed", "==", null);
      }
    }
    if (fromDate) {
      query = query.where("TimeReceived", ">=", new Date(fromDate));
    }
    if (toDate) {
      query = query.where("TimeReceived", "<=", new Date(toDate));
    }
    if (filename) {
      query = query.where("Filename", "==", filename);
    }
    if (limit) {
      query = query.limit(Number(limit));
    }
    if (offset) {
      query = query.offset(Number(offset));
    }

    const snapshot = await query.get();
    const rows = snapshot.docs.map((doc) => ({
      ...doc.data(),
      filename: doc.id,
    }));

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

    const formattedRows = rows.map(convertDatesToStrings);
    // const camelCaseRows = formattedRows.map(capitalizedToCamelObject);

    return NextResponse.json(formattedRows);
  } catch (error) {
    console.error("Error executing query:", error);
    return NextResponse.json(
      { error: "Failed to execute query" },
      { status: 500 }
    );
  }
}
