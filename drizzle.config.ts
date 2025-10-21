import { defineConfig } from "drizzle-kit";

// Don't throw during image build when DATABASE_URL is intentionally absent.
// Drizzle commands (like `npm run db:push`) must still be run with DATABASE_URL set.
const dbUrl = process.env.DATABASE_URL ?? "";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
});
