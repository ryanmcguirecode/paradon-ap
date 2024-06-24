import { NextRequest, NextResponse } from "next/server";
import { adminOrganizationDB } from "@/auth/firebaseAdmin";

async function POST(req: NextRequest) {
  try {
    const docRef = adminOrganizationDB.collection("test-synch").doc("test");

    const promises = [];

    for (let i = 0; i < 10; i++) {
      promises.push(docRef.update({ [i + "gloob"]: i + "gloober" }));
    }

    await Promise.all(promises);

    return NextResponse.json(
      { message: "Document types updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching organization or document types: ", error);
    return NextResponse.json(
      { message: "Error fetching organization" },
      { status: 500 }
    );
  }
}

export { POST };
