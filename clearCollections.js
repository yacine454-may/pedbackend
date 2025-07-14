import { connectDB } from './config/database.js';
import Patient from './models/patient.js';
import Medecin from './models/Medecin.js';
import RendezVous from './models/RendezVous.js';

await connectDB();
await Patient.deleteMany({});
await Medecin.deleteMany({});
await RendezVous.deleteMany({});
console.log('✅ Patients, Medecins et RendezVous supprimés !');
process.exit(0); 