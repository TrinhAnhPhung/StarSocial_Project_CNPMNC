
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { sql, connection } = require('../src/Config/SqlConnection.js');

async function addColumns() {
  try {
    const pool = await connection();
    
    console.log('Checking for Is_Online column...');
    try {
        await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'Is_Online')
        BEGIN
            ALTER TABLE Users ADD Is_Online BIT DEFAULT 0;
            PRINT 'Added Is_Online column';
        END
        ELSE
        BEGIN
            PRINT 'Is_Online column already exists';
        END
        `);
    } catch (e) {
        console.error("Error adding Is_Online:", e.message);
    }

    console.log('Checking for Last_Active column...');
    try {
        await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'Last_Active')
        BEGIN
            ALTER TABLE Users ADD Last_Active DATETIME;
            PRINT 'Added Last_Active column';
        END
        ELSE
        BEGIN
            PRINT 'Last_Active column already exists';
        END
        `);
    } catch (e) {
        console.error("Error adding Last_Active:", e.message);
    }

    console.log('Migration completed.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

addColumns();
