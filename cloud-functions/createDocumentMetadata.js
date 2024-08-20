const functions = require("@google-cloud/functions-framework");
const { Firestore, FieldValue, Timestamp } = require("@google-cloud/firestore");
const { Storage } = require("@google-cloud/storage");
const extractFields = require("./azureInvoice");
const { applyTransformationsStatically } = require("./applyTransformations");

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
            reviewers: [],
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
    const detectedFields = await extractFields(fileContent[0]);
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
      updated: Timestamp.now(),
    });
  } catch (error) {
    console.error(
      "Error downloading file or extracting fields from document",
      error
    );
  }
};
