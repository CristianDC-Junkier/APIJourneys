const db = require('../config/db');

const Department = {
    findAll: async () => {
        const sql = `SELECT * FROM department ORDER BY id`;
        try {
            const [rows] = await db.query(sql);
            return rows;
        } catch (error) {
            throw error;
        }
    },

    findById: async (id) => {
        const sql = `SELECT * FROM departament WHERE id = ?`;

        try {
            const [rows] = await db.query(sql, [id]);

            if (rows.length === 0) {
                throw { code: 'DEPARTMENT_NOT_FOUND' };
            }

            return rows[0];
        } catch (error) {
            throw error;
        }
    },
};

module.exports = Department;
