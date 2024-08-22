import { Firestore, Timestamp } from "@google-cloud/firestore";
import { NextRequest, NextResponse } from "next/server";
import getUrlSearchParameter from "@/utils/getUrlSearchParameter";
import { Batch } from "@/types/Batch";
import Document from "@/types/Document";

export async function GET(req: NextRequest) {
  try {
    const organization = getUrlSearchParameter(
      req.nextUrl.searchParams,
      "organization"
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
      .where("isFinished", "==", true);

    const snapshot = await query.get();
    const batches: Batch[] = snapshot.docs.map((doc) => doc.data() as Batch);
    let invoiceCountByUser = {};
    let invoiceCountByVendor = {};

    for (let batch of batches) {
      invoiceCountByUser[batch.reviewer] =
        (invoiceCountByUser[batch.reviewer] || 0) + batch.documentCount;
    }

    query = firestore
      .collection("documents")
      .where("organization", "==", organization)
      .where("reviewed", "==", true)
      .where("kickedOut", "==", false);
    const documentsSnapshot = await query.get();
    const documents = documentsSnapshot.docs.map(
      (doc) => doc.data() as Document
    );

    for (let document of documents) {
      invoiceCountByVendor[document.fields["vendor-name"]] =
        (invoiceCountByVendor[document.fields["vendor-name"]] || 0) + 1;
    }

    return NextResponse.json({ invoiceCountByUser, invoiceCountByVendor });
  } catch (error) {
    console.error("Error executing query:", error);
    return NextResponse.json(
      { error: "Failed to execute query" },
      { status: 500 }
    );
  }
}
