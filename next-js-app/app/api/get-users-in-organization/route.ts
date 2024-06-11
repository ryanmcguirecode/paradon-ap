import { NextRequest, NextResponse } from "next/server";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

async function POST(req: NextRequest) {
  const { organization, serviceAccount } = await req.json();

  if (!organization) {
    return NextResponse.json({ message: "No organization" }, { status: 500 });
  } else if (!serviceAccount) {
    return NextResponse.json(
      { message: "No service account" },
      { status: 500 }
    );
  }

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
