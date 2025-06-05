const db = require('../config/db');

const Traveller = {
  create: async (traveller) => {
    const sql = `INSERT INTO traveller (dni, name, singup, office, trip) VALUES (?, ?, ?, ?, ?)`;
    const { dni, name, signup, office, trip } = traveller;

    try {
      const [result] = await db.query(sql, [dni, name, signup, office, trip]);
      const insertId = result.insertId || result.lastID || null;
      if (!insertId) {
        throw new Error('No se pudo insertar el viajero, ninguna fila afectada.');
      }

      return {
        ...traveller,
        id: insertId,
      };
    } catch (error) {
      console.error('Error al crear traveller:', error);
      throw error;
    }
  },

  modify: async (traveller) => {
    const sql = `UPDATE traveller SET dni = ?, name = ?, singup = ?, office = ?, trip = ? WHERE id = ?`;
    const { id, dni, name, signup, office, trip } = traveller;

    try {
      const [result] = await db.query(sql, [dni, name, signup, office, trip, id]);
      if (result.affectedRows === 0 && result.changes === 0) {
        throw new Error('No se pudo actualizar el viajero, ninguna fila afectada.');
      }

      return { ...traveller };
    } catch (error) {
      console.error('Error al modificar traveller:', error);
      throw error;
    }
  },

  delete: async (id) => {
    const sql = `DELETE FROM traveller WHERE id = ?`;

    try {
      const [result] = await db.query(sql, [id]);
      const success = result.affectedRows > 0 || result.changes > 0;
      return success;
    } catch (error) {
      console.error(`Error al eliminar traveller con id ${id}:`, error);
      throw error;
    }
  },

  findAll: async () => {
    const sql = `SELECT * FROM traveller`;

    try {
      const [rows] = await db.query(sql);
      return rows;
    } catch (error) {
      console.error('Error al obtener todos los travellers:', error);
      throw error;
    }
  },

  findById: async (id) => {
    const sql = `SELECT * FROM traveller WHERE id = ?`;

    try {
      const [rows] = await db.query(sql, [id]);
      return rows[0] || null;
    } catch (error) {
      console.error(`Error al obtener traveller por id ${id}:`, error);
      throw error;
    }
  }
};

module.exports = Traveller;
