# BuchaTech Backend API

A comprehensive healthcare management system backend built with Node.js, Express, and MongoDB.

## 🚀 Features

- **Patient Management**: Complete CRUD operations for patient records
- **Doctor Management**: Manage medical staff with specialties and availability
- **Appointment Scheduling**: Book and manage appointments with conflict detection
- **Consultation Tracking**: Record and track medical consultations
- **Statistics & Analytics**: Comprehensive dashboard with real-time statistics
- **MongoDB Integration**: Persistent data storage with Mongoose ODM
- **Auto-seeding**: Automatic database population with sample data
- **Health Monitoring**: Database and API health check endpoints

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5.0 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd BuchaTech/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up MongoDB**
   
   **Option A: Local MongoDB**
   ```bash
   # Install MongoDB locally
   # Start MongoDB service
   mongod
   ```

   **Option B: MongoDB Atlas (Cloud)**
   - Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a new cluster
   - Get your connection string
   - Set environment variable: `MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/buchatech`

4. **Environment Variables**
   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/buchatech
   NODE_ENV=development
   ```

5. **Start the server**
   ```bash
   npm start
   ```

## 🗄️ Database Schema

### Patient Model
```javascript
{
  nom: String (required),
  prenom: String (required),
  age: Number (required, 1-150),
  diabete: String (enum: ['Type 1', 'Type 2', 'Gestationnel', 'Autre', 'Non spécifié']),
  sexe: String (enum: ['Homme', 'Femme']),
  telephone: String,
  email: String,
  adresse: String,
  notes: String,
  photoUrl: String,
  ordonnances: [String],
  derniereVisite: Date,
  dateConsultation: Date
}
```

### Medecin Model
```javascript
{
  nom: String (required),
  prenom: String (required),
  specialite: String (required, enum: ['Diabétologue', 'Endocrinologue', 'Podologue', 'Cardiologue', 'Néphrologue', 'Autre']),
  email: String (required, unique),
  telephone: String (required),
  status: String (enum: ['En service', 'En congé', 'En formation']),
  photoUrl: String,
  notes: String,
  horaires: Object
}
```

### RendezVous Model
```javascript
{
  heure: String (required, HH:MM format),
  patient: String (required),
  medecin: String (required),
  type: String (required, enum: ['Consultation', 'Contrôle', 'Urgence', 'Suivi traitement', 'Consultation initiale']),
  date: Date (required),
  notes: String,
  statut: String (enum: ['Confirmé', 'En attente', 'Annulé', 'Terminé']),
  duree: Number (15-180 minutes),
  patientId: ObjectId (ref: 'Patient'),
  medecinId: ObjectId (ref: 'Medecin')
}
```

### Consultation Model
```javascript
{
  date: Date (required),
  type: String (required, enum: ['Consultation', 'Urgence', 'Contrôle', 'Suivi', 'Consultation initiale']),
  patientId: ObjectId (required, ref: 'Patient'),
  medecinId: ObjectId (required, ref: 'Medecin'),
  diagnostic: String,
  traitement: String,
  notes: String,
  duree: Number (5-240 minutes),
  statut: String (enum: ['Planifié', 'En cours', 'Terminé', 'Annulé']),
  montant: Number,
  paiement: String (enum: ['Non payé', 'Payé', 'Partiellement payé'])
}
```

## 📡 API Endpoints

### Base URL: `http://localhost:5000/api`

### Health & Status
- `GET /health` - API health check
- `GET /db-status` - Database connection status
- `GET /` - API information and available endpoints

### Patients
- `GET /patients` - Get all patients
- `GET /patients/:id` - Get patient by ID
- `POST /patients` - Create new patient
- `PUT /patients/:id` - Update patient
- `DELETE /patients/:id` - Delete patient
- `GET /patients/search?query=...` - Search patients
- `GET /patients/diabetes/:type` - Get patients by diabetes type
- `GET /patients/stats` - Get patient statistics

### Medecins
- `GET /medecins` - Get all medecins
- `GET /medecins/:id` - Get medecin by ID
- `POST /medecins` - Create new medecin
- `PUT /medecins/:id` - Update medecin
- `DELETE /medecins/:id` - Delete medecin
- `GET /medecins/search?query=...` - Search medecins
- `GET /medecins/speciality/:specialite` - Get medecins by speciality
- `GET /medecins/status/:status` - Get medecins by status
- `GET /medecins/stats` - Get medecin statistics

### Rendez-vous
- `GET /rendez-vous` - Get all rendez-vous
- `GET /rendez-vous/:id` - Get rendez-vous by ID
- `POST /rendez-vous` - Create new rendez-vous
- `PUT /rendez-vous/:id` - Update rendez-vous
- `DELETE /rendez-vous/:id` - Delete rendez-vous
- `GET /rendez-vous/date/:date` - Get rendez-vous by date
- `GET /rendez-vous/medecin/:medecinId` - Get rendez-vous by medecin
- `GET /rendez-vous/patient/:patientId` - Get rendez-vous by patient
- `GET /rendez-vous/upcoming` - Get upcoming rendez-vous
- `PATCH /rendez-vous/:id/status` - Update rendez-vous status
- `GET /rendez-vous/stats` - Get rendez-vous statistics

### Consultations
- `GET /consultations` - Get all consultations
- `GET /consultations/:id` - Get consultation by ID
- `POST /consultations` - Create new consultation
- `PUT /consultations/:id` - Update consultation
- `DELETE /consultations/:id` - Delete consultation
- `GET /consultations/patient/:patientId` - Get consultations by patient
- `GET /consultations/medecin/:medecinId` - Get consultations by medecin
- `GET /consultations/date-range?startDate=...&endDate=...` - Get consultations by date range
- `PATCH /consultations/:id/status` - Update consultation status
- `GET /consultations/stats` - Get consultation statistics

### Statistics
- `GET /stats/dashboard` - Comprehensive dashboard statistics
- `GET /stats/patients` - Patient statistics
- `GET /stats/medecins` - Medecin statistics
- `GET /stats/rendez-vous` - Rendez-vous statistics

## 🔧 Development

### Running in Development Mode
```bash
npm run dev  # If nodemon is configured
# or
npm start
```

### Database Seeding
The application automatically seeds the database with sample data if it's empty. To manually seed:
```javascript
import { seedDatabase } from './seeders/initialData.js';
await seedDatabase();
```

### Database Backup
```bash
# Backup MongoDB database
mongodump --db buchatech --out ./backup

# Restore MongoDB database
mongorestore --db buchatech ./backup/buchatech
```

## 🚨 Error Handling

The API includes comprehensive error handling:
- **Validation Errors**: Returns 400 with detailed validation messages
- **Not Found Errors**: Returns 404 for missing resources
- **Database Errors**: Returns 500 with error details
- **Duplicate Key Errors**: Returns 400 for unique constraint violations

## 📊 Monitoring

### Health Check Response
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": {
    "status": "healthy",
    "message": "Database is connected and responsive"
  },
  "dbStatus": {
    "connected": true,
    "host": "localhost:27017",
    "name": "buchatech"
  },
  "uptime": 3600
}
```

## 🔒 Security Considerations

- Input validation on all endpoints
- MongoDB injection protection via Mongoose
- CORS configuration for frontend integration
- Environment variable management
- Error message sanitization in production

## 📝 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions, please contact the development team. 