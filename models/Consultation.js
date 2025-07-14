import mongoose from 'mongoose';

const consultationSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'La date est obligatoire'],
    default: Date.now
  },
  type: {
    type: String,
    required: [true, 'Le type est obligatoire'],
    enum: ['Consultation', 'Urgence', 'Contrôle', 'Suivi', 'Consultation initiale'],
    trim: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'L\'ID du patient est obligatoire']
  },
  medecinId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medecin',
    required: [true, 'L\'ID du médecin est obligatoire']
  },
  diagnostic: {
    type: String,
    trim: true
  },
  traitement: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  duree: {
    type: Number, // Duration in minutes
    default: 30,
    min: [5, 'La durée minimum est de 5 minutes'],
    max: [240, 'La durée maximum est de 4 heures']
  },
  statut: {
    type: String,
    enum: ['Planifié', 'En cours', 'Terminé', 'Annulé'],
    default: 'Planifié'
  },
  montant: {
    type: Number,
    min: [0, 'Le montant ne peut pas être négatif'],
    default: 0
  },
  paiement: {
    type: String,
    enum: ['Non payé', 'Payé', 'Partiellement payé'],
    default: 'Non payé'
  }
}, {
  timestamps: true
});

// Index for better search performance
consultationSchema.index({ date: 1 });
consultationSchema.index({ patientId: 1 });
consultationSchema.index({ medecinId: 1 });
consultationSchema.index({ type: 1 });
consultationSchema.index({ statut: 1 });

// Virtual for formatted date
consultationSchema.virtual('dateFormatted').get(function() {
  return this.date.toLocaleDateString('fr-FR');
});

// Virtual for formatted time
consultationSchema.virtual('heureFormatted').get(function() {
  return this.date.toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
});

// Ensure virtual fields are serialized
consultationSchema.set('toJSON', { virtuals: true });
consultationSchema.set('toObject', { virtuals: true });

// Static method to get statistics
consultationSchema.statics.getStats = async function(startDate, endDate) {
  const stats = await this.aggregate([
    {
      $match: {
        date: {
          $gte: startDate,
          $lte: endDate
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
  
  return stats;
};

// Static method to get consultations by month
consultationSchema.statics.getByMonth = async function(year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  
  return await this.find({
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).populate('patientId', 'nom prenom').populate('medecinId', 'nom prenom specialite');
};

const Consultation = mongoose.model('Consultation', consultationSchema);

export default Consultation; 