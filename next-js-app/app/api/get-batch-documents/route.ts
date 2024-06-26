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
    const batchId = req.nextUrl.searchParams.get("batchId");
    if (!batchId) {
      return NextResponse.json({ error: "Missing batchId" }, { status: 400 });
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
      .where("batchId", "==", batchId);

    const snapshot = await query.get();
    const batches = snapshot.docs.map((doc) => doc.data());
    if (batches.length === 0) {
      return NextResponse.json(
        { error: "Failed to find batch" },
        { status: 404 }
      );
    } else if (batches.length > 1) {
      return NextResponse.json(
        { error: "Found multiple batches with same ID" },
        { status: 500 }
      );
    }

    const documentNames = batches[0].documents;
    const documents = [];

    for (const documentName of documentNames) {
      const documentRef = await firestore
        .collection("documents")
        .doc(documentName)
        .get();

      if (!documentRef.exists) {
        return NextResponse.json(
          { error: "Failed to find document" },
          { status: 404 }
        );
      } else {
        const document = documentRef.data();
        if (document.organization !== organization) {
          return NextResponse.json(
            { error: "Document does not belong to batch" },
            { status: 400 }
          );
        }
        documents.push({ ...document, filename: documentRef.id });
      }
    }

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Error executing query:", error);
    return NextResponse.json(
      { error: "Failed to execute query" },
      { status: 500 }
    );
  }
}
