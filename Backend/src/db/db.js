
const mysql = require("mysql2");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

dotenv.config();

const ca = fs.readFileSync(
    path.join(process.cwd(), "certs", "ca.pem")
);

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),

    ssl: {
        ca: ca
    },

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection((error, connection) => {
    if (error) {
        console.log("MySQL Connection Failed");
        console.log(error);
        return;
    }

    console.log("Aiven MySQL Database Connected");
    connection.release();
});

module.exports = db;