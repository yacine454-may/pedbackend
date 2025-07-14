import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom est obligatoire'],
    trim: true
  },
  prenom: {
    type: String,
    required: [true, 'Le prénom est obligatoire'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'L\'email est obligatoire'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email invalide']
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est obligatoire'],
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères']
  },
  role: {
    type: String,
    enum: ['admin', 'medecin', 'infirmier', 'secretaire'],
    default: 'secretaire'
  },
  specialite: {
    type: String,
    trim: true
  },
  telephone: {
    type: String,
    trim: true
  },
  actif: {
    type: Boolean,
    default: true
  },
  derniereConnexion: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash du mot de passe avant sauvegarde
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour obtenir les informations publiques de l'utilisateur
userSchema.methods.toPublicJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Index pour améliorer les performances
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

const User = mongoose.model('User', userSchema);

export default User; 