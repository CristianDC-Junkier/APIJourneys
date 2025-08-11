const Department = require('../models/departmentModel');

function getSafeError(error) {
    const errorMap = {
        DEPARTMENT_NOT_FOUND: {
            message: 'Departamento no encontrado.',
            status: 404,
        },
        EMPTY_TABLE: {
            message: 'Lista de departamentos vacia.',
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

exports.findAll = async (req, res) => {
    try {
        const departments = await Department.findAll();
        if (!departments || departments.length === 0) {
            throw { code: 'EMPTY_TABLE' };
        }
        res.json(departments);
    } catch (error) {
        const safeError = getSafeError(error);
        res.status(safeError.status).json({ error: safeError.message });
    }
};

exports.findById = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);

        if (!department) {
            throw { code: 'DEPARTMENT_NOT_FOUND' };
        }

        res.json(department);
    } catch (error) {
        const safeError = getSafeError(error);
        res.status(safeError.status).json({ error: safeError.message });
    }
};
