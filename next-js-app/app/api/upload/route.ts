import { NextRequest, NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";
import { read, readFile } from "fs";

const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

const storage = new Storage({
  credentials: {
    client_email: credentials.client_email,
    private_key: credentials.private_key,
  },
});

const bucketName = "paradon-ap-test";

export async function GET(req: NextRequest) {
  const fileName = req.nextUrl.searchParams.get("fileName");
  const filePath = req.nextUrl.searchParams.get("filePath");
  const orgId = req.nextUrl.searchParams.get("orgId");
  if (!fileName) {
    return NextResponse.json({ error: "Missing fileName" }, { status: 400 });
  }
  if (!orgId) {
    return NextResponse.json({ error: "Missing orgId" }, { status: 400 });
  }

  try {
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileName + ".pdf");

    // Upload the file
    await bucket.upload(filePath, {
      destination: file,
      // Optional: Set the metadata for the file
      metadata: {
        contentType: "application/pdf",
        metadata: {
          organization: orgId,
        },
      },
    });

    return NextResponse.json({ message: "File uploaded" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
