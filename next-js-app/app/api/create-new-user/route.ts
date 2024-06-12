import { NextRequest, NextResponse } from "next/server";
import { createUserWithEmailAndPassword } from "firebase/auth";
import * as admin from "firebase-admin";
import { app, auth } from "@/auth/firebase";
import { adminAuth, adminOrganizationDB } from "@/auth/firebaseAdmin";

async function POST(req: NextRequest) {
  try {
    const { organization, email, password, name, level } = await req.json();

    if (!organization || !email || !password || !name || !level) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;
    await adminAuth.setCustomUserClaims(user.uid, {
      level: level,
      organization: organization,
    });

    const orgRef = adminOrganizationDB
      .collection("organizations")
      .doc(organization);
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
