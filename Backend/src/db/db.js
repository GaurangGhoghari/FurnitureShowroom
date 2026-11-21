
const mysql = require("mysql2");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

dotenv.config();

const useSSL = process.env.DB_SSL === "true";

const dbConfig = {
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "furnitureshowroom",
  port: Number(process.env.DB_PORT || 3306),

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

if (useSSL) {
  dbConfig.ssl = {
    ca: fs.readFileSync(
      path.join(__dirname, "../../certs/ca.pem"),
      "utf8"
    ),
    rejectUnauthorized: true,
  };
}

const db = mysql.createPool(dbConfig);

db.getConnection((error, connection) => {
  if (error) {
    console.error("MySQL Connection Failed:", error.message);
    return;
  }

  console.log("XAMPP MySQL Database Connected");
  connection.release();
});

module.exports = db;
