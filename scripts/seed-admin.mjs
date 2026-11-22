// Seeds the built-in demo admin (admin@astra.africa / admin1234) into Turso and
// self-tests a throwaway signup. Idempotent: safe to re-run.
// Uses the pure-JS web client + bcryptjs so it works without the VC++ Runtime.
import { createClient } from '@libsql/client/web'
import { randomUUID } from 'node:crypto'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'

dotenv.config({ path: '.env.local' })

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

const ADMIN_EMAIL = 'admin@astra.africa'
const ADMIN_PASSWORD = 'admin1234'

// 1) Connection test
const ping = await client.execute('SELECT 1 AS one')
console.log('STEP1_CONNECT_OK ' + JSON.stringify(ping.rows))

// 2) Seed admin if missing
const existing = await client.execute({
  sql: 'SELECT id FROM users WHERE email = ? LIMIT 1',
  args: [ADMIN_EMAIL],
})
if (existing.rows.length > 0) {
  console.log('STEP2_ADMIN_EXISTS (skipping)')
} else {
  const passwordHash = bcrypt.hashSync(ADMIN_PASSWORD, 10)
  await client.execute({
    sql: "INSERT INTO users (id, role, name, email, password_hash) VALUES (?, 'admin', 'Astra Admin', ?, ?)",
    args: [randomUUID(), ADMIN_EMAIL, passwordHash],
  })
  console.log('STEP2_ADMIN_SEEDED')
}

// 3) Verify the admin row (without the hash)
const row = await client.execute({
  sql: 'SELECT id, role, name, email, created_at FROM users WHERE email = ?',
  args: [ADMIN_EMAIL],
})
console.log('STEP3_ADMIN_ROW ' + JSON.stringify(row.rows[0]))

// 4) Self-test: a throwaway signup insert, verify the hash, then clean up
const testEmail = `selftest-${Date.now()}@example.com`
const testHash = bcrypt.hashSync('testpassword', 10)
await client.execute({
  sql: "INSERT INTO users (id, role, name, email, phone, password_hash) VALUES (?, 'seller', 'Self Test', ?, '+1 555 0000', ?)",
  args: [randomUUID(), testEmail, testHash],
})
const back = await client.execute({
  sql: 'SELECT name, role, password_hash FROM users WHERE email = ?',
  args: [testEmail],
})
const ok =
  back.rows.length === 1 &&
  typeof back.rows[0].password_hash === 'string' &&
  back.rows[0].password_hash.startsWith('$2')
console.log('STEP4_SIGNUP_TEST ' + (ok ? 'OK (row inserted, password hashed)' : 'FAIL'))

// 5) Cleanup the throwaway user
await client.execute({ sql: 'DELETE FROM users WHERE email = ?', args: [testEmail] })
console.log('STEP5_CLEANUP done')

console.log('DONE')
