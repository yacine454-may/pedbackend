import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const PATIENTS_FILE = path.join(DATA_DIR, 'patients.json');
const MEDECINS_FILE = path.join(DATA_DIR, 'medecins.json');
const RENDEZVOUS_FILE = path.join(DATA_DIR, 'rendezvous.json');
const CONSULTATIONS_FILE = path.join(DATA_DIR, 'consultations.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize empty files if they don't exist
const initializeFile = (filePath, defaultData = []) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
};

// Initialize all data files
initializeFile(PATIENTS_FILE);
initializeFile(MEDECINS_FILE);
initializeFile(RENDEZVOUS_FILE);
initializeFile(CONSULTATIONS_FILE);

// Load data from file
const loadData = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading data from ${filePath}:`, error);
    return [];
  }
};

// Save data to file
const saveData = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Data saved successfully to ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Error saving data to ${filePath}:`, error);
    return false;
  }
};

// Data storage functions
export const dataStorage = {
  // Patients
  loadPatients: () => loadData(PATIENTS_FILE),
  savePatients: (patients) => saveData(PATIENTS_FILE, patients),
  
  // Medecins
  loadMedecins: () => loadData(MEDECINS_FILE),
  saveMedecins: (medecins) => saveData(MEDECINS_FILE, medecins),
  
  // Rendez-vous
  loadRendezVous: () => loadData(RENDEZVOUS_FILE),
  saveRendezVous: (rendezVous) => saveData(RENDEZVOUS_FILE, rendezVous),
  
  // Consultations
  loadConsultations: () => loadData(CONSULTATIONS_FILE),
  saveConsultations: (consultations) => saveData(CONSULTATIONS_FILE, consultations),
  
  // Backup all data
  backupAllData: (patients, medecins, rendezVous, consultations) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(DATA_DIR, 'backups', timestamp);
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const backupData = {
      timestamp: new Date().toISOString(),
      patients,
      medecins,
      rendezVous,
      consultations
    };
    
    const backupFile = path.join(backupDir, 'backup.json');
    return saveData(backupFile, backupData);
  },
  
  // Get data directory info
  getDataInfo: () => ({
    dataDir: DATA_DIR,
    patientsFile: PATIENTS_FILE,
    medecinsFile: MEDECINS_FILE,
    rendezVousFile: RENDEZVOUS_FILE,
    consultationsFile: CONSULTATIONS_FILE
  })
}; 