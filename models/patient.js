import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  // === ÉTAT CIVIL DE BASE ===
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
  age: {
    type: Number,
    required: [true, 'L\'âge est obligatoire'],
    min: [1, 'L\'âge doit être supérieur à 0'],
    max: [150, 'L\'âge ne peut pas dépasser 150']
  },
  sexe: {
    type: String,
    enum: ['Homme', 'Femme'],
    required: [true, 'Le sexe est obligatoire']
  },
  telephone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email invalide']
  },
  adresse: {
    type: String,
    trim: true
  },
  photoUrl: {
    type: String,
    default: ''
  },
  dateConsultation: {
    type: Date,
    default: Date.now
  },
  derniereVisite: {
    type: Date,
    default: Date.now
  },

  // === ÉTAT CIVIL ÉTENDU ===
  profession: {
    type: String,
    trim: true
  },
  habitudesToxiques: {
    tabac: {
      type: Boolean,
      default: false
    },
    alcool: {
      type: Boolean,
      default: false
    },
    autres: {
      type: String,
      trim: true
    }
  },
  origine: {
    type: String,
    trim: true
  },

  // === DIABÈTE ===
  diabete: {
    type: String,
    enum: ['Type 1', 'Type 2', 'Gestationnel', 'Autre', 'Non spécifié'],
    default: 'Non spécifié'
  },

  // === DIAGNOSTIC ===
  diagnostic: {
    typeOperation: {
      type: String,
      trim: true,
      enum: [
        'Chopart', 'Lisfranc', 'Trans tibial', 'Trans fémoral', 'Désarticulation hanche', 'Désarticulation orteil', 'Autre', 'Non spécifié'
      ],
      default: 'Non spécifié'
    },
    typeOperationPreciser: {
      type: String,
      trim: true
    },
    laterality: {
      type: String,
      enum: ['Unilatéral', 'Bilatéral', 'Non spécifié'],
      default: 'Non spécifié'
    },
    reprise: {
      type: String,
      enum: ['Oui', 'Non', 'Non spécifié'],
      default: 'Non spécifié'
    },
    dateOperation: {
      type: Date
    },
    facteursRisque: {
      hta: { type: Boolean, default: false },
      htaDepuis: { type: String, trim: true },
      htaTrt: { type: String, trim: true },
      diabete: { type: Boolean, default: false },
      diabeteDepuis: { type: String, trim: true },
      diabeteTrt: { type: String, trim: true },
      dyslipidemie: { type: Boolean, default: false },
      obesite: { type: Boolean, default: false },
      tabac: { type: Boolean, default: false },
      tabacDepuis: { type: String, trim: true },
      tabacTrt: { type: String, trim: true },
      cancer: { type: Boolean, default: false },
      autres: { type: String, trim: true },
      autresDepuis: { type: String, trim: true }
    },
    maladieCardiovasculaire: {
      type: String,
      enum: ['AVC', 'Ischémique', 'Coronarien', 'Autre', 'Aucune'],
      default: 'Aucune'
    },
    maladieCardiovasculaireFE: {
      type: String,
      trim: true
    },
    maladieCardiovasculaireAutre: {
      type: String,
      trim: true
    },
    depuis: {
      type: String,
      trim: true
    }
  },

  // === ANTÉCÉDENTS ===
  antecedents: {
    medicaux: {
      type: String,
      trim: true
    },
    medicauxDetails: {
      angorEffort: { type: Boolean, default: false },
      sca: { type: Boolean, default: false },
      idm: { type: Boolean, default: false },
      aomi: { type: Boolean, default: false },
      avc: { type: Boolean, default: false }
    },
    chirurgicaux: {
      type: String,
      trim: true
    },
    chirurgicauxDetails: {
      amputationAnterieure: { type: String, enum: ['Oui', 'Non', 'Non spécifié'], default: 'Non spécifié' },
      amputationAnterieureType: { type: String, trim: true },
      amputationFamiliale: { type: String, enum: ['Oui', 'Non', 'Non spécifié'], default: 'Non spécifié' }
    },
    familiaux: {
      hta: { type: Boolean, default: false },
      dt2: { type: Boolean, default: false },
      autres: { type: String, trim: true }
    }
  },

  // === CLINIQUE ===
  clinique: {
    tensionArterielle: {
      systolique: { type: Number },
      diastolique: { type: Number }
    },
    frequenceCardiaque: {
      type: Number
    },
    poids: {
      type: Number // en kg
    },
    taille: {
      type: Number // en cm
    },
    bmi: {
      type: Number
    },
    examenNeurologique: {
      effectue: { type: Boolean, default: false },
      type: { type: String, trim: true }
    }
  },

  // === CONSULTATION ===
  consultation: {
    dateAdmission: {
      type: Date,
      default: Date.now
    },
    transfert: {
      type: Boolean,
      default: false
    },
    specialite: {
      type: String,
      enum: ['Médecine', 'Chirurgie', 'Cardiologie', 'Endocrinologie', 'Autre'],
      default: 'Médecine'
    },
    typeConsultation: {
      type: String,
      enum: ['Publique', 'Privée', 'Externe', 'Urgence', 'Hospitalisation'],
      default: 'Externe'
    }
  },

  // === ANESTHÉSIE ===
  anesthesie: {
    ag: {
      type: Boolean,
      default: false
    },
    alr: {
      al: { type: Boolean, default: false },
      ra: { type: Boolean, default: false },
      peridural: { type: Boolean, default: false },
      perirachicombine: { type: Boolean, default: false },
      blocPeripherique: { type: Boolean, default: false }
    },
    asa: {
      type: String,
      enum: ['ASA I', 'ASA II', 'ASA III', 'ASA IV', 'ASA V'],
      default: ''
    }
  },

  // === DOCUMENTS UPLOAD ===
  documents: [
    {
      filename: String,
      originalname: String,
      mimetype: String,
      size: Number,
      url: String
    }
  ],

  // === NOTES ET ORDONNANCES ===
  notes: {
    type: String,
    trim: true
  },
  ordonnances: [{ type: String }],

  // === ÉVOLUTION ===
  evolution: {
    cicatrisation: {
      delai: Number,
      unite: { type: String, enum: ['jour', 'mois'], default: 'jour' }
    },
    protheseDate: Date,
    crp: {
      initial: Number,
      unMois: Number,
      deuxMois: Number
    },
    hemoglobineGlyquee: {
      avant: Number,
      unMois: Number,
      troisMois: Number
    },
    troponine: {
      avantOperation: Number,
      apresOperation: Number
    },
    cycle: String,
    autre: String
  },

  // === STATUT PATIENT ===
  statut: {
    type: String,
    enum: ['nouveau', 'sous_trt', 'apres_trt', 'decede'],
    default: 'nouveau'
  },

  // === HISTORIQUE DES STATUTS ===
  statutHistory: [
    {
      statut: {
        type: String,
        enum: ['nouveau', 'sous_trt', 'apres_trt', 'decede'],
        required: true
      },
      date: {
        type: Date,
        required: true
      }
    }
  ],
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Index for better search performance
patientSchema.index({ nom: 1, prenom: 1 });
patientSchema.index({ email: 1 });
patientSchema.index({ telephone: 1 });

// Virtual for full name
patientSchema.virtual('nomComplet').get(function() {
  return `${this.nom} ${this.prenom}`;
});

// Pre-save middleware to calculate BMI
patientSchema.pre('save', function(next) {
  if (this.clinique && this.clinique.poids && this.clinique.taille) {
    const tailleEnMetres = this.clinique.taille / 100;
    this.clinique.bmi = Math.round((this.clinique.poids / (tailleEnMetres * tailleEnMetres)) * 10) / 10;
  }
  next();
});

// Ensure virtual fields are serialized
patientSchema.set('toJSON', { virtuals: true });
patientSchema.set('toObject', { virtuals: true });

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;
