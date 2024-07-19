import sqlite3 from "sqlite3";
import { open } from "sqlite";

export async function openDB() {
  return open({
    filename:
      "/Users/dylanmcguire/Desktop/projects/paradon-ap/next-js-app/database.sqlite",
    driver: sqlite3.Database,
  });
}
