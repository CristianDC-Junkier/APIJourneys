const Admin = require('../models/adminModel');

function getSafeError(error) {
  return {
    message: error.message || 'Unknown error',
    code: error.code || null,
  };
}

exports.create = async (req, res) => {
  try {
    const adminData = req.body;
    const newAdmin = await Admin.create(adminData);
    res.json(newAdmin);
  } catch (error) {
    res.status(500).json({ error: getSafeError(error) });
  }
};

exports.modify = async (req, res) => {
  try {
    const adminData = { ...req.body, id: req.params.id };
    const updatedAdmin = await Admin.modify(adminData);
    res.json(updatedAdmin);
  } catch (error) {
    res.status(500).json({ error: getSafeError(error) });
  }
};

exports.delete = async (req, res) => {
  try {
    const deleted = await Admin.delete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Admin not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: getSafeError(error) });
  }
};

exports.findAll = async (req, res) => {
  try {
    const admins = await Admin.findAll();
    res.json(admins);
  } catch (error) {
    res.status(500).json({ error: getSafeError(error) });
  }
};

exports.findById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ error: 'Admin not found' });
    res.json(admin);
  } catch (error) {
    res.status(500).json({ error: getSafeError(error) });
  }
};
