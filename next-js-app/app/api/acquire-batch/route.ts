import { NextRequest, NextResponse } from "next/server";
import { Firestore } from "@google-cloud/firestore";

export async function POST(req: NextRequest) {
  const { batchId, callerId, organization } = await req.json();

  console.log("batchId", batchId);
  console.log("callerId", callerId);
  console.log("organization", organization);

  if (!batchId || batchId === "undefined") {
    return NextResponse.json(
      { acquired: false, error: "Missing batchId" },
      { status: 400 }
    );
  } else if (!callerId || callerId === "undefined") {
    return NextResponse.json(
      { acquired: false, error: "Missing callerId" },
      { status: 400 }
    );
  } else if (!organization || organization === "undefined") {
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

    await firestore.runTransaction(async (transaction) => {
      const batchRef = firestore.collection("batches").doc(batchId);
      const batchDoc = await transaction.get(batchRef);

      if (!batchDoc.exists) {
        return NextResponse.json(
          { acquired: false, error: "Batch not found" },
          { status: 404 }
        );
      }

      const batchData = batchDoc.data();
      if (batchData?.isCheckedOut) {
        return NextResponse.json(
          {
            acquired: false,
            error: `Batch already acquired by ${batchData?.owner}`,
          },
          { status: 409 }
        );
      } else if (batchData?.organization !== organization) {
        return NextResponse.json(
          { acquired: false, error: "Batch not owned by organization" },
          { status: 403 }
        );
      }

      transaction.update(batchRef, {
        isCheckedOut: true,
        owner: callerId,
      });
    });

    return NextResponse.json({ acquired: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { acquired: false, error: error.message },
      { status: 500 }
    );
  }
}
