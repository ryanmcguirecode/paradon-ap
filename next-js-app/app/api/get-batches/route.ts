import { Firestore, Timestamp } from "@google-cloud/firestore";
import { NextRequest, NextResponse } from "next/server";
import getUrlSearchParameter from "@/utils/getUrlSearchParameter";

export async function GET(req: NextRequest) {
  try {
    const createdFromDate = getUrlSearchParameter(
      req.nextUrl.searchParams,
      "createdFromDate"
    );
    const createdToDate = getUrlSearchParameter(
      req.nextUrl.searchParams,
      "createdToDate"
    );
    const isCheckedOut = getUrlSearchParameter(
      req.nextUrl.searchParams,
      "isCheckedOut"
    );
    const isFull = getUrlSearchParameter(req.nextUrl.searchParams, "isFull");
    const isFinished = getUrlSearchParameter(
      req.nextUrl.searchParams,
      "isFinished"
    );
    const limit = getUrlSearchParameter(req.nextUrl.searchParams, "limit");
    const offset = getUrlSearchParameter(req.nextUrl.searchParams, "offset");
    const organization = getUrlSearchParameter(
      req.nextUrl.searchParams,
      "organization"
    );
    const descending = getUrlSearchParameter(
      req.nextUrl.searchParams,
      "descending"
    );

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

    let query = firestore
      .collection("batches")
      .where("organization", "==", organization)
      .where("isFinished", "==", false);

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
    if (isCheckedOut !== null) {
      query = query.where("isCheckedOut", "==", isCheckedOut == "true");
    }
    // if (isFinished != null) {
    //   query = query.where("isFinished", "==", isFinished == "true");
    // }
    if (isFull != null) {
      query = query.where("isFull", "==", isFull == "true");
    }

    if (limit) {
      query = query.limit(Number(limit));
    }
    if (offset) {
      query = query.offset(Number(offset));
    }
    if (descending != null) {
      query = query.orderBy("timeCreated", descending == "true" ? "desc" : "asc");
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
