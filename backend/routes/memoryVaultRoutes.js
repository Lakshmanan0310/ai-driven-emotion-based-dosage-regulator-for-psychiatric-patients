/**
 * Memory Vault Routes
 * API routes for the Memory Vault feature
 */

const express = require('express');
const router = express.Router();
const memoryVaultController = require('../controllers/memoryVaultController');

// Get all memories for a patient
router.get('/:patientId', memoryVaultController.getMemories);

// Get a specific memory by ID
router.get('/entry/:id', memoryVaultController.getMemoryById);

// Create a new memory
router.post('/', memoryVaultController.createMemory);

// Update a memory
router.put('/:id', memoryVaultController.updateMemory);

// Delete a memory
router.delete('/:id', memoryVaultController.deleteMemory);

// Classify emotions in text
router.post('/classify', memoryVaultController.classifyEmotion);

// Get a recommended memory based on current emotion
router.get('/:patientId/recommend', memoryVaultController.getRecommendedMemory);

// Record memory access
router.post('/:id/access', memoryVaultController.recordAccess);

// Rate memory helpfulness
router.post('/:id/rate', memoryVaultController.rateHelpfulness);

module.exports = router;
