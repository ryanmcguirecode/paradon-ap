// pages/api/get-user-organization-by-email.ts
import { NextRequest, NextResponse } from "next/server";
import { adminOrganizationDB } from "@/auth/firebaseAdmin";

async function POST(req: NextRequest, res: NextResponse) {
  const { newPermissions, email } = await req.json();

  try {
    const organizationsSnapshot = await adminOrganizationDB
      .collection("organizations")
      .get();
    const organizationRef = adminOrganizationDB.collection("organizations");

    organizationsSnapshot.forEach((doc) => {
      const users = doc.data().users || [];
      var user = users.find((user: any) => user.email === email);
      if (user) {
        user.level = newPermissions;
        organizationRef.doc(doc.id).update({
          users: users,
        });
      }
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
