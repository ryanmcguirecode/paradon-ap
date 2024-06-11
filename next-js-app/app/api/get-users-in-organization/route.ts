import { NextRequest, NextResponse } from "next/server";
import { auth, organizationdb } from "../auth";
import exp from "constants";

async function POST(req: NextRequest) {
  const { organization } = await req.json();
  try {
    const orgRef = organizationdb.collection('organizations').doc(organization);
    const org = await orgRef.get();

    const data = org.data();
    return NextResponse.json(data && data.users ? data.users : {}, { status: 200 });
  } catch (error) {
    console.error("Error fetching organization: ", error);
    return NextResponse.json({ message: "Error fetching organization" }, { status: 500 });
  }
}

export { POST };