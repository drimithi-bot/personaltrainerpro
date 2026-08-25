const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query(`
  ALTER TABLE public_profiles 
  ADD COLUMN IF NOT EXISTS hero_image_url TEXT,
  ADD COLUMN IF NOT EXISTS hero_image_position TEXT DEFAULT 'background';
`).then(() => {
  console.log("Table altered");
  pool.end();
}).catch(err => {
  console.error("Error altering table", err);
  pool.end();
});
