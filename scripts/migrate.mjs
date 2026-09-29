import { readFile } from "node:fs/promises";
import mysql from "mysql2/promise";

// Connect without a database first so we can create it if it doesn't exist.
const url = new URL(process.env.DATABASE_URL);
const database = url.pathname.slice(1);
url.pathname = "/";

const sql = await readFile(new URL("../db/schema.sql", import.meta.url), "utf8");
const conn = await mysql.createConnection({ uri: url.toString(), multipleStatements: true });
try {
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
  await conn.query(`USE \`${database}\``);
  await conn.query(sql);
  console.log(`Schema applied to ${database}.`);
} finally {
  await conn.end();
}
