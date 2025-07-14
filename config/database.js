import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/buchatech';

// MongoDB connection options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true,
  }
};

// Connect to MongoDB
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, options);
    
    console.log('✅ MongoDB Connected:', conn.connection.host);
    console.log('📊 Database:', conn.connection.name);
    console.log('🔗 Connection URL:', MONGODB_URI);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🛑 MongoDB connection closed through app termination');
      process.exit(0);
    });
    
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Disconnect from MongoDB
export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB disconnected successfully');
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error);
  }
};

// Get database status
export const getDBStatus = () => {
  return {
    connected: mongoose.connection.readyState === 1,
    host: mongoose.connection.host,
    name: mongoose.connection.name,
    readyState: mongoose.connection.readyState
  };
};

// Health check function
export const healthCheck = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.admin().ping();
      return { status: 'healthy', message: 'Database is connected and responsive' };
    } else {
      return { status: 'unhealthy', message: 'Database is not connected' };
    }
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}; 