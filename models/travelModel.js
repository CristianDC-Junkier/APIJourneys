const db = require('../config/db');

const Travel = {
    create: async (travel) => {
        const sql = `INSERT INTO travel (descriptor, seats_occupied, seats_total, department, bus) VALUES (?, ?, ?, ?, ?)`;
        const { descriptor, seats_occupied, seats_total, department, bus } = travel;

        try {
            const [result] = await db.query(sql, [descriptor, seats_occupied, seats_total, department, bus]);

            if (result.affectedRows === 0) {
                throw new Error('No se pudo insertar el viaje, ninguna fila afectada.');
            }

            return {
                ...travel,
                id: result.insertId || result.lastID || result.id,
            };
        } catch (error) {
            if (
                (error.sqlState === '45000') || 
                (error.code === 'SQLITE_ABORT')     
            ) {
                throw { code: 'SEATS_CONFLICT' };
            }
            throw error;
        }
    },

    modify: async (travel) => {
        const sql = `UPDATE travel SET descriptor = ?, seats_occupied = ?, seats_total = ?, department = ?, bus = ? WHERE id = ?`;
        const { id, descriptor, seats_occupied, seats_total, department, bus } = travel;

        try {
            const [result] = await db.query(sql, [descriptor, seats_occupied, seats_total, department, bus, id]);

            if (result.affectedRows === 0) {
                throw { code: 'TRAVEL_NOT_FOUND' };
            }

            return { ...travel };
        } catch (error) {
            if (
                (error.sqlState === '45000') ||
                (error.code === 'SQLITE_ABORT')
            ) {
                throw { code: 'SEATS_CONFLICT' };
            }
            throw error;
        }
    },

    delete: async (id) => {
        const sql = `DELETE FROM travel WHERE id = ?`;

        try {
            const [result] = await db.query(sql, [id]);

            if (result.affectedRows === 0) {
                throw { code: 'TRAVEL_NOT_FOUND' };
            }

            return true;
        } catch (error) {
            throw error;
        }
    },

    findAll: async () => {
        const sql = `SELECT * FROM travel ORDER BY id`;
        try {
            const [rows] = await db.query(sql);
            return rows;
        } catch (error) {
            throw error;
        }
    },

    findById: async (id) => {
        const sql = `SELECT * FROM travel WHERE id = ?`;

        try {
            const [rows] = await db.query(sql, [id]);

            if (rows.length === 0) {
                throw { code: 'TRAVEL_NOT_FOUND' };
            }

            return rows[0];
        } catch (error) {
            throw error;
        }
    },
    findByDepartment: async (department) => {
        const sql = `SELECT * FROM travel WHERE department = ? ORDER BY descriptor`;

        try {
            const [rows] = await db.query(sql, [department]);
            return rows;
        } catch (error) {
            throw error;
        }
    },
};

module.exports = Travel;

