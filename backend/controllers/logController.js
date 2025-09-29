const Log = require('../models/Log');

// A helper function to create a log of a specific type
const createLogOfType = (type) => async (req, res) => {
  const { timestamp, ...data } = req.body;
  try {
    const newLog = await Log.create(req.user.id, timestamp, type, data);
    res.status(201).json(newLog);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

// A helper function to get logs of a specific type
const getLogsOfType = (type) => async (req, res) => {
  try {
    const logs = await Log.findByUserIdAndType(req.user.id, type);
    res.json(logs);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get all logs for a user
// @route   GET /logs
// @access  Private
exports.getLogs = async (req, res) => {
  try {
    const logs = await Log.findByUserId(req.user.id);
    res.json(logs);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

// @desc    Create a new log
// @route   POST /logs
// @access  Private
exports.createLog = async (req, res) => {
  const { timestamp, type, data } = req.body;

  try {
    const newLog = await Log.create(req.user.id, timestamp, type, data);
    res.status(201).json(newLog);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

// Glucose Logs
exports.getGlucoseLogs = getLogsOfType('glucose');
exports.createGlucoseLog = createLogOfType('glucose');

// Meal Logs
exports.getMealLogs = getLogsOfType('meal');
exports.createMealLog = createLogOfType('meal');

// Medication Logs
exports.getMedicationLogs = getLogsOfType('medication');
exports.createMedicationLog = createLogOfType('medication');

// Weight Logs
exports.getWeightLogs = getLogsOfType('weight');
exports.createWeightLog = createLogOfType('weight');

// Blood Pressure Logs
exports.getBloodPressureLogs = getLogsOfType('blood_pressure');
exports.createBloodPressureLog = createLogOfType('blood_pressure');