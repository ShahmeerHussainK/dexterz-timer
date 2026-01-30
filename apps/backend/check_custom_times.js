const { Client } = require('pg');
require('dotenv').config();

async function checkCustomTimes() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL.replace('?pgbouncer=true', ''),
  });

  try {
    await client.connect();
    const result = await client.query('SELECT email, custom_checkin_start, custom_checkin_end FROM users WHERE custom_checkin_start IS NOT NULL OR custom_checkin_end IS NOT NULL');
    
    console.log('\n✅ Users with custom tracking times:');
    console.table(result.rows);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkCustomTimes();
