const Travel = require('../models/travelModel');

function getSafeError(error) {
    const errorMap = {
        ER_DUP_ENTRY: {
            message: 'El viaje ya existe.',
            status: 400,
        },
        TRAVEL_NOT_FOUND: {
            message: 'Viaje no encontrado.',
            status: 404,
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
        const travelData = req.body;
        const newTravel = await Travel.create(travelData);
        res.json(newTravel);
    } catch (error) {
        const safeError = getSafeError(error);
        res.status(safeError.status).json({ error: safeError.message });
    }
};

exports.modify = async (req, res) => {
    try {
        const travelData = { ...req.body, id: req.params.id };
        const updatedTravel = await Travel.modify(travelData);

        if (!updatedTravel) {
            throw { code: 'TRAVEL_NOT_FOUND' };
        }

        res.json(updatedTravel);
    } catch (error) {
        const safeError = getSafeError(error);
        res.status(safeError.status).json({ error: safeError.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const deleted = await Travel.delete(req.params.id);

        if (!deleted) {
            throw { code: 'TRAVEL_NOT_FOUND' };
        }

        res.json({ message: 'Eliminado correctamente' });
    } catch (error) {
        const safeError = getSafeError(error);
        res.status(safeError.status).json({ error: safeError.message });
    }
};

exports.findAll = async (req, res) => {
    try {
        const travels = await Travel.findAll();
        res.json(travels);
    } catch (error) {
        const safeError = getSafeError(error);
        res.status(safeError.status).json({ error: safeError.message });
    }
};

exports.findByDepartment = async (req, res) => {
    try {
        const travels = await Travel.findByDepartment(req.params.department);

        if (!travels || travels.length === 0) {
            throw { code: 'TRAVEL_NOT_FOUND' };
        }

        res.json(travels);
    } catch (error) {
        const safeError = getSafeError(error);
        res.status(safeError.status).json({ error: safeError.message });
    }
};

exports.findById = async (req, res) => {
    try {
        const travel = await Travel.findById(req.params.id);

        if (!travel) {
            throw { code: 'TRAVEL_NOT_FOUND' };
        }

        res.json(travel);
    } catch (error) {
        const safeError = getSafeError(error);
        res.status(safeError.status).json({ error: safeError.message });
    }
};
