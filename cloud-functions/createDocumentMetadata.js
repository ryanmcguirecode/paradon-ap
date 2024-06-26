const functions = require("@google-cloud/functions-framework");
const { Firestore, FieldValue } = require("@google-cloud/firestore");
const { Storage } = require("@google-cloud/storage");
const extractFields = require("./azureInvoice");

// async function addDocumentToBatch(fileName, organization) {
//   const maxRetries = 10;
//   let retryCount = 0;
//   const baseDelay = 1000; // Base delay in ms for exponential backoff

//   while (retryCount < maxRetries) {
//     try {
//       await firestore.runTransaction(async (transaction) => {
//         // Check if document is already in a batch
//         const existingBatchQuery = firestore
//           .collection("batches")
//           .where("organization", "==", organization)
//           .where("documents", "array-contains", fileName)
//           .limit(1);

//         const existingBatchSnapshot = await transaction.get(existingBatchQuery);
//         if (!existingBatchSnapshot.empty) {
//           console.log(`Document ${fileName} is already in a batch.`);
//           return;
//         }

//         // Fetch the organization document to get max batch size
//         const orgRef = firestore.collection("organizations").doc(organization);
//         const orgDoc = await transaction.get(orgRef);

//         if (!orgDoc.exists) {
//           throw new Error(`Organization ${organization} does not exist`);
//         }
//         const maxBatchSize = orgDoc.data().batching.maxSize;
//         const batchBy = orgDoc.data().batching.batchBy;

//         // Find an existing batch for the organization with space for more documents
//         const batchesQuery = firestore
//           .collection("batches")
//           .where("organization", "==", organization)
//           .orderBy("created", "asc");

//         const batchesSnapshot = await transaction.get(batchesQuery);
//         let batchRef = null;
//         let batchData = null;

//         // Check for a batch with available space
//         for (const batchDoc of batchesSnapshot.docs) {
//           const documents = batchDoc.data().documents || [];
//           if (documents.length < maxBatchSize) {
//             batchRef = batchDoc.ref;
//             batchData = batchDoc.data();
//             break;
//           }
//         }

//         if (!batchRef) {
//           // Create a new batch if no existing batch has space
//           console.log("creating new batch for file", fileName);
//           const newBatchDoc = firestore.collection("batches").doc(); // Generate a new unique batch document reference
//           batchRef = newBatchDoc;
//           batchData = {
//             batchId: newBatchDoc.id, // Use the auto-generated ID from the document reference
//             organization: organization,
//             documents: [],
//             created: Firestore.Timestamp.now(),
//           };
//           transaction.set(batchRef, batchData);
//         }

//         // Add the document to the batch
//         batchData.documents.push(fileName);
//         transaction.update(batchRef, { documents: batchData.documents });
//       });
//       console.log(
//         `Document ${fileName} assigned to a batch ${batchData.batchId} successfully in ${retryCount} tries`
//       );
//       return;
//     } catch (error) {
//       if (retryCount < maxRetries - 1) {
//         // Exponential backoff
//         const delay = baseDelay * Math.pow(2, retryCount) * (1 + Math.random());
//         console.error(
//           `Error processing document and assigning to a batch. Retrying in ${delay}ms`,
//           error
//         );
//         await new Promise((resolve) => setTimeout(resolve, delay));
//         retryCount++;
//       } else {
//         console.error(
//           "Error processing document and assigning to a batch",
//           error
//         );
//         throw error;
//       }
//     }
//   }
// }

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
          .orderBy("created", "asc")
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
            batchId: newBatchDoc.id, // Use the auto-generated ID from the document reference
            organization: organization,
            documents: [],
            documentCount: 0,
            created: Firestore.Timestamp.now(),
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
