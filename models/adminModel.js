const db = require('../config/db');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

const Admin = {
  create: async (admin) => {
    const sql = `INSERT INTO admin (username, password) VALUES (?, ?)`;
    const { username, password } = admin;
    try {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      const [result] = await db.query(sql, [username, hashedPassword]);

      const insertId = result.id;
      if (result.affectedRows === 0) {
        throw new Error('No se pudo insertar el administrador, ninguna fila afectada.');
      }

      return {
        ...admin,
        id: insertId,
      };
    } catch (error) {
      throw error;
    }
  },

  modify: async (admin) => {
    const sql = `UPDATE admin SET username = ?, password = ? WHERE id = ?`;
    const { id, username, password } = admin;
    try {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      const [result] = await db.query(sql, [username, hashedPassword, id]);

      if (result.affectedRows === 0) {
        throw new Error('No se pudo actualizar el administrador, ninguna fila afectada.');
      }
      

      return { ...admin };
    } catch (error) {
      throw error;
    }
  },

  delete: async (id) => {
    const sql = `DELETE FROM admin WHERE id = ?`;
    try {
      const [result] = await db.query(sql, [id]);
      const success = result.affectedRows > 0;
      return success;
    } catch (error) {
      throw new Error(`No se pudo eliminar el administrador con id ${id}: ${error.message}`);
    }
  },

  findAll: async () => {
    const sql = `SELECT * FROM admin`;
    try {
      const [rows] = await db.query(sql);
      return rows.map(row => ({
        id: row.id,
        username: row.username,
      }));
    } catch (error) {
      throw new Error('No se pudo recoger la lista de administradores.');
    }
  },

  findById: async (id) => {
    const sql = `SELECT * FROM admin WHERE id = ?`;
    try {
      const [rows] = await db.query(sql, [id]);
      if (rows.length === 0) return null;
      const row = rows[0];
      return {
        id: row.id,
        username: row.username,
      };
    } catch (error) {
      throw new Error(`No se pudo encontrar el administrador con ID: ${id}`);
    }
  },

  findByCredentials: async (username, plainPassword) => {
    const sql = `SELECT * FROM admin WHERE username = ?`;
    try {
      const [rows] = await db.query(sql, [username]);
      if (rows.length === 0) return null;

      const admin = rows[0];
      const isMatch = await bcrypt.compare(plainPassword, admin.password);
      if (!isMatch) return null;

      return {
        id: admin.id,
        username: admin.username,
      };
    } catch (error) {
      console.error('Error en findByCredentials:', error);
      throw new Error('Error al verificar credenciales del administrador.');
    }
  }
};

module.exports = Admin;
