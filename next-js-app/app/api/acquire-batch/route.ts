import { NextRequest, NextResponse } from "next/server";
import { Firestore } from "@google-cloud/firestore";

export async function POST(req: NextRequest) {
  const { batchId, callerId, organization } = await req.json();

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
        throw new Error(
          JSON.stringify({
            status: 404,
            response: { acquired: false, error: "Batch not found" },
          })
        );
      }

      const batchData = batchDoc.data();
      if (batchData?.isCheckedOut) {
        throw new Error(
          JSON.stringify({
            status: 409,
            response: {
              acquired: false,
              error: `Batch already acquired by ${batchData?.owner}`,
            },
          })
        );
      } else if (batchData?.organization !== organization) {
        throw new Error(
          JSON.stringify({
            status: 403,
            response: {
              acquired: false,
              error: "Batch not owned by organization",
            },
          })
        );
      }

      transaction.update(batchRef, {
        isCheckedOut: true,
        owner: callerId,
      });
    });

    return NextResponse.json({ acquired: true }, { status: 200 });
  } catch (error) {
    let errorResponse;
    try {
      errorResponse = JSON.parse(error.message);
    } catch (parseError) {
      return NextResponse.json(
        { acquired: false, error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(errorResponse.response, {
      status: errorResponse.status,
    });
  }
}
