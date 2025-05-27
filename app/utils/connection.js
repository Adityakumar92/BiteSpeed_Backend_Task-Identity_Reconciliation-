require("dotenv").config();
const mysql = require("mysql2/promise");

const { DB_HOST, DB_PORT, DB_USER, DB_PWD , DB} = process.env;

async function connectDB() {
    const db = await mysql.createConnection({
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PWD,
        database: DB,
        multipleStatements: true
    });

    console.log("Successfully connected to MySQL server!");
    return db;
}

module.exports = connectDB;