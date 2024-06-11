import { NextRequest, NextResponse } from "next/server";
import { auth, organizationdb } from "../auth"; // Assuming db is your Firestore instance
import * as admin from "firebase-admin"; // Import the 'admin' module

async function POST(req: NextRequest) {
  const { organization, email, name, level } = await req.json();
  try {
    // Add the user to the organization in the Firestore collection
    const orgRef = organizationdb.collection("organizations").doc(organization);
    const org = await orgRef.get();

    if (!org.exists) {
      return NextResponse.json(
        { message: "Organization does not exist" },
        { status: 404 }
      );
    } else {
      await orgRef.update({
        users: admin.firestore.FieldValue.arrayUnion({
          name: name,
          email: email,
          level: level,
        }),
      });
    }

    return NextResponse.json(
      { message: "Claims and organization mapping added successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error adding user: ", error);
    return NextResponse.json({ message: "Error adding user" }, { status: 500 });
  }
}

export { POST };
