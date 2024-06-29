const functions = require("@google-cloud/functions-framework");
const { Firestore, FieldValue } = require("@google-cloud/firestore");
const { Storage } = require("@google-cloud/storage");
const extractFields = require("./azureInvoice");

async function addDocumentToBatch(fileName, organization) {
  let retryCount = 0;
  const maxRetries = 10;
  const baseDelay = 500;

  const orgRef = firestore.collection("organizations").doc(organization);
  const orgDoc = await orgRef.get();
  const maxBatchSize = orgDoc.data().batching.maxSize || 100;

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
            documents: [],
            isCheckedOut: false,
            isFinished: false,
            organization: organization,
            owner: null,
            reviewers: [],
            timeCreated: Firestore.Timestamp.now(),
            timeFinished: null,
          };
          transaction.set(batchRef, batchData);
        }

        transaction.update(batchRef, {
          documents: FieldValue.arrayUnion(fileName),
          documentCount: FieldValue.increment(1),
        });
      });
      return;
    } catch (error) {
      if (error.code === 10) {
        console.error(`${fileName} on attempt ${retryCount}:  `, error.details);
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

  try {
    const [metadata] = await storage
      .bucket(bucketName)
      .file(fileName)
      .getMetadata();

    const organization =
      metadata && metadata.metadata && metadata.metadata.organization
        ? metadata.metadata.organization
        : null;

    const fileMetadata = {
      timeCreated: file.timeCreated,
      updated: file.updated,
      organization: organization,
    };

    const docRef = firestore.collection("documents").doc(fileName);
    await docRef.set(fileMetadata);

    await addDocumentToBatch(fileName, organization);
  } catch (error) {
    console.error("Error processing document and assigning to a batch", error);
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
