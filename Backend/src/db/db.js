
const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Check MySQL connection
db.getConnection((error, connection) => {
    if (error) {
        console.log("MySQL Connection Failed");
        console.log(error);
        return;
    }

    console.log("MySQL Database Connected");

    connection.release();
});

module.exports = db;