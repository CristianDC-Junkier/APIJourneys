const db = require('../config/db');
const { encrypt, decrypt } = require('../util/cypherUtil');

const Traveller = {
    create: async (traveller) => {
        const sql = `INSERT INTO traveller (dni, name, signup, phone, department, trip) VALUES (?, ?, ?, ?, ?, ?)`;
        var { dni, name, signup, phone, department, trip } = traveller;

        try {

            const [rowDnis] = await db.query('SELECT dni FROM traveller');
            for (let i = 0; i < rowDnis.length; i++) {
                if (dni === decrypt(rowDnis[i].dni)) {
                    throw {
                        code: 'ER_DUP_ENTRY'
                    }
                }
            }

            dni = encrypt(dni);
            name = encrypt(name);
            signup = encrypt(signup);
            phone = encrypt(phone);

            const [result] = await db.query(sql, [dni, name, signup, phone, department, trip]);

            return {
                ...traveller,
                id: result.insertId || result.lastID || result.id,
            };
        } catch (error) {
            if (
                (error.sqlState === '45000') ||
                (error.code === 'SQLITE_ABORT')
            ) {
                throw { code: 'TRAVEL_CONFLICT' };
            }

            if (error.code === 'ER_DUP_ENTRY') {
                const [existingRows] = await db.query(
                    `SELECT t.descriptor AS tripDescriptor
                   FROM traveller v
                   JOIN travel t ON v.trip = t.id
                   WHERE v.dni = ?`,
                    [dni]
                );
                const existingTrip = existingRows.length ? existingRows[0].tripDescriptor : null;

                const customError = new Error(`No se pudo insertar el viajero con dni ${dni}, ninguna fila afectada`);
                customError.code = error.code;
                customError.trip = existingTrip;
                throw customError;
            }

            throw error;
        }
    },

    modify: async (traveller) => {
        const sql = `UPDATE traveller SET dni = ?, name = ?, signup = ?, phone = ?, department = ?, trip = ?, version = (version + 1) % 10000 WHERE id = ? AND version = ?`;

        var { id, dni, name, signup, department, phone, trip, version } = traveller;

        try {
            const [rowDnis] = await db.query(
                'SELECT dni FROM traveller WHERE id != ?',
                [id]
            );

            for (let i = 0; i < rowDnis.length; i++) {
                if (dni === decrypt(rowDnis[i].dni)) {
                    throw { code: 'ER_DUP_ENTRY' };
                }
            }

            dni = encrypt(dni);
            name = encrypt(name);
            signup = encrypt(signup);
            phone = encrypt(phone);

            const [result] = await db.query(sql, [dni, name, signup, phone, department, trip, id, version]);

            if (result.affectedRows === 0) {
                const [rows] = await db.query(`SELECT version FROM traveller WHERE id = ?`, [id]);

                if (rows.length === 0) {
                    throw { code: 'TRAVELLER_NOT_FOUND' };
                } else {
                    throw { code: 'TRAVELLER_CONFLICT' };
                }
            }

            return { ...traveller, version: (version + 1) % 10000 };
        } catch (error) {
            if (
                (error.sqlState === '45000') ||
                (error.code === 'SQLITE_ABORT')
            ) {
                throw { code: 'TRAVEL_CONFLICT' };
            }
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

            const travellers = rows.map(t => ({
                ...t,
                dni: decrypt(t.dni),
                name: decrypt(t.name),
                signup: decrypt(t.signup),
                phone: decrypt(t.phone)
            }));

            return travellers;
        } catch (error) {
            throw error;
        }
    },

    findByDepartment: async (department) => {
        const sql = `SELECT * FROM traveller WHERE department = ? ORDER BY dni`;

        try {
            const [rows] = await db.query(sql, [department]);

            const travellers = rows.map(t => ({
                ...t,
                dni: decrypt(t.dni),
                name: decrypt(t.name),
                signup: decrypt(t.signup),
                phone: decrypt(t.phone)
            }));

            return travellers;
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

            const traveller = rows[0];
            traveller.dni = decrypt(traveller.dni);
            traveller.name = decrypt(traveller.name);
            traveller.signup = decrypt(traveller.signup);
            traveller.phone = decrypt(traveller.phone);

            return traveller;
        } catch (error) {
            throw error;
        }
    },
};

module.exports = Traveller;
