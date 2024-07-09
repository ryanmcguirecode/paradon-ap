import { NextRequest, NextResponse } from "next/server";
import { Firestore, Timestamp } from "@google-cloud/firestore";

export async function POST(req: NextRequest) {
  const { batch, organization } = await req.json();

  if (!batch) {
    return NextResponse.json(
      { acquired: false, error: "Missing batch" },
      { status: 400 }
    );
  } else if (!organization) {
    return NextResponse.json(
      { acquired: false, error: "Missing organization" },
      { status: 400 }
    );
  }

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

    const batchRef = firestore.collection("batches").doc(batch);
    const batchDoc = await batchRef.get();
    if (!batchDoc.exists) {
      return NextResponse.json(
        { acquired: false, error: "Batch not found" },
        { status: 404 }
      );
    }
    const batchData = batchDoc.data();
    if (!batchData || batchData.organization !== organization) {
      return NextResponse.json(
        { acquired: false, error: "Unauthorized batch access" },
        { status: 401 }
      );
    }

    await batchRef.update({
      isCheckedOut: false,
      isFinished: true,
      timeFinished: Timestamp.now(),
    });

    const documents = batchData.documents;
    for (const doc of documents) {
      const docRef = firestore.collection("documents").doc(doc);
      await docRef.update({
        reviewed: true,
        updated: Timestamp.now(),
      });
    }

    return NextResponse.json({ message: "success" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
