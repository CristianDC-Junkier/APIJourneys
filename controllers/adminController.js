const Admin = require('../models/adminModel');

function getSafeError(error) {
    const errorMap = {
        ER_DUP_ENTRY: {
            message: 'El Admin ya existe.',
            status: 400,
        },
        ADMIN_NOT_FOUND: {
            message: 'Admin no encontrado.',
            status: 404,
        },
        EMPTY_TABLE: {
            message: 'Lista de admins vacia.',
            status: 204,
        },
    };

    const code = error.code || null;
    const mapped = code && errorMap[code];

    return {
        message: mapped?.message || error.message || 'Error desconocido',
        code,
        status: mapped?.status || 500,
    };
}

exports.create = async (req, res) => {
    try {
        const adminData = req.body;
        const newAdmin = await Admin.create(adminData);
        res.json(newAdmin);
    } catch (error) {
        const safeError = getSafeError(error);
        res.status(safeError.status).json({ error: safeError.message });
    }
};

exports.modify = async (req, res) => {
    try {
        const adminData = { ...req.body, id: req.params.id };
        const updatedAdmin = await Admin.modify(adminData);

        if (!updatedAdmin) {
            throw { code: 'ADMIN_NOT_FOUND' };
        }

        res.json(updatedAdmin);
    } catch (error) {
        const safeError = getSafeError(error);
        res.status(safeError.status).json({ error: safeError.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const deleted = await Admin.delete(req.params.id);

        if (!deleted) {
            throw { code: 'ADMIN_NOT_FOUND' };
        }

        res.json({ message: 'Eliminado correctamente' });
    } catch (error) {
        const safeError = getSafeError(error);
        res.status(safeError.status).json({ error: safeError.message });
    }
};

exports.findAll = async (req, res) => {
    try {
        const admins = await Admin.findAll();
        if (!admins || admins.length === 0) {
            throw { code: 'EMPTY_TABLE' };
        }
        res.json(admins);
    } catch (error) {
        const safeError = getSafeError(error);
        res.status(safeError.status).json({ error: safeError.message });
    }
};

exports.findById = async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id);

        if (!admin) {
            throw { code: 'ADMIN_NOT_FOUND' };
        }

        res.json(admin);
    } catch (error) {
        const safeError = getSafeError(error);
        res.status(safeError.status).json({ error: safeError.message });
    }
};
