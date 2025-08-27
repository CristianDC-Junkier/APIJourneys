const db = require('../config/db');

const Traveller = {
    create: async (traveller) => {
        const sql = `INSERT INTO traveller (dni, name, signup, department, trip) VALUES (?, ?, ?, ?, ?)`;
        const { dni, name, signup, department, trip } = traveller;

        try {
            const [result] = await db.query(sql, [dni, name, signup, department, trip]);

            return {
                ...traveller,
                id: result.insertId || result.lastID || result.id,
            };
        } catch (error) {
            throw error;
        }
    },

    modify: async (traveller) => {
        const sql = `UPDATE traveller SET dni = ?, name = ?, signup = ?, department = ?, trip = ?, version = (version + 1) % 10000 WHERE id = ? AND version = ?`;

        const { id, dni, name, signup, department, trip, version } = traveller;

        try {
            const [result] = await db.query(sql, [dni, name, signup, department, trip, id, version]);

            if (result.affectedRows === 0) {
                const [rows] = await db.query(`SELECT version FROM traveller WHERE id = ?`, [id]);

                if (rows.length === 0) {
                    throw { code: 'TRAVELLER_NOT_FOUND'};
                } else {
                    throw { code: 'TRAVELLER_CONFLICT'};
                }
            }

            return { ...traveller, version: (version + 1) % 10000 };
        } catch (error) {
            throw error;
        }
    },

    delete: async (id) => {
        const sql = `DELETE FROM traveller WHERE id = ?`;

        try {
            const [result] = await db.query(sql, [id]);

            if (result.affectedRows === 0) {
                throw { code: 'TRAVELLER_NOT_FOUND' };
            }

            return true;
        } catch (error) {
            throw error;
        }
    },

    findAll: async () => {
        const sql = `SELECT * FROM traveller ORDER BY dni`;

        try {
            const [rows] = await db.query(sql);
            return rows;
        } catch (error) {
            throw error;
        }
    },

    findByDepartment: async (department) => {
        const sql = `SELECT * FROM traveller WHERE department = ? ORDER BY dni`;

        try {
            const [rows] = await db.query(sql, [department]);
            return rows;
        } catch (error) {
            throw error;
        }
    },

    findById: async (id) => {
        const sql = `SELECT * FROM traveller WHERE id = ?`;

        try {
            const [rows] = await db.query(sql, [id]);

            if (rows.length === 0) {
                throw { code: 'TRAVELLER_NOT_FOUND' };
            }

            return rows[0];
        } catch (error) {
            throw error;
        }
    },
};

module.exports = Traveller;
