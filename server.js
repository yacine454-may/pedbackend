import express from 'express';
import cors from 'cors';
import { connectDB, getDBStatus, healthCheck } from './config/database.js';
import { autoSeedIfEmpty } from './seeders/initialData.js';
import patientRoutes from './routes/patientRoutes.js';
import medecinRoutes from './routes/medecinRoutes.js';
import rendezVousRoutes from './routes/rendezVousRoutes.js';
import consultationRoutes from './routes/consultationRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import authRoutes from './routes/authRoutes.js';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
connectDB().then(async () => {
  console.log('🚀 Database connected successfully');
  
  // Auto-seed database if empty
  await autoSeedIfEmpty();
  
  console.log('✅ Server ready to handle requests');
}).catch((error) => {
  console.error('❌ Failed to connect to database:', error);
  process.exit(1);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/medecins', medecinRoutes);
app.use('/api/rendez-vous', rendezVousRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/stats', statsRoutes);
//app.use('/api/login', authRoutes);
// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbHealth = await healthCheck();
    const dbStatus = getDBStatus();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: dbHealth,
      dbStatus: dbStatus,
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// Database status endpoint
app.get('/api/db-status', (req, res) => {
  const status = getDBStatus();
  res.json(status);
});

// Root endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'BuchaTech API is running! 🏥',
    version: '1.0.0',
    endpoints: {
      patients: '/api/patients',
      medecins: '/api/medecins',
      rendezVous: '/api/rendez-vous',
      consultations: '/api/consultations',
      stats: '/api/stats',
      health: '/api/health',
      dbStatus: '/api/db-status'
    },
    database: getDBStatus()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Endpoint not found',
    availableEndpoints: [
      'GET /api',
      'GET /api/health',
      'GET /api/db-status',
      'GET /api/patients',
      'GET /api/medecins',
      'GET /api/rendez-vous',
      'GET /api/consultations',
      'GET /api/stats'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🏥 BuchaTech Server running on port ${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
  console.log(`🔍 Health check at http://localhost:${PORT}/api/health`);
  console.log(`💾 Database status at http://localhost:${PORT}/api/db-status`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

app.use('/uploads', express.static(path.join(process.cwd(), 'backend', 'uploads')));