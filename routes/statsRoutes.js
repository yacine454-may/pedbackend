import express from 'express';
import {
  getDashboardStats,
  getPatientStats,
  getMedecinStats,
  getRendezVousStats
} from '../controlers/statsController.js';

const router = express.Router();

// Get comprehensive dashboard statistics
router.get('/dashboard', getDashboardStats);

// Get patient statistics
router.get('/patients', getPatientStats);

// Get medecin statistics
router.get('/medecins', getMedecinStats);

// Get rendez-vous statistics
router.get('/rendez-vous', getRendezVousStats);

export default router; 