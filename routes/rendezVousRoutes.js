import express from 'express';
import {
  getAllRendezVous,
  getRendezVousById,
  createRendezVous,
  updateRendezVous,
  deleteRendezVous,
  getRendezVousByDate,
  getRendezVousByMedecin,
  getRendezVousByPatient,
  getUpcomingRendezVous,
  updateRendezVousStatus,
  getRendezVousStats
} from '../controlers/rendezVousController.js';

const router = express.Router();

// Get all rendez-vous
router.get('/', getAllRendezVous);

// Get rendez-vous by ID
router.get('/:id', getRendezVousById);

// Create new rendez-vous
router.post('/', createRendezVous);

// Update rendez-vous
router.put('/:id', updateRendezVous);

// Delete rendez-vous
router.delete('/:id', deleteRendezVous);

// Get rendez-vous by date
router.get('/date/:date', getRendezVousByDate);

// Get rendez-vous by medecin
router.get('/medecin/:medecinId', getRendezVousByMedecin);

// Get rendez-vous by patient
router.get('/patient/:patientId', getRendezVousByPatient);

// Get upcoming rendez-vous
router.get('/upcoming', getUpcomingRendezVous);

// Update rendez-vous status
router.patch('/:id/status', updateRendezVousStatus);

// Get rendez-vous statistics
router.get('/stats', getRendezVousStats);

export default router;