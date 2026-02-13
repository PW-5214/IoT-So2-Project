import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Reading from './models/Reading.js';
import Device from './models/Device.js';
import Alert from './models/Alert.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(bodyParser.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path} from ${req.ip}`);
  next();
});

// MongoDB Connection
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Atlas connected successfully!');
    
    // Initialize default device if not exists
    Device.findOne({ deviceId: 'NodeMCU_001' })
      .then(device => {
        if (!device) {
          const newDevice = new Device({
            deviceId: 'NodeMCU_001',
            deviceName: 'IoT Sensor Device 1',
            location: {
              zone: 'A',
              name: 'Industrial Zone A',
              description: 'Primary field sensor'
            }
          });
          return newDevice.save();
        }
      })
      .then(() => {
        console.log('✅ Default device initialized');
      })
      .catch(err => console.error('⚠️  Device init error:', err.message));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('💡 Server will continue running but data operations will fail');
    console.error('💡 Check your MONGODB_URI and MongoDB Atlas IP whitelist');
  });

// Helper function to check thresholds and create alerts
async function checkThresholds(reading, deviceId) {
  try {
    const device = await Device.findOne({ deviceId });
    if (!device) return;

    const thresholds = device.settings.thresholds;
    const alerts = [];

    // Check temperature
    if (reading.temperature > thresholds.temperatureMax) {
      alerts.push({
        deviceId,
        alertType: 'HIGH_TEMPERATURE',
        message: `Temperature ${reading.temperature}°C exceeded maximum threshold ${thresholds.temperatureMax}°C`,
        value: reading.temperature,
        threshold: thresholds.temperatureMax,
        severity: reading.temperature > thresholds.temperatureMax + 5 ? 'critical' : 'high'
      });
    } else if (reading.temperature < thresholds.temperatureMin) {
      alerts.push({
        deviceId,
        alertType: 'LOW_TEMPERATURE',
        message: `Temperature ${reading.temperature}°C below minimum threshold ${thresholds.temperatureMin}°C`,
        value: reading.temperature,
        threshold: thresholds.temperatureMin,
        severity: 'medium'
      });
    }

    // Check humidity
    if (reading.humidity > thresholds.humidityMax) {
      alerts.push({
        deviceId,
        alertType: 'HIGH_HUMIDITY',
        message: `Humidity ${reading.humidity}% exceeded maximum threshold ${thresholds.humidityMax}%`,
        value: reading.humidity,
        threshold: thresholds.humidityMax,
        severity: 'medium'
      });
    } else if (reading.humidity < thresholds.humidityMin) {
      alerts.push({
        deviceId,
        alertType: 'LOW_HUMIDITY',
        message: `Humidity ${reading.humidity}% below minimum threshold ${thresholds.humidityMin}%`,
        value: reading.humidity,
        threshold: thresholds.humidityMin,
        severity: 'medium'
      });
    }

    // Check soil moisture
    if (reading.soilMoisture < thresholds.soilMoistureMin) {
      alerts.push({
        deviceId,
        alertType: 'LOW_SOIL_MOISTURE',
        message: `Soil moisture ${reading.soilMoisture}% below minimum threshold ${thresholds.soilMoistureMin}% - Irrigation recommended`,
        value: reading.soilMoisture,
        threshold: thresholds.soilMoistureMin,
        severity: reading.soilMoisture < 15 ? 'critical' : 'high'
      });
    }

    // Save alerts to database
    if (alerts.length > 0) {
      await Alert.insertMany(alerts);
      console.log(`⚠️  ${alerts.length} alert(s) created`);
    }

  } catch (error) {
    console.error('Error checking thresholds:', error.message);
  }
}

// POST endpoint - NodeMCU sends data here
app.post('/api/sensors/data', async (req, res) => {
  try {
    const { temperature, humidity, soilMoisture, deviceId } = req.body;
    
    // Validate data
    if (temperature === undefined || humidity === undefined || soilMoisture === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing sensor data' 
      });
    }
    
    // Create new reading document
    const reading = new Reading({
      deviceId: deviceId || 'NodeMCU_001',
      temperature: parseFloat(temperature),
      humidity: parseFloat(humidity),
      soilMoisture: parseFloat(soilMoisture),
      timestamp: new Date()
    });
    
    // Save to MongoDB
    await reading.save();
    
    // Update device's lastSeen timestamp
    await Device.findOneAndUpdate(
      { deviceId: reading.deviceId },
      { lastSeen: new Date() },
      { upsert: false }
    );
    
    // Check thresholds and create alerts if needed
    await checkThresholds(reading, reading.deviceId);
    
    console.log('✅ Received sensor data:', {
      temp: reading.temperature + '°C',
      humidity: reading.humidity + '%',
      soil: reading.soilMoisture + '%',
      time: reading.timestamp.toLocaleTimeString(),
      saved: 'MongoDB'
    });
    
    res.json({ 
      success: true, 
      message: 'Data received and saved successfully',
      dataPoint: reading 
    });
    
  } catch (error) {
    console.error('❌ Error processing sensor data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
});

// GET endpoint - Frontend fetches current data
app.get('/api/sensors/current', async (req, res) => {
  try {
    const deviceId = req.query.deviceId || 'NodeMCU_001';
    
    // Get latest reading from MongoDB
    const latestReading = await Reading.findOne({ deviceId })
      .sort({ timestamp: -1 })
      .limit(1);
    
    if (!latestReading) {
      return res.json({
        temperature: 0,
        humidity: 0,
        soilMoisture: 0,
        timestamp: new Date(),
        isStale: true,
        dataAge: 'No data',
        deviceId
      });
    }
    
    // Check if data is fresh (less than 30 seconds old)
    const dataAge = Date.now() - new Date(latestReading.timestamp).getTime();
    const isStale = dataAge > 30000; // 30 seconds
    
    res.json({
      temperature: latestReading.temperature,
      humidity: latestReading.humidity,
      soilMoisture: latestReading.soilMoisture,
      timestamp: latestReading.timestamp,
      deviceId: latestReading.deviceId,
      isStale,
      dataAge: Math.floor(dataAge / 1000) + 's'
    });
  } catch (error) {
    console.error('❌ Error fetching current data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching data' 
    });
  }
});

// GET endpoint - Frontend fetches historical data
app.get('/api/sensors/history', async (req, res) => {
  try {
    const deviceId = req.query.deviceId || 'NodeMCU_001';
    const limit = parseInt(req.query.limit) || 100;
    const hours = parseInt(req.query.hours) || 24;
    
    // Calculate time range
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    // Query MongoDB
    const readings = await Reading.find({
      deviceId,
      timestamp: { $gte: startTime }
    })
      .sort({ timestamp: -1 })
      .limit(limit);
    
    res.json({
      success: true,
      count: readings.length,
      hours: hours,
      data: readings.reverse() // Oldest to newest for charts
    });
  } catch (error) {
    console.error('❌ Error fetching history:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching history' 
    });
  }
});

// GET endpoint - Get statistics (aggregated data)
app.get('/api/sensors/stats', async (req, res) => {
  try {
    const deviceId = req.query.deviceId || 'NodeMCU_001';
    const hours = parseInt(req.query.hours) || 24;
    
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    // Aggregate statistics
    const stats = await Reading.aggregate([
      {
        $match: {
          deviceId,
          timestamp: { $gte: startTime }
        }
      },
      {
        $group: {
          _id: null,
          avgTemperature: { $avg: '$temperature' },
          minTemperature: { $min: '$temperature' },
          maxTemperature: { $max: '$temperature' },
          avgHumidity: { $avg: '$humidity' },
          minHumidity: { $min: '$humidity' },
          maxHumidity: { $max: '$humidity' },
          avgSoilMoisture: { $avg: '$soilMoisture' },
          minSoilMoisture: { $min: '$soilMoisture' },
          maxSoilMoisture: { $max: '$soilMoisture' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    if (stats.length === 0) {
      return res.json({
        success: true,
        message: 'No data available for the selected time range',
        stats: null
      });
    }
    
    res.json({
      success: true,
      hours: hours,
      stats: stats[0]
    });
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching statistics' 
    });
  }
});

// GET endpoint - Get alerts
app.get('/api/alerts', async (req, res) => {
  try {
    const deviceId = req.query.deviceId || 'NodeMCU_001';
    const acknowledged = req.query.acknowledged === 'true';
    const limit = parseInt(req.query.limit) || 50;
    
    const query = { deviceId };
    if (req.query.acknowledged !== undefined) {
      query.acknowledged = acknowledged;
    }
    
    const alerts = await Alert.find(query)
      .sort({ timestamp: -1 })
      .limit(limit);
    
    res.json({
      success: true,
      count: alerts.length,
      alerts
    });
  } catch (error) {
    console.error('❌ Error fetching alerts:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching alerts' 
    });
  }
});

// POST endpoint - Acknowledge alert
app.post('/api/alerts/:alertId/acknowledge', async (req, res) => {
  try {
    const { alertId } = req.params;
    const { acknowledgedBy } = req.body;
    
    const alert = await Alert.findByIdAndUpdate(
      alertId,
      {
        acknowledged: true,
        acknowledgedBy: acknowledgedBy || 'User',
        acknowledgedAt: new Date()
      },
      { new: true }
    );
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Alert acknowledged',
      alert
    });
  } catch (error) {
    console.error('❌ Error acknowledging alert:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error acknowledging alert' 
    });
  }
});

// GET endpoint - Get devices
app.get('/api/devices', async (req, res) => {
  try {
    const devices = await Device.find();
    
    res.json({
      success: true,
      count: devices.length,
      devices
    });
  } catch (error) {
    console.error('❌ Error fetching devices:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching devices' 
    });
  }
});

// PUT endpoint - Update device settings and thresholds
app.put('/api/devices/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { deviceName, location, thresholds, readingInterval, dataRetention, alertSound, emailNotifications } = req.body;
    
    const updateData = {};
    
    if (deviceName) updateData.deviceName = deviceName;
    if (location) {
      // Store location as both name and zone for compatibility
      updateData['location.name'] = location;
      updateData['location.zone'] = location;
    }
    
    // Update thresholds
    if (thresholds) {
      if (thresholds.temperatureMax !== undefined) {
        updateData['settings.thresholds.temperatureMax'] = parseFloat(thresholds.temperatureMax);
      }
      if (thresholds.temperatureMin !== undefined) {
        updateData['settings.thresholds.temperatureMin'] = parseFloat(thresholds.temperatureMin);
      }
      if (thresholds.humidityMax !== undefined) {
        updateData['settings.thresholds.humidityMax'] = parseFloat(thresholds.humidityMax);
      }
      if (thresholds.humidityMin !== undefined) {
        updateData['settings.thresholds.humidityMin'] = parseFloat(thresholds.humidityMin);
      }
      if (thresholds.soilMoistureMin !== undefined) {
        updateData['settings.thresholds.soilMoistureMin'] = parseFloat(thresholds.soilMoistureMin);
      }
    }
    
    // Update system settings
    if (readingInterval !== undefined) {
      updateData['settings.readingInterval'] = parseInt(readingInterval);
    }
    if (dataRetention !== undefined) {
      updateData['settings.dataRetention'] = parseInt(dataRetention);
    }
    if (alertSound !== undefined) {
      updateData['settings.alertSound'] = Boolean(alertSound);
    }
    if (emailNotifications !== undefined) {
      updateData['settings.emailNotifications'] = Boolean(emailNotifications);
    }
    
    const device = await Device.findOneAndUpdate(
      { deviceId },
      { $set: updateData },
      { new: true, upsert: true }
    );
    
    console.log(`✅ Device settings updated for ${deviceId}`);
    if (readingInterval !== undefined) {
      console.log(`   ⏱️  Reading interval: ${readingInterval} seconds`);
    }
    if (thresholds) {
      console.log(`   🌡️  Thresholds updated`);
    }
    if (alertSound !== undefined || emailNotifications !== undefined) {
      console.log(`   🔔 Notifications: Sound=${alertSound}, Email=${emailNotifications}`);
    }
    
    res.json({
      success: true,
      message: 'Settings updated successfully',
      device
    });
  } catch (error) {
    console.error('❌ Error updating device:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating device settings: ' + error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const totalReadings = await Reading.countDocuments();
    
    res.json({ 
      status: 'healthy',
      database: dbStatus,
      uptime: process.uptime(),
      timestamp: new Date(),
      totalReadings: totalReadings
    });
  } catch (error) {
    res.json({ 
      status: 'degraded',
      database: 'error',
      uptime: process.uptime(),
      timestamp: new Date(),
      error: error.message
    });
  }
});

// GET endpoint - LSTM Predictions
app.get('/api/sensors/predictions', async (req, res) => {
  try {
    const deviceId = req.query.deviceId || 'NodeMCU_001';
    const steps = parseInt(req.query.steps) || 6;
    
    // Fetch recent data (last 50 readings for better predictions)
    const recentData = await Reading.find({ deviceId })
      .sort({ timestamp: -1 })
      .limit(50)
      .select('temperature humidity soilMoisture timestamp -_id')
      .lean();
    
    if (recentData.length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Not enough historical data for predictions',
        needed: 10,
        available: recentData.length
      });
    }
    
    // Reverse to get oldest to newest
    const sortedData = recentData.reverse();
    
    // Call Python LSTM predictor
    const python = spawn('python', ['lstm_predictor.py', 'predict', steps.toString()]);
    
    let dataString = '';
    let errorString = '';
    
    // Send data to Python script
    python.stdin.write(JSON.stringify(sortedData));
    python.stdin.end();
    
    // Collect output
    python.stdout.on('data', (data) => {
      dataString += data.toString();
    });
    
    python.stderr.on('data', (data) => {
      errorString += data.toString();
    });
    
    // Handle completion
    python.on('close', (code) => {
      if (code !== 0) {
        console.error('❌ LSTM Prediction Error:', errorString);
        return res.status(500).json({
          success: false,
          error: 'Prediction failed',
          details: errorString,
          fallback: 'Using simple linear prediction',
          code: code
        });
      }
      
      try {
        const result = JSON.parse(dataString);
        
        if (result.error) {
          return res.status(500).json({
            success: false,
            error: result.error,
            details: result.details || result.traceback
          });
        }
        
        console.log(`✅ LSTM Predictions generated: ${result.predictions.length} steps`);
        res.json(result);
        
      } catch (parseError) {
        console.error('❌ Error parsing LSTM output:', parseError);
        res.status(500).json({
          success: false,
          error: 'Failed to parse prediction results',
          details: dataString
        });
      }
    });
    
  } catch (error) {
    console.error('❌ Error in prediction endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating predictions',
      error: error.message
    });
  }
});

// Root endpoint - only in development mode (production serves frontend)
if (process.env.NODE_ENV !== 'production') {
  app.get('/', (req, res) => {
    res.json({
      message: 'IoT Sensor Backend API with MongoDB Atlas',
      version: '2.0.0',
      database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
      endpoints: {
        'POST /api/sensors/data': 'NodeMCU posts sensor data',
        'GET /api/sensors/current': 'Get latest sensor readings',
        'GET /api/sensors/history': 'Get historical data (params: deviceId, hours, limit)',
        'GET /api/sensors/stats': 'Get aggregated statistics (params: deviceId, hours)',
        'GET /api/sensors/predictions': 'Get LSTM predictions (params: deviceId, steps)',
        'GET /api/alerts': 'Get alerts (params: deviceId, acknowledged, limit)',
        'POST /api/alerts/:alertId/acknowledge': 'Acknowledge an alert',
        'GET /api/devices': 'Get all devices',
        'PUT /api/devices/:deviceId': 'Update device settings and thresholds',
        'GET /api/health': 'Server health check'
      }
    });
  });
}

// Add a simple root health check for Railway
app.get('/healthz', (req, res) => {
  console.log('💚 Health check received from:', req.ip);
  res.status(200).send('OK');
});

// Serve static files from dist folder in production
if (process.env.NODE_ENV === 'production') {
  const distPath = join(__dirname, 'dist');
  const indexPath = join(distPath, 'index.html');
  
  // Check if dist folder exists
  const fs = await import('fs');
  const distExists = fs.existsSync(distPath);
  const indexExists = fs.existsSync(indexPath);
  
  console.log('📁 Dist path:', distPath);
  console.log('📁 Dist folder exists:', distExists);
  console.log('📄 Index.html exists:', indexExists);
  
  if (distExists && indexExists) {
    // Serve static files (JS, CSS, images, etc.) with proper configuration
    app.use(express.static(distPath, {
      index: false,  // Don't automatically serve index.html yet
      fallthrough: true  // Let other middleware handle if file not found
    }));
    console.log('✅ Static file serving enabled');
    
    // Serve index.html for all non-API routes (SPA support)
    app.use((req, res, next) => {
      // Skip API and health check routes
      if (req.path.startsWith('/api') || req.path.startsWith('/healthz')) {
        console.log(`⏭️  Skipping SPA for: ${req.path}`);
        return next();
      }
      
      // Serve index.html for all other routes
      console.log(`📄 Serving index.html for: ${req.path}`);
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error('❌ Error serving index.html:', err);
          res.status(500).send('Application error');
        }
      });
    });
    console.log('✅ SPA routing enabled');
  } else {
    console.error('❌ WARNING: dist folder or index.html not found! Frontend will not be served.');
  }
}

// Start server - Railway requires listening on PORT env variable
console.log('🔧 Starting server setup...');
console.log('🔧 PORT:', PORT);
console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
console.log('🔧 Dist path:', join(__dirname, 'dist'));

const server = app.listen(PORT, () => {
  const address = server.address();
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   🚀 Sensor Backend Server Started!       ║');
  console.log('║      (MongoDB Atlas Integrated)            ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log(`📡 Server listening on port: ${PORT}`);
  console.log(`📡 Actual address:`, JSON.stringify(address));
  console.log(`📊 API: /api/sensors/current`);
  console.log(`💚 Health check: /api/health`);
  console.log(`💚 Simple health: /healthz`);
  console.log(`🗄️  Database: ${MONGODB_URI ? 'Connected' : 'NOT CONFIGURED'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('\n⏳ Ready to receive requests...\n');
  
  // Log server is ready
  console.log('✅ Server is READY and LISTENING');
});

console.log('🔧 Listen called, waiting for callback...');

// Error handling for server
server.on('error', (error) => {
  console.error('❌ Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  }
  process.exit(1);
});

// Handle shutdown gracefully
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Shutting down server...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});
