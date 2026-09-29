import mysql from "mysql2/promise";

// Reuse one pool across dev hot reloads.
const globalForDb = globalThis as unknown as { pool?: mysql.Pool };

// decimalNumbers: return SUM() results as numbers instead of strings.
const pool =
  globalForDb.pool ?? mysql.createPool({ uri: process.env.DATABASE_URL, decimalNumbers: true });

if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

export async function query<T = unknown>(sql: string, params: unknown[] = []): Promise<T[]> {
  const [rows] = await pool.query(sql, params);
  return rows as T[];
}
