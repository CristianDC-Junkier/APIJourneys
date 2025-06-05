const Traveller = require('../models/travellerModel');

function getSafeError(error) {
  return {
    message: error.message || 'Error desconocido',
    code: error.code || null,
  };
}

exports.create = async (req, res) => {
  try {
    const travellerData = req.body;
    const newTraveller = await Traveller.create(travellerData);
    res.json(newTraveller);
  } catch (error) {
    res.status(500).json({ error: getSafeError(error) });
  }
};

exports.modify = async (req, res) => {
  try {
    const travellerData = { ...req.body, id: req.params.id };
    const updatedTraveller = await Traveller.modify(travellerData);
    res.json(updatedTraveller);
  } catch (error) {
    res.status(500).json({ error: getSafeError(error) });
  }
};

exports.delete = async (req, res) => {
  try {
    const deleted = await Traveller.delete(req.params.id);
    if (!deleted) return res.status(404).json({ error: { message: 'Viajero no encontrado', code: null } });
    res.json({ message: 'Eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: getSafeError(error) });
  }
};

exports.findAll = async (req, res) => {
  try {
    const travellers = await Traveller.findAll();
    res.json(travellers);
  } catch (error) {
    res.status(500).json({ error: getSafeError(error) });
  }
};

exports.findById = async (req, res) => {
  try {
    const traveller = await Traveller.findById(req.params.id);
    if (!traveller) return res.status(404).json({ error: { message: 'Viajero no encontrado', code: null } });
    res.json(traveller);
  } catch (error) {
    res.status(500).json({ error: getSafeError(error) });
  }
};


