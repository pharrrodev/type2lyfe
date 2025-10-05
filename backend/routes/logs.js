const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getLogs, createLog, getGlucoseLogs, createGlucoseLog, getMealLogs, createMealLog, getMedicationLogs, createMedicationLog, getWeightLogs, createWeightLog, getBloodPressureLogs, createBloodPressureLog, updateLog, deleteLog } = require('../controllers/logController');

// @route   GET /logs
// @desc    Get all logs for a user
// @access  Private
router.get('/', auth, getLogs);

// @route   POST /logs
// @desc    Create a new log
// @access  Private
router.post('/', auth, createLog);

// @route   GET /logs/glucose
// @desc    Get all glucose logs for a user
// @access  Private
router.get('/glucose', auth, getGlucoseLogs);

// @route   POST /logs/glucose
// @desc    Create a new glucose log
// @access  Private
router.post('/glucose', auth, createGlucoseLog);

// @route   GET /logs/meals
// @desc    Get all meal logs for a user
// @access  Private
router.get('/meals', auth, getMealLogs);

// @route   POST /logs/meals
// @desc    Create a new meal log
// @access  Private
router.post('/meals', auth, createMealLog);

// @route   GET /logs/medications
// @desc    Get all medication logs for a user
// @access  Private
router.get('/medications', auth, getMedicationLogs);

// @route   POST /logs/medications
// @desc    Create a new medication log
// @access  Private
router.post('/medications', auth, createMedicationLog);

// @route   GET /logs/weight
// @desc    Get all weight logs for a user
// @access  Private
router.get('/weight', auth, getWeightLogs);

// @route   POST /logs/weight
// @desc    Create a new weight log
// @access  Private
router.post('/weight', auth, createWeightLog);

// @route   GET /logs/blood-pressure
// @desc    Get all blood pressure logs for a user
// @access  Private
router.get('/blood-pressure', auth, getBloodPressureLogs);

// @route   POST /logs/blood-pressure
// @desc    Create a new blood pressure log
// @access  Private
router.post('/blood-pressure', auth, createBloodPressureLog);

// @route   PUT /logs/:type/:id
// @desc    Update a log
// @access  Private
router.put('/:type/:id', auth, updateLog);

// @route   DELETE /logs/:type/:id
// @desc    Delete a log
// @access  Private
router.delete('/:type/:id', auth, deleteLog);

module.exports = router;