import { defineConfig } from "drizzle-kit";

try {
  process.loadEnvFile();
} catch {
  // No .env file — rely on variables provided by the environment (e.g. CI).
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://coursify:coursify@localhost:5432/coursify",
  },
  strict: true,
  verbose: true,
});
