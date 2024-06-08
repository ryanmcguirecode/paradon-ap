import { NextRequest, NextResponse } from "next/server";
import Redis from "ioredis";
// @ts-ignore
import Redlock from "redlock";

export async function GET(req: NextRequest) {
  const batchId = req.nextUrl.searchParams.get("batchId");
  if (!batchId) {
    return NextResponse.json(
      { acquired: false, error: "Missing batchId" },
      { status: 400 }
    );
  }

  try {
    const redisClient = new Redis({
      host: "localhost",
      port: 6379,
      connectTimeout: 1000,
    });

    const redlock = new Redlock([redisClient], {
      driftFactor: 0.01,
      retryCount: 0,
      retryDelay: 200,
      retryJitter: 200,
      automaticExtensionThreshold: 500,
    });

    let lock = await redlock.acquire(batchId, 1000);
    await new Promise((resolve) => setTimeout(resolve, 10000));

    redisClient.quit();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to acquire lock:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
