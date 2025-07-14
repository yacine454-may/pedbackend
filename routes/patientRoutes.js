import express from 'express';
import {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  searchPatients,
  getPatientsByDiabetesType,
  getPatientsStats,
  uploadPatientDocuments
} from '../controlers/patientController.js';

const router = express.Router();

// Get all patients
router.get('/', getAllPatients);

// Get patient by ID
router.get('/:id', getPatientById);

// Create new patient
router.post('/', createPatient);

// Update patient
router.put('/:id', updatePatient);

// Delete patient
router.delete('/:id', deletePatient);

// Search patients
router.get('/search', searchPatients);

// Get patients by diabetes type
router.get('/diabetes/:type', getPatientsByDiabetesType);

// Get patients statistics
router.get('/stats', getPatientsStats);

// Upload documents to a patient
router.post('/:id/upload', uploadPatientDocuments);

export default router;