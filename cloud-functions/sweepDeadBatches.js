const { Firestore } = require("@google-cloud/firestore");

// check back in batches that have no heartbeat
const firestore = new Firestore({
  projectId: "goatrange",
});

async function sweepDeadBatches() {
  const batches = await firestore.collection("batches").get();
  const batchDocs = batches.docs;

  for (const batchDoc of batchDocs) {
    const batch = batchDoc.data();
    const heartbeat = batch.heartbeat._seconds;
    const now = Date.now() / 1000; // Weird firestore timestamp format
    var diff = now - heartbeat;
    console.log(heartbeat, now, diff);

    console.log(
      `Batch ${batchDoc.id} has been inactive out for ${diff} seconds`
    );

    // greater than 5 minutes
    if (diff > 300) {
      await batchDoc.ref.update({
        isCheckedOut: false,
        owner: null,
      });
    }
  }
}

sweepDeadBatches();
