// Applies all pending SQL migration files to Turso using the pure-JS web client.
// Safe to re-run — already-applied statements fail silently (table/index exists).
import { createClient } from '@libsql/client/web'
import { readFileSync, readdirSync } from 'node:fs'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

const dir = 'lib/db/migrations'
const files = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()

for (const f of files) {
  const sql = readFileSync(`${dir}/${f}`, 'utf8')
  const stmts = sql.split('--> statement-breakpoint').map((s) => s.trim()).filter(Boolean)
  for (const stmt of stmts) {
    try {
      await client.execute(stmt)
      console.log(`OK  ${f} :: ${stmt.split('\n')[0].slice(0, 72)}`)
    } catch (e) {
      if (e.message?.includes('already exists') || e.message?.includes('duplicate column')) {
        console.log(`SKP ${f} :: already exists / duplicate column`)
      } else {
        console.error(`ERR ${f} :: ${e.message}`)
        process.exit(1)
      }
    }
  }
}
console.log('DONE')
