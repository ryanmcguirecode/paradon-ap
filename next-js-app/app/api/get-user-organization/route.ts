// pages/api/get-user-organization-by-email.ts
import { NextRequest, NextResponse } from "next/server";
import { organizationdb } from "../auth";

async function POST(req: NextRequest, res: NextResponse) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ message: "No email" }, { status: 500 });
  }

  try {
    const organizationsSnapshot = await organizationdb
      .collection("organizations")
      .get();

    let organization = null;
    organizationsSnapshot.forEach((doc) => {
      const users = doc.data().users || [];
      users.filter((user: any) => {
        if (user.email === email) {
          organization = doc.id;
        }
      });
    });
    console.log("Organization found: ", organization, email);
    if (!organization) {
      return NextResponse.json(
        { message: "No organization found" },
        { status: 400 }
      );
    }
    return NextResponse.json({ organization }, { status: 200 });
  } catch (error) {
    console.error("Error fetching organization: ", error);
    return NextResponse.json(
      { message: "Error fetching organization" },
      { status: 500 }
    );
  }
}

export { POST };
