const db = require('../config/db');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

const Admin = {
    create: async (admin) => {
        const sql = `INSERT INTO admin (username, password, department) VALUES (?, ?, ?)`;
        const { username, password, department } = admin;
        try {
            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
            const [result] = await db.query(sql, [username, hashedPassword, department]);

            if (result.affectedRows === 0) {
                throw new Error('No se pudo insertar el administrador, ninguna fila afectada.');
            }

            return {
                id: result.insertId || result.lastID || result.id,
                username,
                department,
            };
        } catch (error) {
            throw error;
        }
    },

    modify: async (admin) => {
        const sql = `UPDATE admin SET username = ?, password = ?, department = ? WHERE id = ?`;
        const { id, username, password, department } = admin;
        try {
            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
            const [result] = await db.query(sql, [username, hashedPassword, department, id]);

            if (result.affectedRows === 0) {
                throw { code: 'ADMIN_NOT_FOUND' };
            }

            return { id, username, department };
        } catch (error) {
            throw error;
        }
    },

    delete: async (id) => {
        const sql = `DELETE FROM admin WHERE id = ?`;
        try {
            const [result] = await db.query(sql, [id]);
            if (result.affectedRows === 0) {
                throw { code: 'ADMIN_NOT_FOUND' };
            }
            return true;
        } catch (error) {
            throw error;
        }
    },

    findAll: async () => {
        const sql = `SELECT * FROM admin ORDER BY id`;
        try {
            const [rows] = await db.query(sql);
            return rows;
        } catch (error) {
            throw error;
        }
    },

    findById: async (id) => {
        const sql = `SELECT id, username, department FROM admin WHERE id = ?`;
        try {
            const [rows] = await db.query(sql, [id]);
            if (rows.length === 0) {
                throw { code: 'ADMIN_NOT_FOUND' };
            }
            return rows[0];
        } catch (error) {
            throw error;
        }
    },

    findByCredentials: async (username, plainPassword) => {
        const sql =
           `SELECT * FROM admin a 
            WHERE a.username = ?
            `;
        try {
            const [rows] = await db.query(sql, [username]);
            if (rows.length === 0) return null;

            const admin = rows[0];
            const isMatch = await bcrypt.compare(plainPassword, admin.password);
            if (!isMatch) return null;

            return {
                id: admin.id,
                department: admin.department,
                    
            };
        } catch (error) {
            throw error;
        }
    },
};

module.exports = Admin;
