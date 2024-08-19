// import { NextRequest, NextResponse } from "next/server";
// import { openDB } from "../../../sqlite/db.js";
// import getUrlSearchParameter from "@/utils/getUrlSearchParameter";

// export async function GET(req) {
//   try {
//     const key = getUrlSearchParameter(req.nextUrl.searchParams, "key");
//     const organization = getUrlSearchParameter(
//       req.nextUrl.searchParams,
//       "organization"
//     );
//     const transformation = getUrlSearchParameter(
//       req.nextUrl.searchParams,
//       "transformation"
//     )?.toLowerCase();
//     const db = await openDB();
//     if (transformation && key) {
//       return NextResponse.json(
//         await db.all(
//           `SELECT * FROM ${organization}Mappings WHERE key = ? AND transformation = ?`,
//           key,
//           transformation
//         )
//       );
//     } else if (transformation) {
//       return NextResponse.json(
//         await db.all(
//           `SELECT * FROM ${organization}Mappings WHERE transformation = ?`,
//           transformation
//         )
//       );
//     } else {
//       return NextResponse.json(
//         await db.all(`SELECT * FROM ${organization}Mappings`)
//       );
//     }
//   } catch (error) {
//     console.error("Error executing query:", error);
//     return NextResponse.json(
//       { error: "Failed to execute query" },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(req) {
//   try {
//     const { data, organization } = await req.json();
//     const db = await openDB();

//     let baseQuery = `INSERT INTO ${organization}Mappings (key, value, created_by, transformation) VALUES `;

//     let query = baseQuery;
//     const values = [];

//     // Add placeholders and corresponding values
//     data.forEach((item, index) => {
//       if (index !== 0) query += ", ";
//       query += "(?, ?, ?, ?)";
//       values.push(
//         item.key,
//         item.value,
//         item.createdBy,
//         item.transformation.toLowerCase()
//       );
//     });

//     query += ` ON CONFLICT(key, transformation)
//     DO UPDATE SET
//         value = excluded.value,
//         created_by = excluded.created_by,
//         transformation = excluded.transformation;`;

//     db.run(query, values, function (err) {
//       if (err) {
//         return console.error("Error creating mapping:", err.message);
//       }
//     });

//     return NextResponse.json({ message: "Mapping created successfully" });
//   } catch (error) {
//     console.error("Error creating mapping:", error);
//     return NextResponse.json(
//       { error: "Failed to create mapping" },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(req) {
//   try {
//     const { transformation, organization } = await req.json();
//     const db = await openDB();

//     await db.run(
//       `DELETE FROM ${organization}Mappings WHERE transformation = ?`,
//       [transformation.toString().toLowerCase()]
//     );

//     return NextResponse.json({ message: "Mapping deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting mapping:", error);
//     return NextResponse.json(
//       { error: "Failed to delete mapping" },
//       { status: 500 }
//     );
//   }
// }
