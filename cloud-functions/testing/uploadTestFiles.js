const { Storage } = require("@google-cloud/storage");
const path = require("path");
const fs = require("fs");

// Create a Google Cloud Storage client
const storage = new Storage({
  projectId: "goatrange",
  keyFilename: "./service-account.json",
});

// Define variables
const bucketName = "paradon-ap-test";
const userId = "test";
const files = [
  "testing/test-invoices/test-invoice-1.pdf",
  "testing/test-invoices/test-invoice-2.pdf",
  "testing/test-invoices/test-invoice-3.pdf",
  "testing/test-invoices/test-invoice-4.pdf",
  "testing/test-invoices/test-invoice-5.pdf",
];

// Function to upload a file with metadata
async function uploadFileWithMetadata(filePath, userId) {
  try {
    const fileName = path.basename(filePath);
    await storage.bucket(bucketName).upload(filePath, {
      destination: fileName,
      metadata: {
        metadata: {
          userId: userId,
          documentType: "invoice",
          model: "azureInvoice",
        },
      },
    });
    console.log(
      `File ${filePath} uploaded to ${bucketName} with userId ${userId}.`
    );
  } catch (err) {
    console.error(`Failed to upload file ${filePath}: ${err.message}`);
  }
}

// Loop through files and upload each with metadata
async function uploadFiles() {
  for (const file of files) {
    await uploadFileWithMetadata(file, userId);
  }
  console.log("Upload complete.");
}

// Run the uploadFiles function
uploadFiles();
