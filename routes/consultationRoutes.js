import express from 'express';
import {
  getAllConsultations,
  getConsultationById,
  createConsultation,
  updateConsultation,
  deleteConsultation,
  getConsultationsByPatient,
  getConsultationsByMedecin,
  getConsultationsByDateRange,
  getConsultationsStats,
  updateConsultationStatus
} from '../controlers/consultationController.js';

const router = express.Router();

// Get all consultations
router.get('/', getAllConsultations);

// Get consultation by ID
router.get('/:id', getConsultationById);

// Create new consultation
router.post('/', createConsultation);

// Update consultation
router.put('/:id', updateConsultation);

// Delete consultation
router.delete('/:id', deleteConsultation);

// Get consultations by patient
router.get('/patient/:patientId', getConsultationsByPatient);

// Get consultations by medecin
router.get('/medecin/:medecinId', getConsultationsByMedecin);

// Get consultations by date range
router.get('/date-range', getConsultationsByDateRange);

// Get consultations statistics
router.get('/stats', getConsultationsStats);

// Update consultation status
router.patch('/:id/status', updateConsultationStatus);

export default router; 