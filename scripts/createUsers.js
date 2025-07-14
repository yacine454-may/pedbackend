import mongoose from 'mongoose';
import User from '../models/User.js';
import { connectDB } from '../config/database.js';

// Configuration de la base de données
const MONGODB_URI = 'mongodb+srv://yacinemehdi2005:yacine2005@bucha.cxx8ull.mongodb.net/buchatech?retryWrites=true&w=majority&appName=bucha';

// Liste des utilisateurs à créer
const users = [
  {
    nom: 'Admin',
    prenom: 'Système',
    email: 'admin@buchatech.com',
    password: 'admin123',
    role: 'admin',
    specialite: 'Administration',
    telephone: '0123456789'
  },
  {
    nom: 'Dupont',
    prenom: 'Dr. Marie',
    email: 'marie.dupont@buchatech.com',
    password: 'medecin123',
    role: 'medecin',
    specialite: 'Cardiologie',
    telephone: '0123456790'
  },
  {
    nom: 'Martin',
    prenom: 'Dr. Jean',
    email: 'jean.martin@buchatech.com',
    password: 'medecin123',
    role: 'medecin',
    specialite: 'Endocrinologie',
    telephone: '0123456791'
  },
  {
    nom: 'Bernard',
    prenom: 'Infirmier',
    email: 'infirmier@buchatech.com',
    password: 'infirmier123',
    role: 'infirmier',
    specialite: 'Soins généraux',
    telephone: '0123456792'
  },
  {
    nom: 'Petit',
    prenom: 'Secrétaire',
    email: 'secretaire@buchatech.com',
    password: 'secretaire123',
    role: 'secretaire',
    specialite: 'Accueil',
    telephone: '0123456793'
  },
  // Utilisateur de test simple
  {
    nom: 'Test',
    prenom: 'User',
    email: 'test@example.com',
    password: 'test1234',
    role: 'secretaire',
    specialite: 'Test',
    telephone: '0600000000'
  }
];

async function createUsers() {
  try {
    // Connexion à la base de données
    await connectDB();
    console.log('✅ Connecté à la base de données');

    // Suppression des utilisateurs existants (optionnel)
    await User.deleteMany({});
    console.log('🗑️  Anciens utilisateurs supprimés');

    // Création des nouveaux utilisateurs
    const createdUsers = [];
    
    for (const userData of users) {
      try {
        const user = new User(userData);
        await user.save();
        createdUsers.push(user);
        console.log(`✅ Utilisateur créé: ${user.email} (${user.role})`);
      } catch (error) {
        console.error(`❌ Erreur lors de la création de ${userData.email}:`, error.message);
      }
    }

    console.log('\n📊 Résumé:');
    console.log(`Total d'utilisateurs créés: ${createdUsers.length}`);
    
    // Affichage des informations de connexion
    console.log('\n🔑 Informations de connexion:');
    console.log('================================');
    
    createdUsers.forEach(user => {
      console.log(`\n👤 ${user.prenom} ${user.nom} (${user.role})`);
      console.log(`📧 Email: ${user.email}`);
      console.log(`🔐 Mot de passe: ${users.find(u => u.email === user.email)?.password}`);
      console.log(`🏥 Spécialité: ${user.specialite || 'Non spécifiée'}`);
    });

    console.log('\n🎉 Script terminé avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    // Fermeture de la connexion
    await mongoose.connection.close();
    console.log('🔌 Connexion à la base de données fermée');
    process.exit(0);
  }
}

// Exécution du script
createUsers(); 