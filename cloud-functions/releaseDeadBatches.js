const functions = require("@google-cloud/functions-framework");
const { Firestore, Timestamp } = require("@google-cloud/firestore");

// check back in batches that have no heartbeat
const firestore = new Firestore({
  projectId: "goatrange",
  /* FOR TESTING: REMOVE FOR CLOUD FUNCTION */
  keyFilename: "./service-account.json",
  /* FOR TESTING: REMOVE FOR CLOUD FUNCTION */
});

async function releaseDeadBatches(req, res) {
  // functions.http('releaseDeadBatches', async (req, res) => {
  try {
    const now = Timestamp.now();

    const batchesSnapshot = await firestore
      .collection("batches")
      .where("isCheckedOut", "==", true)
      .where("isFinished", "==", false)
      .get();

    const batchDocs = batchesSnapshot.docs;

    for (const batchDoc of batchDocs) {
      const batch = batchDoc.data();
      const heartbeat = batch.heartbeat._seconds;
      const diff = now.seconds - heartbeat;

      console.log(`Batch ${batchDoc.id} has been inactive for ${diff} seconds`);

      if (diff < 1200) {
        continue;
      }

      await batchDoc.ref.update({
        isCheckedOut: false,
        owner: null,
      });
    }

    // res.status(200).send("Batch processing completed.");
  } catch (error) {
    console.error("Error releasing dead batches:", error);
    // res.status(500).send("An error occurred while processing batches.");
  }
}

releaseDeadBatches(null, null);
