// pages/api/get-user-organization-by-email.ts
import { NextRequest, NextResponse } from "next/server";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

async function POST(req: NextRequest, res: NextResponse) {
  const { email, serviceAccount } = await req.json();

  if (!email) {
    return NextResponse.json({ message: "No email" }, { status: 500 });
  } else if (!serviceAccount) {
    return NextResponse.json(
      { message: "No service account" },
      { status: 500 }
    );
  }

  try {
    let app;
    if (!getApps().filter((app) => app.name === "service").length) {
      app = initializeApp(
        {
          credential: cert(serviceAccount),
        },
        "service"
      );
    } else {
      app = getApps().filter((app) => app.name === "service")[0];
    }
    const auth = getAuth(app);
    const organizationdb = getFirestore(app);

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
