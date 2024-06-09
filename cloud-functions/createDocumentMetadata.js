const functions = require("@google-cloud/functions-framework");
const { Firestore } = require("@google-cloud/firestore");

const firestore = new Firestore({
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

  const fileMetadata = {
    bucket: file.bucket,
    name: file.name,
    metageneration: file.metageneration,
    timeCreated: file.timeCreated,
    updated: file.updated,
  };

  try {
    // Save metadata to Firestore
    const docRef = firestore.collection("documents").doc(file.name);
    await docRef.set(fileMetadata);
    console.log("Metadata saved to Firestore");
  } catch (error) {
    console.error("Error saving metadata to Firestore", error);
  }
};

// npm start
//
// curl -X POST http://localhost:8080 -H "Content-Type: application/json" -d '{
//   "data": {
//     "name": "test.pdf",
//     "bucket": "paradon-ap-test",
//     "contentType": "application/json",
//     "metageneration": "1",
//     "timeCreated": "2020-04-23T07:38:57.230Z",
//     "updated": "2020-04-23T07:38:57.230Z"
//   },
//   "type": "google.cloud.storage.object.v1.finalized",
//   "specversion": "1.0",
//   "source": "//pubsub.googleapis.com/",
//   "id": "1234567890"
// }'
