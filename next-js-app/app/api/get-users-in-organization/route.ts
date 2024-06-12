import { NextRequest, NextResponse } from "next/server";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { organizationdb } from "../auth";

async function POST(req: NextRequest) {
  const { organization } = await req.json();

  if (!organization) {
    return NextResponse.json({ message: "No organization" }, { status: 500 });
  }

  try {
    const orgRef = organizationdb.collection("organizations").doc(organization);
    const org = await orgRef.get();

    const data = org.data();
    return NextResponse.json(data && data.users ? data.users : {}, {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching organization: ", error);
    return NextResponse.json(
      { message: "Error fetching organization" },
      { status: 500 }
    );
  }
}

export { POST };
