import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

let pool: Pool;

declare global {
  var _pgPool: Pool | undefined;
}

if (process.env.NODE_ENV === "production") {
  pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 10,
  });
} else {
  if (!global._pgPool) {
    global._pgPool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
    });
  }
  pool = global._pgPool;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function query<T = any>(text: string, params?: unknown[]): Promise<T[]> {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res.rows as T[];
  } finally {
    client.release();
  }
}

export default pool;
