import { Firestore, Timestamp } from "@google-cloud/firestore";
import { NextRequest, NextResponse } from "next/server";
import getUrlSearchParameter from "@/utils/getUrlSearchParameter";

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

    // const documentType = getUrlSearchParameter(req.nextUrl.searchParams, "documentType");
    const createdFromDate = getUrlSearchParameter(
      req.nextUrl.searchParams,
      "createdFromDate"
    );
    const createdToDate = getUrlSearchParameter(
      req.nextUrl.searchParams,
      "createdToDate"
    );
    const filename = getUrlSearchParameter(
      req.nextUrl.searchParams,
      "filename"
    );
    const reviewed = getUrlSearchParameter(
      req.nextUrl.searchParams,
      "reviewed"
    );
    const offset = getUrlSearchParameter(req.nextUrl.searchParams, "offset");
    const limit = getUrlSearchParameter(req.nextUrl.searchParams, "limit");
    const organization = getUrlSearchParameter(
      req.nextUrl.searchParams,
      "organization"
    );

    // console.log("offset", offset);
    // console.log("limit", limit);
    // console.log("documentType", documentType);
    // console.log("reviewed", reviewed);
    // console.log("createdFromDate", createdFromDate);
    // console.log("createdToDate", createdToDate);
    // console.log("filename", filename);
    // console.log("organization", organization);

    // console.log(Timestamp.fromDate(new Date(createdToDate)));

    if (!organization) {
      return NextResponse.json(
        { error: "Missing organization" },
        { status: 400 }
      );
    }

    let query = firestore
      .collection("documents")
      .where("organization", "==", organization);

    if (createdFromDate) {
      query = query.where(
        "timeCreated",
        ">=",
        Timestamp.fromDate(new Date(createdFromDate))
      );
    }
    if (createdToDate) {
      query = query.where(
        "timeCreated",
        "<=",
        Timestamp.fromDate(new Date(createdToDate))
      );
    }
    if (filename) {
      query = query.where("filename", "==", filename);
    }
    if (reviewed) {
      query = query.where("reviewed", "==", reviewed === "true");
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
