import express from 'express';
import {
  getAllMedecins,
  getMedecinById,
  createMedecin,
  updateMedecin,
  deleteMedecin,
  searchMedecins,
  getMedecinsBySpeciality,
  getMedecinsByStatus,
  getMedecinsStats
} from '../controlers/medecinController.js';

const router = express.Router();

// Get all medecins
router.get('/', getAllMedecins);

// Get medecin by ID
router.get('/:id', getMedecinById);

// Create new medecin
router.post('/', createMedecin);

// Update medecin
router.put('/:id', updateMedecin);

// Delete medecin
router.delete('/:id', deleteMedecin);

// Search medecins
router.get('/search', searchMedecins);

// Get medecins by speciality
router.get('/speciality/:specialite', getMedecinsBySpeciality);

// Get medecins by status
router.get('/status/:status', getMedecinsByStatus);

// Get medecins statistics
router.get('/stats', getMedecinsStats);

export default router;