// Drizzle Kit configuration — used by the `db:*` npm scripts.
// Loads .env.local (the same file Next.js reads automatically) so the
// database credentials live in one gitignored place.
require("dotenv").config({ path: ".env.local" });

import type { Config } from "drizzle-kit";

export default {
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dialect: "turso",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
} satisfies Config;
