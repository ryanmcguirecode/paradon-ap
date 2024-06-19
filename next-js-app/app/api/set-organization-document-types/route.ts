import { NextRequest, NextResponse } from "next/server";
import { adminOrganizationDB } from "@/auth/firebaseAdmin";

async function POST(req: NextRequest) {
  const { organization, documentTypes } = await req.json();

  if (!organization) {
    return NextResponse.json({ message: "No organization" }, { status: 500 });
  }

  try {
    const docRef = adminOrganizationDB
      .collection("organizations")
      .doc(organization);

    await docRef.update({ documentTypes });

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
