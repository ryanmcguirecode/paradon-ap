import { NextRequest, NextResponse } from "next/server";
import {
  AzureKeyCredential,
  DocumentAnalysisClient,
} from "@azure/ai-form-recognizer";

const endpoint = "https://centralus.api.cognitive.microsoft.com/";
const key = process.env.AZURE_FORM_RECOGNIZER_KEY;

export async function PUT(req: NextRequest) {
  const buffer = await req.arrayBuffer();
  const fileContent = Buffer.from(buffer);

  if (!fileContent) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  } else if (!key || !endpoint) {
    return NextResponse.json(
      { error: "Azure Form Recognizer credentials not configured" },
      { status: 500 }
    );
  }

  try {
    const client = new DocumentAnalysisClient(
      endpoint,
      new AzureKeyCredential(key)
    );
    const poller = await client.beginAnalyzeDocument(
      "prebuilt-invoice",
      fileContent
    );
    const {
      pages, // pages extracted from the document, which contain lines and words
      tables, // extracted tables, organized into cells that contain their contents
      styles, // text styles (ex. handwriting) that were observed in the document
      keyValuePairs, // extracted pairs of elements  (directed associations from one element in the input to another)
      documents, // extracted fields from the document
    } = await poller.pollUntilDone();

    if (!documents || documents.length === 0) {
      return NextResponse.json(
        { error: "Failed to extract fields from document" },
        { status: 500 }
      );
    } else if (documents.length > 1) {
      return NextResponse.json(
        { error: "Expected only one document to be extracted" },
        { status: 500 }
      );
    }

    const { fields } = documents[0];
    return NextResponse.json({ fields }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to analyze document" },
      { status: 500 }
    );
  }
}
