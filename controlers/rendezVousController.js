import RendezVous from '../models/RendezVous.js';
import Patient from '../models/patient.js';
import Medecin from '../models/Medecin.js';

// Get all rendez-vous
export const getAllRendezVous = async (req, res) => {
  try {
    const rendezVous = await RendezVous.find()
      .populate('patientId', 'nom prenom')
      .populate('medecinId', 'nom prenom specialite')
      .sort({ date: 1, heure: 1 });
    res.json(rendezVous);
  } catch (error) {
    console.error('Error fetching rendez-vous:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des rendez-vous', error: error.message });
  }
};

// Get rendez-vous by ID
export const getRendezVousById = async (req, res) => {
  try {
    const rendezVous = await RendezVous.findById(req.params.id)
      .populate('patientId', 'nom prenom')
      .populate('medecinId', 'nom prenom specialite');
    if (!rendezVous) {
      return res.status(404).json({ message: 'Rendez-vous non trouvé' });
    }
    res.json(rendezVous);
  } catch (error) {
    console.error('Error fetching rendez-vous:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du rendez-vous', error: error.message });
  }
};

// Create new rendez-vous
export const createRendezVous = async (req, res) => {
  try {
    // Check for existing appointment with same doctor, date, and time
    const existingRendezVous = await RendezVous.findOne({
      medecin: req.body.medecin,
      date: req.body.date,
      heure: req.body.heure
    });

    if (existingRendezVous) {
      return res.status(400).json({ 
        message: 'Conflit d\'horaire', 
        error: 'Ce médecin a déjà un rendez-vous prévu à cette date et heure' 
      });
    }

    // Create the rendez-vous
    const rendezVous = new RendezVous({
      heure: req.body.heure,
      patient: req.body.patient,
      medecin: req.body.medecin,
      type: req.body.type,
      date: req.body.date,
      notes: req.body.notes || '',
      statut: 'En attente'
    });

    const savedRendezVous = await rendezVous.save();
    
    res.status(201).json(savedRendezVous);
  } catch (error) {
    console.error('Error creating rendez-vous:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: Object.values(error.errors).map(err => err.message) 
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Conflit d\'horaire', 
        error: 'Ce médecin a déjà un rendez-vous prévu à cette date et heure' 
      });
    }
    res.status(500).json({ message: 'Erreur lors de la création du rendez-vous', error: error.message });
  }
};

// Update rendez-vous
export const updateRendezVous = async (req, res) => {
  try {
    const rendezVous = await RendezVous.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('patientId', 'nom prenom')
     .populate('medecinId', 'nom prenom specialite');
    
    if (!rendezVous) {
      return res.status(404).json({ message: 'Rendez-vous non trouvé' });
    }
    res.json(rendezVous);
  } catch (error) {
    console.error('Error updating rendez-vous:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: Object.values(error.errors).map(err => err.message) 
      });
    }
    res.status(500).json({ message: 'Erreur lors de la mise à jour du rendez-vous', error: error.message });
  }
};

// Delete rendez-vous
export const deleteRendezVous = async (req, res) => {
  try {
    const rendezVous = await RendezVous.findByIdAndDelete(req.params.id);
    if (!rendezVous) {
      return res.status(404).json({ message: 'Rendez-vous non trouvé' });
    }
    res.json({ message: 'Rendez-vous supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting rendez-vous:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du rendez-vous', error: error.message });
  }
};

// Get rendez-vous by date
export const getRendezVousByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);
    
    const rendezVous = await RendezVous.find({
      date: {
        $gte: startDate,
        $lt: endDate
      }
    }).populate('patientId', 'nom prenom')
      .populate('medecinId', 'nom prenom specialite')
      .sort({ heure: 1 });
    
    res.json(rendezVous);
  } catch (error) {
    console.error('Error fetching rendez-vous by date:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des rendez-vous', error: error.message });
  }
};

// Get rendez-vous by medecin
export const getRendezVousByMedecin = async (req, res) => {
  try {
    const { medecinId } = req.params;
    const rendezVous = await RendezVous.find({ medecinId })
      .populate('patientId', 'nom prenom')
      .populate('medecinId', 'nom prenom specialite')
      .sort({ date: 1, heure: 1 });
    
  res.json(rendezVous);
  } catch (error) {
    console.error('Error fetching rendez-vous by medecin:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des rendez-vous', error: error.message });
  }
};

// Get rendez-vous by patient
export const getRendezVousByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const rendezVous = await RendezVous.find({ patientId })
      .populate('patientId', 'nom prenom')
      .populate('medecinId', 'nom prenom specialite')
      .sort({ date: 1, heure: 1 });
    
    res.json(rendezVous);
  } catch (error) {
    console.error('Error fetching rendez-vous by patient:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des rendez-vous', error: error.message });
  }
};

// Get upcoming rendez-vous
export const getUpcomingRendezVous = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const rendezVous = await RendezVous.find({
      date: { $gte: today },
      statut: { $in: ['Confirmé', 'En attente'] }
    }).populate('patientId', 'nom prenom')
      .populate('medecinId', 'nom prenom specialite')
      .sort({ date: 1, heure: 1 })
      .limit(10);
    
    res.json(rendezVous);
  } catch (error) {
    console.error('Error fetching upcoming rendez-vous:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des rendez-vous', error: error.message });
  }
};

// Update rendez-vous status
export const updateRendezVousStatus = async (req, res) => {
  try {
    const { statut } = req.body;
    const rendezVous = await RendezVous.findByIdAndUpdate(
      req.params.id,
      { statut },
      { new: true, runValidators: true }
    ).populate('patientId', 'nom prenom')
     .populate('medecinId', 'nom prenom specialite');
    
    if (!rendezVous) {
      return res.status(404).json({ message: 'Rendez-vous non trouvé' });
    }
    res.json(rendezVous);
  } catch (error) {
    console.error('Error updating rendez-vous status:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du statut', error: error.message });
  }
};

// Get rendez-vous statistics
export const getRendezVousStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const stats = await RendezVous.aggregate([
      {
        $match: {
          date: {
            $gte: startOfMonth,
            $lte: endOfMonth
          }
        }
      },
      {
        $group: {
          _id: '$statut',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const totalRendezVous = await RendezVous.countDocuments();
    const todayRendezVous = await RendezVous.countDocuments({
      date: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lt: new Date(today.setHours(23, 59, 59, 999))
      }
    });
    
    res.json({
      totalRendezVous,
      todayRendezVous,
      thisMonth: stats
    });
  } catch (error) {
    console.error('Error fetching rendez-vous stats:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques', error: error.message });
  }
};