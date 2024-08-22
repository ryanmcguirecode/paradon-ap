const functions = require("@google-cloud/functions-framework");
const { Firestore, FieldValue, Timestamp } = require("@google-cloud/firestore");
const { Storage } = require("@google-cloud/storage");
const extractFields = require("./azureInvoice");
const { applyTransformationsStatically } = require("./applyTransformations");
import("pdfjs-dist/legacy/build/pdf.mjs");
const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function extractPDFContent(fileContentBuffer) {
  const pdfArray = new Uint8Array(fileContentBuffer);
  const pdfDocument = await pdfjsLib.getDocument({ data: pdfArray }).promise;

  let allContent = [];

  for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum);
    const textContent = await page.getTextContent();
    allContent.push(...textContent.items);
  }

  return allContent.map((item) => item.str).join(" "); // Return all text content as a single string
}

async function getInvoiceLineItems(textContent, headers) {
  const prompt = `
    Extract the invoice line items from the following text and return them as a JSON array where each item has the following keys: itemNumber, partNumber, description, quantityShipped, unitPrice, and amount:

    "${textContent}"
  `;

  properties = {};
  required = [];

  headers.forEach((header) => {
    properties[header] = { type: "string" };
    required.push(header);
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4o-2024-08-06",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "invoice_response",
        strict: true,
        schema: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: {
                type: "object",
                properties: properties,
                required: required,
                additionalProperties: false,
              },
            },
          },
          required: ["items"],
          additionalProperties: false,
        },
      },
    },
  });
  const jsonResponse = response.choices[0].message.content;
  try {
    return JSON.parse(jsonResponse);
  } catch (error) {
    console.error("Failed to parse JSON from ChatGPT response:", error);
    return null;
  }
}

async function addDocumentToBatch(docId, organization) {
  let retryCount = 0;
  const maxRetries = 10;
  const baseDelay = 500;

  const orgRef = firestore.collection("organizations").doc(organization);
  const orgDoc = await orgRef.get();
  const maxBatchSize = orgDoc.data().batching?.maxSize || 100;

  while (retryCount < maxRetries) {
    try {
      await firestore.runTransaction(async (transaction) => {
        const batchesQuery = firestore
          .collection("batches")
          .where("organization", "==", organization)
          .where("documentCount", "<", maxBatchSize)
          .where("isCheckedOut", "==", false)
          .where("isFinished", "==", false)
          .orderBy("timeCreated", "asc")
          .limit(1);
        const batchesSnapshot = await transaction.get(batchesQuery);
        let batchRef = null;
        let batchData = null;

        for (const batchDoc of batchesSnapshot.docs) {
          batchRef = batchDoc.ref;
          batchData = batchDoc.data();
        }

        if (!batchRef) {
          // Create a new batch if no existing batch has space
          console.log("creating new batch");

          const newBatchDoc = firestore.collection("batches").doc(); // Generate a new unique batch document reference
          batchRef = newBatchDoc;
          batchData = {
            batchId: newBatchDoc.id,
            batchName: "Batch",
            documentCount: 0,
            documentIndex: 0,
            documents: [],
            isCheckedOut: false,
            isFinished: false,
            isFull: false,
            organization: organization,
            owner: null,
            reviewer: "",
            timeCreated: Timestamp.now(),
            timeFinished: null,
          };
          transaction.set(batchRef, batchData);
        }

        transaction.update(batchRef, {
          documents: FieldValue.arrayUnion(docId),
          documentCount: FieldValue.increment(1),
          isFull: batchData.documentCount + 1 >= maxBatchSize,
        });
      });
      return;
    } catch (error) {
      if (error.code === 10) {
        console.error(`${docId} on attempt ${retryCount}:  `, error.details);
        const delay =
          baseDelay * Math.pow(2, retryCount) * (1 + 5 * Math.random());
        await new Promise((resolve) => setTimeout(resolve, delay));
        retryCount++;
      } else {
        console.error("NON-CONTENTION ERROR", error);
        return;
      }
    }
  }
}

// Initialize Firestore
const firestore = new Firestore({
  projectId: "goatrange",
  /* FOR TESTING: REMOVE FOR CLOUD FUNCTION */
  keyFilename: "./service-account.json",
  /* FOR TESTING: REMOVE FOR CLOUD FUNCTION */
});

// Initialize Storage client
const storage = new Storage({
  projectId: "goatrange",
  /* FOR TESTING: REMOVE FOR CLOUD FUNCTION */
  keyFilename: "./service-account.json",
  /* FOR TESTING: REMOVE FOR CLOUD FUNCTION */
});

/* functions.cloudEvent('createDocumentMetadata', async (cloudEvent) => { */
module.exports = async function createDocumentMetadata(cloudEvent) {
  /* FOR TESTING: REMOVE FOR CLOUD FUNCTION */
  cloudEvent = cloudEvent.body;
  /* FOR TESTING: REMOVE FOR CLOUD FUNCTION */

  const file = cloudEvent.data;
  const bucketName = file.bucket;
  const fileName = file.name;
  const documentType = file.documentType;
  let organization;

  let generatedDocId = null;
  try {
    const [metadata] = await storage
      .bucket(bucketName)
      .file(fileName)
      .getMetadata();

    organization = metadata?.metadata?.organization;

    const fileMetadata = {
      filename: fileName,
      organization: organization,
      reviewed: false,
      timeCreated: Timestamp.fromDate(new Date(file.timeCreated)),
      updated: null,
    };

    const docRef = firestore.collection("documents").doc();
    generatedDocId = docRef.id;
    await docRef.set({ id: generatedDocId, ...fileMetadata });

    await addDocumentToBatch(generatedDocId, organization);
  } catch (error) {
    console.error("Error processing document and assigning to a batch", error);
  }

  try {
    if (!generatedDocId) {
      throw new Error("No document ID generated");
    }

    const fileContent = await storage
      .bucket(bucketName)
      .file(fileName)
      .download();

    const docConfig = (
      await firestore.collection("organizations").doc(organization).get()
    )
      .data()
      .documentTypes.find((doc) => doc.id === documentType);
    const headers = docConfig.lineItems.headers;

    const detectedFields = await extractFields(fileContent[0]);
    const textContent = await extractPDFContent(fileContent[0]);
    const invoiceLineItems = await getInvoiceLineItems(textContent, headers);
    const items = invoiceLineItems?.items;
    const fields = await applyTransformationsStatically(
      organization,
      detectedFields,
      documentType,
      firestore.collection("organizations").doc(organization)
    );
    const docRef = firestore.collection("documents").doc(generatedDocId);
    await docRef.update({
      documentType: documentType,
      detectedFields: detectedFields,
      fields: fields,
      items: {
        headers: headers,
        rows: items,
      },
      updated: Timestamp.now(),
    });
  } catch (error) {
    console.error(
      "Error downloading file or extracting fields from document",
      error
    );
  }
};
