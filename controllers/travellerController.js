const Traveller = require('../models/travellerModel');

function getSafeError(error) {
    const errorMap = {
        ER_DUP_ENTRY: {
            message: 'El Viajero ya existe.',
            status: 400,
        },
        TRAVELLER_NOT_FOUND: {
            message: 'Viajero no encontrado.',
            status: 404,
        },
    };

    const code = error.code || null;
    const mapped = code && errorMap[code];

    return {
        error: mapped?.message || error.message || 'Error desconocido',
        code,
        status: mapped?.status || 500,
    };
}

exports.create = async (req, res) => {
    try {
        const travellerData = req.body;
        const newTraveller = await Traveller.create(travellerData);
        res.json(newTraveller);
    } catch (error) {
        const safeError = getSafeError(error);
        res.status(safeError.status).json({ error: safeError.message });
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
