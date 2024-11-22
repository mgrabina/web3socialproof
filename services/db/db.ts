import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

dotenv.config();

let client: ReturnType<typeof postgres> | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;

export const getDb = () => {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

  if (!client) {
    client = postgres(process.env.DATABASE_URL);
  }
  if (!dbInstance) {
    dbInstance = drizzle(client);
  }

  return dbInstance;
};

export const db = getDb();
