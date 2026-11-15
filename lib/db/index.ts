// Database client — import `db` anywhere that runs on the server
// (server components, route handlers, server actions).
//
// Reads credentials from env vars. Next.js loads .env.local automatically;
// drizzle-kit loads it via drizzle.config.ts.
//
// We use the pure-JS `web` entry points for BOTH the libSQL client and the
// Drizzle driver — `@libsql/client/web` and `drizzle-orm/libsql/web` — which is
// all that's needed for a *remote* Turso database and avoids the native libsql
// binding (which requires the Visual C++ Runtime on Windows). The default
// `drizzle-orm/libsql` driver imports `@libsql/client` (the node entry), which
// eagerly loads the native binding and crashes on this machine.

import { drizzle } from "drizzle-orm/libsql/web";
import { createClient } from "@libsql/client/web";

import * as schema from "./schema";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });

export { schema };
