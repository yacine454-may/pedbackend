import Patient from '../models/patient.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'backend', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Get all patients
export const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
  res.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des patients', error: error.message });
  }
};

// Get patient by ID
export const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient non trouvé' });
    }
    res.json(patient);
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du patient', error: error.message });
  }
};

// Create new patient
export const createPatient = async (req, res) => {
  try {
    const patient = new Patient(req.body);
    const savedPatient = await patient.save();
    res.status(201).json(savedPatient);
  } catch (error) {
    console.error('Error creating patient:', error);
    if (error.name === 'ValidationError') {
    return res.status(400).json({ 
        message: 'Données invalides', 
        errors: Object.values(error.errors).map(err => err.message) 
      });
    }
    res.status(500).json({ message: 'Erreur lors de la création du patient', error: error.message });
  }
};

// Update patient
export const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!patient) {
      return res.status(404).json({ message: 'Patient non trouvé' });
    }
    res.json(patient);
  } catch (error) {
    console.error('Error updating patient:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: Object.values(error.errors).map(err => err.message) 
      });
    }
    res.status(500).json({ message: 'Erreur lors de la mise à jour du patient', error: error.message });
  }
};

// Delete patient
export const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient non trouvé' });
    }
    res.json({ message: 'Patient supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du patient', error: error.message });
  }
};

// Search patients
export const searchPatients = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }

    const patients = await Patient.find({
      $or: [
        { nom: { $regex: query, $options: 'i' } },
        { prenom: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { telephone: { $regex: query, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 });

    res.json(patients);
  } catch (error) {
    console.error('Error searching patients:', error);
    res.status(500).json({ message: 'Erreur lors de la recherche des patients', error: error.message });
  }
};

// Get patients by diabetes type
export const getPatientsByDiabetesType = async (req, res) => {
  try {
    const { type } = req.params;
    const patients = await Patient.find({ diabete: type }).sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    console.error('Error fetching patients by diabetes type:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des patients', error: error.message });
  }
};

// Get patients statistics
export const getPatientsStats = async (req, res) => {
  try {
    const stats = await Patient.aggregate([
      {
        $group: {
          _id: '$diabete',
          count: { $sum: 1 },
          avgAge: { $avg: '$age' }
        }
      }
    ]);

    const totalPatients = await Patient.countDocuments();
    const recentPatients = await Patient.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    res.json({
      totalPatients,
      recentPatients,
      byDiabetesType: stats,
      ageDistribution: await Patient.aggregate([
        {
          $group: {
            _id: {
              $cond: [
                { $lt: ['$age', 30] },
                '18-29',
                {
                  $cond: [
                    { $lt: ['$age', 50] },
                    '30-49',
                    {
                      $cond: [
                        { $lt: ['$age', 70] },
                        '50-69',
                        '70+'
                      ]
                    }
                  ]
                }
              ]
            },
            count: { $sum: 1 }
          }
        }
      ])
    });
  } catch (error) {
    console.error('Error fetching patients stats:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques', error: error.message });
  }
};

// Upload files for a patient
export const uploadPatientDocuments = [
  upload.array('files', 10), // up to 10 files at once
  async (req, res) => {
    try {
      const patientId = req.params.id;
      const files = req.files;
      if (!files || files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
      }
      const patient = await Patient.findById(patientId);
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      files.forEach(file => {
        patient.documents.push({
          filename: file.filename,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          url: `/uploads/${file.filename}`
        });
      });
      await patient.save();
      res.status(200).json({ message: 'Files uploaded', documents: patient.documents });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error uploading files', error: err.message });
    }
  }
];