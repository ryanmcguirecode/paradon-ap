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
const userId = "utexas";
const files = Array.from(
  { length: 1300 },
  (_, i) => `testing/test-invoices/test-invoice-${i + 1}.pdf`
);

// Function to upload a file with metadata
async function uploadFileWithMetadata(filePath, userId) {
  const maxRetries = 10;
  let retryCount = 0;
  const baseDelay = 1000;

  while (retryCount < maxRetries) {
    try {
      const fileName = path.basename(filePath);
      await storage.bucket(bucketName).upload(filePath, {
        destination: fileName,
        metadata: {
          metadata: {
            organization: userId,
            documentType: "invoice",
            model: "azureInvoice",
          },
        },
      });
      console.log(
        `File ${filePath} uploaded to ${bucketName} with userId ${userId}.`
      );
      return;
    } catch (err) {
      console.error(`Failed to upload file ${filePath}: ${err.message}`);
      const delay =
        baseDelay * Math.pow(2, retryCount) * (1 + 5 * Math.random());
      await new Promise((resolve) => setTimeout(resolve, delay));
      retryCount++;
    }
  }
}

// Function to upload files in parallel
async function uploadFiles() {
  const uploadPromises = files.map((file) =>
    uploadFileWithMetadata(file, userId)
  );
  await Promise.all(uploadPromises);
  console.log("Upload complete.");
}

// Run the uploadFiles function
uploadFiles();
