require("dotenv").config({ path: ".env.local" });
const readline = require("readline");
const { Firestore, Timestamp } = require("@google-cloud/firestore");

const credentials = JSON.parse(
  process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || "{}"
);

const firestore = new Firestore({
  projectId: credentials.project_id,
  credentials: {
    client_email: credentials.client_email,
    private_key: credentials.private_key.replace(/\\n/gm, "\n"),
  },
});

const combinations = (fields) => {
  return fields.reduce((a, v) => a.concat(a.map((r) => [v, ...r])), [[]]);
};

const promptUserToContinue = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      "An error occurred. Please add the missing index and press Enter to continue...",
      () => {
        rl.close();
        resolve();
      }
    );
  });
};

const testBatchCombination = async (combination) => {
  let query = firestore
    .collection("batches")
    .where("organization", "==", organization);

  if (combination.includes("createdFromDate"))
    query = query.where("timeCreated", ">=", Timestamp.fromDate(new Date()));
  if (combination.includes("createdToDate"))
    query = query.where("timeCreated", "<=", Timestamp.fromDate(new Date()));
  if (combination.includes("isCheckedOut"))
    query = query.where("isCheckedOut", "==", false);
  if (combination.includes("isFinished"))
    query = query.where("isFinished", "==", false);
  if (combination.includes("isFull")) query = query.where("isFull", "==", true);
  try {
    const snapshot = await query.get();
    const batches = snapshot.docs.map((doc) => doc.data());

    return batches.length;
  } catch (error) {
    console.error(`Failed for combination: ${combination}`, error);
    await promptUserToContinue();
  }
};

const testDocumentCombination = async (combination) => {
  let query = firestore
    .collection("documents")
    .where("organization", "==", organization);

  if (combination.includes("createdFromDate"))
    query = query.where("timeCreated", ">=", Timestamp.fromDate(new Date()));
  if (combination.includes("createdToDate"))
    query = query.where("timeCreated", "<=", Timestamp.fromDate(new Date()));
  if (combination.includes("filename"))
    query = query.where("filename", "==", "test.pdf");
  if (combination.includes("reviewed"))
    query = query.where("reviewed", "==", false);
  if (combination.includes("offset")) query = query.offset(0);
  if (combination.includes("limit")) query = query.limit(10);
  try {
    const snapshot = await query.get();
    const documents = snapshot.docs.map((doc) => doc.data());

    return documents.length;
  } catch (error) {
    console.error(`Failed for combination: ${combination}`, error);
    await promptUserToContinue();
  }
};

const createBatchesIndices = async () => {
  const allCombinations = combinations(batchesFields);

  let i = 1;
  for (const combination of allCombinations) {
    const numBatches = await testBatchCombination(combination);
    console.log(`${i}. ${combination}: ${numBatches} batches found.`);
    i++;
  }
};

const createDocumentsIndices = async () => {
  const allCombinations = combinations(documentsFields);

  let i = 1;
  for (const combination of allCombinations) {
    const numDocuments = await testDocumentCombination(combination);
    console.log(`${i}. ${combination}: ${numDocuments} documents found.`);
    i++;
  }
};

const organization = "utexas";

const batchesFields = [
  "createdFromDate",
  "createdToDate",
  "isCheckedOut",
  "isFinished",
  "isFull",
];

const documentsFields = [
  "createdFromDate",
  "createdToDate",
  "filename",
  "reviewed",
  "offset",
  "limit",
];

createBatchesIndices();
createDocumentsIndices();
