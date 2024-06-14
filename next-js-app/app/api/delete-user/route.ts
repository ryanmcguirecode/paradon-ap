import { NextRequest, NextResponse } from "next/server";
import { adminOrganizationDB } from "@/auth/firebaseAdmin";

async function POST(req: NextRequest) {
  const { email, organization } = await req.json();

  try {
    const orgRef = adminOrganizationDB
      .collection("organizations")
      .doc(organization);
    const org = await orgRef.get();
    const data = org.data();
    const users = data && data.users ? data.users : [];
    const updatedUsers = users.filter((user: any) => user.email !== email);
    await orgRef.update({
      users: updatedUsers,
    });
    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    console.error("Error deleting user: ", error);
    return NextResponse.json(
      { message: "Error deleting user" },
      { status: 500 }
    );
  }
}

export { POST };