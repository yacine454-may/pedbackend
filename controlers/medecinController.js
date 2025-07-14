import Medecin from '../models/Medecin.js';

// Get all medecins
export const getAllMedecins = async (req, res) => {
  try {
    const medecins = await Medecin.find().sort({ createdAt: -1 });
  res.json(medecins);
  } catch (error) {
    console.error('Error fetching medecins:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des médecins', error: error.message });
  }
};

// Get medecin by ID
export const getMedecinById = async (req, res) => {
  try {
    const medecin = await Medecin.findById(req.params.id);
    if (!medecin) {
      return res.status(404).json({ message: 'Médecin non trouvé' });
    }
    res.json(medecin);
  } catch (error) {
    console.error('Error fetching medecin:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du médecin', error: error.message });
  }
};

// Create new medecin
export const createMedecin = async (req, res) => {
  try {
    const medecin = new Medecin(req.body);
    const savedMedecin = await medecin.save();
    res.status(201).json(savedMedecin);
  } catch (error) {
    console.error('Error creating medecin:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: Object.values(error.errors).map(err => err.message) 
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Un médecin avec cet email existe déjà' 
      });
    }
    res.status(500).json({ message: 'Erreur lors de la création du médecin', error: error.message });
  }
};

// Update medecin
export const updateMedecin = async (req, res) => {
  try {
    const medecin = await Medecin.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!medecin) {
      return res.status(404).json({ message: 'Médecin non trouvé' });
    }
    res.json(medecin);
  } catch (error) {
    console.error('Error updating medecin:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: Object.values(error.errors).map(err => err.message) 
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Un médecin avec cet email existe déjà' 
      });
    }
    res.status(500).json({ message: 'Erreur lors de la mise à jour du médecin', error: error.message });
  }
};

// Delete medecin
export const deleteMedecin = async (req, res) => {
  try {
    const medecin = await Medecin.findByIdAndDelete(req.params.id);
    if (!medecin) {
      return res.status(404).json({ message: 'Médecin non trouvé' });
    }
    res.json({ message: 'Médecin supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting medecin:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du médecin', error: error.message });
  }
};

// Search medecins
export const searchMedecins = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }

    const medecins = await Medecin.find({
      $or: [
        { nom: { $regex: query, $options: 'i' } },
        { prenom: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { specialite: { $regex: query, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 });

    res.json(medecins);
  } catch (error) {
    console.error('Error searching medecins:', error);
    res.status(500).json({ message: 'Erreur lors de la recherche des médecins', error: error.message });
  }
};

// Get medecins by speciality
export const getMedecinsBySpeciality = async (req, res) => {
  try {
    const { specialite } = req.params;
    const medecins = await Medecin.find({ specialite }).sort({ createdAt: -1 });
    res.json(medecins);
  } catch (error) {
    console.error('Error fetching medecins by speciality:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des médecins', error: error.message });
  }
};

// Get medecins by status
export const getMedecinsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const medecins = await Medecin.find({ status }).sort({ createdAt: -1 });
    res.json(medecins);
  } catch (error) {
    console.error('Error fetching medecins by status:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des médecins', error: error.message });
  }
};

// Get medecins statistics
export const getMedecinsStats = async (req, res) => {
  try {
    const stats = await Medecin.aggregate([
      {
        $group: {
          _id: '$specialite',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusStats = await Medecin.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalMedecins = await Medecin.countDocuments();
    const availableMedecins = await Medecin.countDocuments({ status: 'En service' });

    res.json({
      totalMedecins,
      availableMedecins,
      bySpeciality: stats,
      byStatus: statusStats
    });
  } catch (error) {
    console.error('Error fetching medecins stats:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques', error: error.message });
  }
};