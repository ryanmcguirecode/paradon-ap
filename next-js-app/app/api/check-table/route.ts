import { openDB } from "../../../sqlite/db";

export async function GET(req) {
  const db = await openDB();
  try {
    const tables = await db.all(`SELECT name FROM sqlite_master ;`);
    console.log(tables);
    if (tables.length > 0) {
      return new Response(JSON.stringify({ message: "Table exists", tables }), {
        status: 200,
      });
    } else {
      return new Response(JSON.stringify({ message: "Table does not exist" }), {
        status: 404,
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
