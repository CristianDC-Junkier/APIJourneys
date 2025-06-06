const db = require('../config/db');

const Traveller = {
    create: async (traveller) => {
        const sql = `INSERT INTO traveller (dni, name, signup, office, trip) VALUES (?, ?, ?, ?, ?)`;
        const { dni, name, signup, office, trip } = traveller;

        try {
            const [result] = await db.query(sql, [dni, name, signup, office, trip]);

            if (result.affectedRows === 0) {
                throw new Error('No se pudo insertar el viajero, ninguna fila afectada.');
            }

            return {
                ...traveller,
                id: result.insertId,
            };
        } catch (error) {
            throw error;
        }
    },

    modify: async (traveller) => {
        const sql = `UPDATE traveller SET dni = ?, name = ?, signup = ?, office = ?, trip = ? WHERE id = ?`;
        const { id, dni, name, signup, office, trip } = traveller;

        try {
            const [result] = await db.query(sql, [dni, name, signup, office, trip, id]);

            if (result.affectedRows === 0) {
                // No filas afectadas indica que el traveller no existe
                throw { code: 'TRAVELLER_NOT_FOUND' };
            }

            return { ...traveller };
        } catch (error) {
            throw error;
        }
    },

    delete: async (id) => {
        const sql = `DELETE FROM traveller WHERE id = ?`;

        try {
            const [result] = await db.query(sql, [id]);

            if (result.affectedRows === 0) {
                // No filas afectadas => traveller no encontrado
                throw { code: 'TRAVELLER_NOT_FOUND' };
            }

            return true;
        } catch (error) {
            throw error;
        }
    },

    findAll: async () => {
        const sql = `SELECT * FROM traveller`;

        try {
            const [rows] = await db.query(sql);
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
