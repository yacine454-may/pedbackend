import mongoose from 'mongoose';

const medecinSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom est obligatoire'],
    trim: true,
    default: 'Dr.'
  },
  prenom: {
    type: String,
    required: [true, 'Le prénom est obligatoire'],
    trim: true
  },
  specialite: {
    type: String,
    required: [true, 'La spécialité est obligatoire'],
    enum: ['Diabétologue', 'Endocrinologue', 'Podologue', 'Cardiologue', 'Néphrologue', 'Autre'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'L\'email est obligatoire'],
    trim: true,
    lowercase: true,
    unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email invalide']
  },
  telephone: {
    type: String,
    required: [true, 'Le téléphone est obligatoire'],
    trim: true
  },
  status: {
    type: String,
    enum: ['En service', 'En congé', 'En formation'],
    default: 'En service'
  },
  photoUrl: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    trim: true
  },
  horaires: {
    lundi: { debut: String, fin: String },
    mardi: { debut: String, fin: String },
    mercredi: { debut: String, fin: String },
    jeudi: { debut: String, fin: String },
    vendredi: { debut: String, fin: String },
    samedi: { debut: String, fin: String },
    dimanche: { debut: String, fin: String }
  }
}, {
  timestamps: true
});

// Index for better search performance
medecinSchema.index({ nom: 1, prenom: 1 });
medecinSchema.index({ email: 1 });
medecinSchema.index({ specialite: 1 });
medecinSchema.index({ status: 1 });

// Virtual for full name
medecinSchema.virtual('nomComplet').get(function() {
  return `${this.nom} ${this.prenom}`;
});

// Virtual for availability
medecinSchema.virtual('disponible').get(function() {
  return this.status === 'En service';
});

// Ensure virtual fields are serialized
medecinSchema.set('toJSON', { virtuals: true });
medecinSchema.set('toObject', { virtuals: true });

const Medecin = mongoose.model('Medecin', medecinSchema);

export default Medecin; 