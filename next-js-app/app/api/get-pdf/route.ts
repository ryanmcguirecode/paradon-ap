"use server";

import { NextRequest, NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";

const credentials = JSON.parse(
  process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || "{}"
);

const storage = new Storage({
  credentials: {
    client_email: credentials.client_email,
    private_key: credentials.private_key,
  },
});

const bucketName = "paradon-test-invoices";

async function GET(req: NextRequest) {
  const fileName = req.nextUrl.searchParams.get("fileName");
  if (!fileName) {
    return NextResponse.json({ error: "Missing fileName" }, { status: 400 });
  }

  try {
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileName);
    const [exists] = await file.exists();

    if (!exists) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const readStream = file.createReadStream();

    let data = [];
    for await (const chunk of readStream) {
      data.push(chunk);
    }
    const pdfBuffer = Buffer.concat(data);

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName
          .split("/")
          .pop()}"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch PDF" }, { status: 500 });
  }
}

export { GET };
