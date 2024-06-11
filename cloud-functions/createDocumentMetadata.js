const functions = require("@google-cloud/functions-framework");
const { Firestore } = require("@google-cloud/firestore");
const { Storage } = require("@google-cloud/storage");
const extractFields = require("./azureInvoice");

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

  try {
    const [metadata] = await storage
      .bucket(bucketName)
      .file(fileName)
      .getMetadata();

    const owner = metadata.metadata ? metadata.metadata.userId : null;

    const fileMetadata = {
      timeCreated: file.timeCreated,
      updated: file.updated,
      owner: owner,
    };

    const docRef = firestore.collection("documents").doc(fileName);
    await docRef.set(fileMetadata);
    console.log("Metadata saved to Firestore");
  } catch (error) {
    console.error("Error saving metadata to Firestore", error);
  }

  try {
    const fileContent = await storage
      .bucket(bucketName)
      .file(fileName)
      .download();
    const extractedFields = await extractFields(fileContent[0]);
    const docRef = firestore.collection("documents").doc(fileName);
    await docRef.update({ fields: extractedFields });
  } catch (error) {
    console.error(
      "Error downloading file or extracting fields from document",
      error
    );
  }
};
