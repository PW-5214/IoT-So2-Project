import mongoose from 'mongoose';

const readingSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    default: 'NodeMCU_001',
    index: true
  },
  temperature: {
    type: Number,
    required: true,
    min: -50,
    max: 100
  },
  humidity: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  soilMoisture: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  location: {
    type: String,
    default: 'Zone_A'
  },
  rssi: {
    type: Number,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Compound index for efficient queries
readingSchema.index({ deviceId: 1, timestamp: -1 });

// TTL index to auto-delete data older than 90 days (optional)
// readingSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

const Reading = mongoose.model('Reading', readingSchema);

export default Reading;
