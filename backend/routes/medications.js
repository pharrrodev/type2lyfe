const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getMedications, createMedication, deleteMedication, updateMedication } = require('../controllers/medicationController');

// @route   GET /medications
// @desc    Get all medications for a user
// @access  Private
router.get('/', auth, getMedications);

// @route   POST /medications
// @desc    Create a new medication
// @access  Private
router.post('/', auth, createMedication);

// @route   PUT /medications/:id
// @desc    Update a medication
// @access  Private
router.put('/:id', auth, updateMedication);

// @route   DELETE /medications/:id
// @desc    Delete a medication
// @access  Private
router.delete('/:id', auth, deleteMedication);

module.exports = router;