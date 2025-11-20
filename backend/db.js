const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',       // usually localhost
    user: 'root',            // your MySQL username
    password: 'MySQL@123',// your MySQL password
    database: 'pulsenews',   // must exist
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;
