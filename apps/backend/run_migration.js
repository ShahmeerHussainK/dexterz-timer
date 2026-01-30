const { Client } = require('pg');
require('dotenv').config();

const sql = `
-- Mark failed migration as applied
DELETE FROM "_prisma_migrations" WHERE migration_name = '20251229173241_add_active_seconds' AND finished_at IS NULL;

-- Add custom checkin columns
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "custom_checkin_start" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "custom_checkin_end" TEXT;

-- Mark new migration as applied
INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
VALUES (
  gen_random_uuid(),
  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  NOW(),
  '20260109_add_user_custom_times',
  NULL,
  NULL,
  NOW(),
  1
);
`;

async function runMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL.replace('?pgbouncer=true', ''),
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    await client.query(sql);
    console.log('✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await client.end();
  }
}

runMigration();
