const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { promisify } = require('util');

dotenv.config();

const dbType = process.env.DB_TYPE;
let db;

if (dbType === 'mysql') {
    const mysql = require('mysql2/promise');

    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    db = {
        query: (sql, params) => pool.execute(sql, params),
        rawPool: pool 
    };
} else {
    const sqlite3 = require('sqlite3').verbose();

    const dbDir = path.resolve(process.cwd(), 'database');
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir);
    }

    const dbPath = path.join(dbDir, 'data.db');
    const sqlite = new sqlite3.Database(dbPath);

    sqlite.runAsync = (sql, params = []) => {
        return new Promise((resolve, reject) => {
            sqlite.run(sql, params, function (err) {
                if (err) return reject(err);
                resolve({ id: this.lastID, changes: this.changes });
            });
        });
    };
    sqlite.getAsync = promisify(sqlite.get).bind(sqlite);
    sqlite.allAsync = promisify(sqlite.all).bind(sqlite);

    db = {
        query: async (sql, params = []) => {
            const isSelect = sql.trim().toLowerCase().startsWith('select');
            if (isSelect) {
                return [await sqlite.allAsync(sql, params)];
            }
            const result = await sqlite.runAsync(sql, params);
            return [{ affectedRows: result.changes, id: result.id }];
        },
        rawSqlite: sqlite 
    };
}

module.exports = db;
