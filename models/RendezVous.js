import mongoose from 'mongoose';

const rendezVousSchema = new mongoose.Schema({
  heure: {
    type: String,
    required: [true, 'L\'heure est obligatoire'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format d\'heure invalide (HH:MM)']
  },
  patient: {
    type: String,
    required: [true, 'Le nom du patient est obligatoire'],
    trim: true
  },
  medecin: {
    type: String,
    required: [true, 'Le nom du médecin est obligatoire'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Le type de consultation est obligatoire'],
    enum: ['Consultation', 'Contrôle', 'Urgence', 'Suivi traitement', 'Consultation initiale'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'La date est obligatoire'],
    default: Date.now
  },
  notes: {
    type: String,
    trim: true
  },
  statut: {
    type: String,
    enum: ['Confirmé', 'En attente', 'Annulé', 'Terminé'],
    default: 'En attente'
  },
  duree: {
    type: Number, // Duration in minutes
    default: 30,
    min: [15, 'La durée minimum est de 15 minutes'],
    max: [180, 'La durée maximum est de 3 heures']
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient'
  },
  medecinId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medecin'
  }
}, {
  timestamps: true
});

// Index for better search performance
rendezVousSchema.index({ date: 1, heure: 1 });
rendezVousSchema.index({ medecin: 1, date: 1 });
rendezVousSchema.index({ patient: 1 });
rendezVousSchema.index({ statut: 1 });

// Virtual for formatted date
rendezVousSchema.virtual('dateFormatted').get(function() {
  return this.date.toLocaleDateString('fr-FR');
});

// Virtual for formatted time
rendezVousSchema.virtual('heureFormatted').get(function() {
  return this.heure;
});

// Ensure virtual fields are serialized
rendezVousSchema.set('toJSON', { virtuals: true });
rendezVousSchema.set('toObject', { virtuals: true });

const RendezVous = mongoose.model('RendezVous', rendezVousSchema);

export default RendezVous;