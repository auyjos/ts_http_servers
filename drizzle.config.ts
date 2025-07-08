import { defineConfig } from "drizzle-kit";

// Load environment variables directly
process.loadEnvFile();

function envOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is required`);
  }
  return value;
}

export default defineConfig({
  schema: "dist/src/db/schema/*",
  out: "src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: envOrThrow("DB_URL"),
  },
});