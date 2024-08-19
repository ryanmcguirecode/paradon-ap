import sql from "mssql";

import { openExternalDB } from "../../../mssql/external";
import { openInternalDB } from "../../../mssql/internal";
import { sanitizeInput } from "@/utils/sanitizeInput";

const BATCH_SIZE = 1000;

export async function POST(request) {
  const { transformation, keyColumn, valueColumn, tableName, organization } =
    await request.json();

  if (
    !transformation ||
    !keyColumn ||
    !valueColumn ||
    !tableName ||
    !organization
  ) {
    return new Response(
      JSON.stringify({
        message: "Missing required parameters.",
      }),
      { status: 400 }
    );
  }

  let values = [];
  const externalDB = await openExternalDB();
  try {
    const externalData = await externalDB
      .request()
      .query(`SELECT [${keyColumn}], [${valueColumn}] FROM [${tableName}]`);
    // Use a Map to filter out duplicates based on the keyColumn
    const uniqueMap = new Map();
    externalData.recordset.forEach((row) => {
      const escapedKey = sanitizeInput(row[keyColumn]);
      const escapedValue = row[valueColumn]?.replace(/'/g, "''");
      if (!uniqueMap.has(escapedKey)) {
        uniqueMap.set(escapedKey, escapedValue);
        values.push(
          `('${escapedKey}', '${escapedValue}', '', '${transformation}', 'db')`
        );
      }
    });
    externalDB.close();
  } catch (error) {
    console.error("Error fetching data from the external database:", error);
    externalDB.close();
    return new Response(
      JSON.stringify({
        message:
          "An error occurred while fetching data from the external database.",
      }),
      { status: 500 }
    );
  }

  const internalDB = await openInternalDB();
  const transaction = new sql.Transaction(internalDB);
  await transaction.begin();
  if (!internalDB) {
    return new Response(
      JSON.stringify({
        message: "Failed to connect to the database.",
      }),
      { status: 500 }
    );
  }
  try {
    await transaction
      .request()
      .query(
        `DELETE FROM [${organization}Mappings] WHERE [source] = 'db' AND [transformation] = '${transformation}'`
      );

    // Insert in batches
    for (let i = 0; i < values.length; i += BATCH_SIZE) {
      const batchValues = values.slice(i, i + BATCH_SIZE).join(", ");
      const insertQuery =
        `INSERT INTO [${organization}Mappings] ([key], [value], [created_by], [transformation], [source]) VALUES ` +
        batchValues;
      await transaction.request().query(insertQuery);
    }

    await transaction.commit();

    return new Response(
      JSON.stringify({ message: "Internal database updated successfully." }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating the internal database:", error);
    await transaction.rollback();
    throw error;
  } finally {
    await internalDB.close();
  }
}
