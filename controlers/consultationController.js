import Consultation from '../models/Consultation.js';
import Patient from '../models/patient.js';
import Medecin from '../models/Medecin.js';

// Get all consultations
export const getAllConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find()
      .populate('patientId', 'nom prenom age sexe')
      .populate('medecinId', 'nom prenom specialite')
      .sort({ date: -1 });
    res.json(consultations);
  } catch (error) {
    console.error('Error fetching consultations:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des consultations', error: error.message });
  }
};

// Get consultation by ID
export const getConsultationById = async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate('patientId', 'nom prenom age sexe diabete')
      .populate('medecinId', 'nom prenom specialite');
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation non trouvée' });
    }
    res.json(consultation);
  } catch (error) {
    console.error('Error fetching consultation:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de la consultation', error: error.message });
  }
};

// Create new consultation
export const createConsultation = async (req, res) => {
  try {
    const consultation = new Consultation(req.body);
    const savedConsultation = await consultation.save();
    
    // Populate the saved consultation
    const populatedConsultation = await Consultation.findById(savedConsultation._id)
      .populate('patientId', 'nom prenom age sexe')
      .populate('medecinId', 'nom prenom specialite');
    
    res.status(201).json(populatedConsultation);
  } catch (error) {
    console.error('Error creating consultation:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: Object.values(error.errors).map(err => err.message) 
      });
    }
    res.status(500).json({ message: 'Erreur lors de la création de la consultation', error: error.message });
  }
};

// Update consultation
export const updateConsultation = async (req, res) => {
  try {
    const consultation = await Consultation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('patientId', 'nom prenom age sexe')
     .populate('medecinId', 'nom prenom specialite');
    
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation non trouvée' });
    }
    res.json(consultation);
  } catch (error) {
    console.error('Error updating consultation:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: Object.values(error.errors).map(err => err.message) 
      });
    }
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la consultation', error: error.message });
  }
};

// Delete consultation
export const deleteConsultation = async (req, res) => {
  try {
    const consultation = await Consultation.findByIdAndDelete(req.params.id);
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation non trouvée' });
    }
    res.json({ message: 'Consultation supprimée avec succès' });
  } catch (error) {
    console.error('Error deleting consultation:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de la consultation', error: error.message });
  }
};

// Get consultations by patient
export const getConsultationsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const consultations = await Consultation.find({ patientId })
      .populate('patientId', 'nom prenom age sexe')
      .populate('medecinId', 'nom prenom specialite')
      .sort({ date: -1 });
    
    res.json(consultations);
  } catch (error) {
    console.error('Error fetching consultations by patient:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des consultations', error: error.message });
  }
};

// Get consultations by medecin
export const getConsultationsByMedecin = async (req, res) => {
  try {
    const { medecinId } = req.params;
    const consultations = await Consultation.find({ medecinId })
      .populate('patientId', 'nom prenom age sexe')
      .populate('medecinId', 'nom prenom specialite')
      .sort({ date: -1 });
    
    res.json(consultations);
  } catch (error) {
    console.error('Error fetching consultations by medecin:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des consultations', error: error.message });
  }
};

// Get consultations by date range
export const getConsultationsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    const consultations = await Consultation.find({
      date: {
        $gte: start,
        $lte: end
      }
    }).populate('patientId', 'nom prenom age sexe')
      .populate('medecinId', 'nom prenom specialite')
      .sort({ date: -1 });
    
    res.json(consultations);
  } catch (error) {
    console.error('Error fetching consultations by date range:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des consultations', error: error.message });
  }
};

// Get consultations statistics
export const getConsultationsStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);
    
    const stats = await Consultation.aggregate([
      {
        $match: {
          date: {
            $gte: start,
            $lte: end
          }
        }
      },
      {
        $group: {
          _id: {
            type: '$type',
            statut: '$statut'
          },
          count: { $sum: 1 },
          totalMontant: { $sum: '$montant' },
          avgDuree: { $avg: '$duree' }
        }
      }
    ]);
    
    const totalConsultations = await Consultation.countDocuments({
      date: { $gte: start, $lte: end }
    });
    
    const totalRevenue = await Consultation.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$montant' }
        }
      }
    ]);
    
    const monthlyStats = await Consultation.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$montant' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);
    
    res.json({
      totalConsultations,
      totalRevenue: totalRevenue[0]?.total || 0,
      stats,
      monthlyStats
    });
  } catch (error) {
    console.error('Error fetching consultations stats:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques', error: error.message });
  }
};

// Update consultation status
export const updateConsultationStatus = async (req, res) => {
  try {
    const { statut } = req.body;
    const consultation = await Consultation.findByIdAndUpdate(
      req.params.id,
      { statut },
      { new: true, runValidators: true }
    ).populate('patientId', 'nom prenom age sexe')
     .populate('medecinId', 'nom prenom specialite');
    
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation non trouvée' });
    }
    res.json(consultation);
  } catch (error) {
    console.error('Error updating consultation status:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du statut', error: error.message });
  }
}; 