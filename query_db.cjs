const { Pool } = require('pg');
require('dotenv').config();

async function query() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const res = await pool.query('SELECT * FROM public_profiles');
  console.log(res.rows);
  await pool.end();
}
query();
