const Traveller = require('../models/travellerModel');

function getSafeError(error) {
    const errorMap = {
        ER_DUP_ENTRY: {
            message: 'El Viajero ya existe.',
            status: 400,
        },
        TRAVELLER_NOT_FOUND: {
            message: 'Viajero/s no encontrado.',
            status: 404,
        },
        TRAVELLER_CONFLICT: {
            message: 'El viajero ya fue modificado.',
            status: 409,
        },
        EMPTY_TABLE: {
            message: 'Lista de viajeros vacia.',
            status: 204,
        },
    };

    const code = error.code || null;
    const mapped = code && errorMap[code];

    return {
        message: mapped?.message || error.message || 'Error desconocido',
        code,
        status: mapped?.status || 500,
        trip: error.trip || null,
    };
}

exports.create = async (req, res) => {
    try {
        const travellerData = req.body;
        const newTraveller = await Traveller.create(travellerData);
        res.json(newTraveller);
    } catch (error) {
        const safeError = getSafeError(error);
        res.status(safeError.status).json({ error: safeError.message, trip: safeError.trip });
    }
};

exports.modify = async (req, res) => {
    try {
        const travellerData = { ...req.body, id: req.params.id };
        const updatedTraveller = await Traveller.modify(travellerData);

        if (!updatedTraveller) {
            throw { code: 'TRAVELLER_NOT_FOUND' };
        }

        res.json(updatedTraveller);
    } catch (error) {
        const safeError = getSafeError(error);
        res.status(safeError.status).json({ error: safeError.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const deleted = await Traveller.delete(req.params.id);

        if (!deleted) {
            throw { code: 'TRAVELLER_NOT_FOUND' };
        }

        res.json({ message: 'Eliminado correctamente' });
    } catch (error) {
        const safeError = getSafeError(error);
        res.status(safeError.status).json({ error: safeError.message });
    }
};

exports.findAll = async (req, res) => {
    try {
        const travellers = await Traveller.findAll();
        if (!travellers || travellers.length === 0) {
            throw { code: 'EMPTY_TABLE' };
        }
        res.json(travellers);
    } catch (error) {
        const safeError = getSafeError(error);
        res.status(safeError.status).json({ error: safeError.message });
    }
};

exports.findByDepartment = async (req, res) => {
    try {
        const travellers = await Traveller.findByDepartment(req.params.id);
        if (!travellers || travellers.length === 0) {
            throw { code: 'EMPTY_TABLE' };
        }
        res.json(travellers);
    } catch (error) {
        const safeError = getSafeError(error);
        res.status(safeError.status).json({ error: safeError.message });
    }
};


exports.findById = async (req, res) => {
    try {
        const traveller = await Traveller.findById(req.params.id);

        if (!traveller) {
            throw { code: 'TRAVELLER_NOT_FOUND' };
        }

        res.json(traveller);
    } catch (error) {
        const safeError = getSafeError(error);
        res.status(safeError.status).json({ error: safeError.message });
    }
};
