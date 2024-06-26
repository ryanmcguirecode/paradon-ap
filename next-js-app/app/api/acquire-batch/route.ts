import { NextRequest, NextResponse } from "next/server";
// import { BigQuery } from "@google-cloud/bigquery";
// import Redis from "ioredis";
// @ts-ignore
// import Redlock from "redlock";

// async function acquireLock(batchId: string) {
//   try {
//     const redisClient = new Redis({
//       host: "localhost",
//       port: 6379,
//       connectTimeout: 1000,
//     });

//     const redlock = new Redlock([redisClient], {
//       driftFactor: 0.01,
//       retryCount: 0,
//       retryDelay: 200,
//       retryJitter: 200,
//       automaticExtensionThreshold: 500,
//     });

//     let lock = await redlock.acquire(batchId, 20000); // Acquire for 20 seconds
//     return { lock: lock, client: redisClient };
//   } catch (err) {
//     console.error("Failed to acquire lock:", err);
//     return { lock: null, client: null };
//   }
// }

// async function releaseLockAndExit(lock: any, client: any) {
//   try {
//     await lock.release();
//     await client.quit();
//   } catch (error) {
//     console.error("Failed to release lock and exit:", error);
//   }
// }

// async function checkAndUpdateOwner(batchId: string, callerId: string) {
//   try {
//     const credentials = JSON.parse(
//       process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || "{}"
//     );

//     const bigquery = new BigQuery({
//       projectId: credentials.project_id,
//       credentials: {
//         client_email: credentials.client_email,
//         private_key: credentials.private_key.replace(/\\n/gm, "\n"),
//       },
//     });

//     const query = `
//       DECLARE owner STRING;
//       SET owner = (SELECT Owner FROM \`test_invoices.batches\` WHERE BatchId = "${batchId}");
//       BEGIN
//         IF owner IS NULL THEN
//           UPDATE \`test_invoices.batches\` SET Owner = "${callerId}", IsCheckedOut = TRUE WHERE BatchId = "${batchId}";
//         END IF;
//       END;
//       SELECT owner;
//     `;

//     const options = {
//       query: query,
//       location: "US",
//       params: { batchId, callerId },
//     };

//     const [rows] = await bigquery.query(options);
//     const owner = rows.length > 0 ? rows[0].owner : null;

//     if (owner !== null) {
//       return false;
//     }
//     return true;
//   } catch (error) {
//     console.error("Failed to check and update batch ownership:", error);
//     return false;
//   }
// }

export async function GET(req: NextRequest) {
  return NextResponse.json({ acquired: true }, { status: 200 });
  // const batchId = req.nextUrl.searchParams.get("batchId");
  // const callerId = req.nextUrl.searchParams.get("callerId");
  // if (!batchId) {
  //   return NextResponse.json(
  //     { acquired: false, error: "Missing batchId" },
  //     { status: 400 }
  //   );
  // } else if (!callerId) {
  //   return NextResponse.json(
  //     { acquired: false, error: "Missing callerId" },
  //     { status: 400 }
  //   );
  // }

  // let { lock, client } = await acquireLock(batchId);
  // if (!lock || !client) {
  //   return NextResponse.json(
  //     { acquired: false, error: "Unable to acquire lock" },
  //     { status: 500 }
  //   );
  // }

  // const ownershipAcquired = await checkAndUpdateOwner(batchId, callerId);
  // if (!ownershipAcquired) {
  //   releaseLockAndExit(lock, client);
  //   return NextResponse.json(
  //     { acquired: false, error: "Batch already owned, or unable to check" },
  //     { status: 500 }
  //   );
  // }

  // releaseLockAndExit(lock, client);
  // return NextResponse.json({ acquired: true }, { status: 200 });
}
