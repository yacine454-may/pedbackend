import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Configuration JWT
const JWT_SECRET = process.env.JWT_SECRET || 'votre-secret-jwt-super-securise';
const JWT_EXPIRES_IN = '24h';

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation des champs
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis'
      });
    }

    // Recherche de l'utilisateur
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérification si l'utilisateur est actif
    if (!user.actif) {
      return res.status(401).json({
        success: false,
        message: 'Compte désactivé. Contactez l\'administrateur.'
      });
    }

    // Vérification du mot de passe
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Mise à jour de la dernière connexion
    user.derniereConnexion = new Date();
    await user.save();

    // Génération du token JWT
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Réponse avec les informations utilisateur (sans mot de passe)
    res.json({
      success: true,
      message: 'Connexion réussie',
      token,
      user: user.toPublicJSON()
    });

  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Register (pour créer de nouveaux comptes)
export const register = async (req, res) => {
  try {
    const { nom, prenom, email, password, role, specialite, telephone } = req.body;

    // Validation des champs obligatoires
    if (!nom || !prenom || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nom, prénom, email et mot de passe sont obligatoires'
      });
    }

    // Vérification si l'email existe déjà
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà'
      });
    }

    // Création du nouvel utilisateur
    const newUser = new User({
      nom,
      prenom,
      email: email.toLowerCase(),
      password,
      role: role || 'secretaire',
      specialite,
      telephone
    });

    await newUser.save();

    // Génération du token JWT
    const token = jwt.sign(
      {
        userId: newUser._id,
        email: newUser.email,
        role: newUser.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      token,
      user: newUser.toPublicJSON()
    });

  } catch (error) {
    console.error('Erreur register:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Middleware d'authentification
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'accès requis'
      });
    }

    // Vérification du token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Recherche de l'utilisateur
    const user = await User.findById(decoded.userId);
    if (!user || !user.actif) {
      return res.status(401).json({
        success: false,
        message: 'Token invalide ou utilisateur désactivé'
      });
    }

    // Ajout des informations utilisateur à la requête
    req.user = user.toPublicJSON();
    next();

  } catch (error) {
    console.error('Erreur authentification:', error);
    return res.status(403).json({
      success: false,
      message: 'Token invalide'
    });
  }
};

// Middleware pour vérifier les rôles
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    next();
  };
};

// Récupération du profil utilisateur
export const getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('Erreur getProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Déconnexion (optionnel - côté client)
export const logout = async (req, res) => {
  try {
    // En production, vous pourriez ajouter le token à une liste noire
    res.json({
      success: true,
      message: 'Déconnexion réussie'
    });
  } catch (error) {
    console.error('Erreur logout:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
}; 