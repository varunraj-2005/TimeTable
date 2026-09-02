const fs = require('fs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDB() {
    try {
        console.log("Connecting without database to create if not exists...");
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });
        
        await connection.query('CREATE DATABASE IF NOT EXISTS timetable_db;');
        console.log("Database ensured.");
        await connection.end();

        console.log("Connecting to timetable_db...");
        const pool = require('./db');
        const schema = fs.readFileSync('./schema.sql', 'utf8');
        
        const statements = schema.split(';').filter(stmt => stmt.trim());
        for (let stmt of statements) {
            await pool.query(stmt);
        }
        
        console.log("Database initialized successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Failed to initialize database:", err);
        process.exit(1);
    }
}

initDB();
