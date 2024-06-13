// pages/api/get-user-organization-by-email.ts
import { NextRequest, NextResponse } from "next/server";
import { organizationdb } from "../auth";

async function POST(req: NextRequest, res: NextResponse) {
  const { newPermissions, email } = await req.json();

  try {
    const organizationsSnapshot = await organizationdb
      .collection("organizations")
      .get();
    const organizationRef = organizationdb.collection("organizations");

    organizationsSnapshot.forEach((doc) => {
      const users = doc.data().users || [];
      var user = users.find((user: any) => user.email === email);
      organizationRef.doc(doc.data().organization).update(user);
    });
    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    console.error("Error fetching organization: ", error);
    return NextResponse.json(
      { message: "Error fetching organization" },
      { status: 500 }
    );
  }
}

export { POST };
