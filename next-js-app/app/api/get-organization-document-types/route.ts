import { NextRequest, NextResponse } from "next/server";
import { adminOrganizationDB } from "@/auth/firebaseAdmin";

async function POST(req: NextRequest) {
  const { organization } = await req.json();

  if (!organization) {
    return NextResponse.json({ message: "No organization" }, { status: 500 });
  }

  try {
    const orgRef = adminOrganizationDB
      .collection("organizations")
      .doc(organization);
    const org = await orgRef.get();
    const data = org.data();
    return NextResponse.json(
      data && data.documentTypes ? data.documentTypes : [],
      {
        status: 200,
      }
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
