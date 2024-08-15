import sql from "mssql";

import { openExternalDB } from "../../../mssql/external";
import { openInternalDB } from "../../../mssql/internal";

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
  // Connect to the external database
  const externalDB = await openExternalDB();
  try {
    // Fetch key and value from the external database
    const externalData = await externalDB
      .request()
      .query(`SELECT [${keyColumn}], [${valueColumn}] FROM [${tableName}]`);
    // Construct a bulk insert query
    values = externalData.recordset
      .map((row) => {
        const escapedKey = row[keyColumn]?.replace(/'/g, "''"); // Escape single quotes
        const escapedValue = row[valueColumn]?.replace(/'/g, "''"); // Escape single quotes
        return `('${escapedKey}', '${escapedValue}', '', '${transformation}', 'db')`;
      })
      .join(", ");
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
  try {
    if (!internalDB) {
      return new Response(
        JSON.stringify({
          message: "Failed to connect to the database.",
        }),
        { status: 500 }
      );
    }

    // // Start a transaction in the internal database
    const transaction = new sql.Transaction(internalDB);
    await transaction.begin();

    // // Delete rows in the internal database where source = 'db'
    await transaction
      .request()
      .query(
        `DELETE FROM [${organization}Mappings] WHERE [source] = 'db' AND [transformation] = '${transformation}'`
      );

    // // Construct a single bulk insert query
    let insertQuery =
      `INSERT INTO [${organization}Mappings] ([key], [value], [created_by], [transformation], [source]) VALUES ` +
      values;

    // // Execute the bulk insert
    await transaction.request().query(insertQuery);

    // // Commit the transaction
    await transaction.commit();

    return new Response(
      JSON.stringify({ message: "Internal database updated successfully." }),
      { status: 200 }
    );
  } catch (error) {
    // Rollback the transaction in case of error
    // await transaction.rollback();
    console.error("Error updating the internal database:", error);
    throw error;
  } finally {
    // Close the connections
    // await externalDB.close();
    await internalDB.close();
  }
}
