const UserMedication = require('../models/UserMedication');

// @desc    Get all medications for a user
// @route   GET /medications
// @access  Private
exports.getMedications = async (req, res) => {
  try {
    const medications = await UserMedication.findByUserId(req.user.id);
    res.json(medications);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

// @desc    Create a new medication
// @route   POST /medications
// @access  Private
exports.createMedication = async (req, res) => {
  const { name, dosage, unit } = req.body;

  try {
    const newMedication = await UserMedication.create(req.user.id, name, dosage, unit);
    res.status(201).json(newMedication);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

// @desc    Delete a medication
// @route   DELETE /medications/:id
// @access  Private
exports.deleteMedication = async (req, res) => {
  try {
    await UserMedication.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

// @desc    Update a medication
// @route   PUT /medications/:id
// @access  Private
exports.updateMedication = async (req, res) => {
  const { name, dosage, unit } = req.body;

  try {
    const updatedMedication = await UserMedication.update(req.params.id, name, dosage, unit);
    res.json(updatedMedication);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};