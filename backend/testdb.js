const db = require('./db');

async function testConnection() {
    try {
        const [rows] = await db.query('SELECT 1 + 1 AS result');
        console.log('DB Connection Success:', rows);
        process.exit(0);
    } catch (err) {
        console.error('DB Connection Failed:', err);
        process.exit(1);
    }
}

testConnection();
