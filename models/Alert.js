import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    index: true
  },
  alertType: {
    type: String,
    required: true,
    enum: [
      'HIGH_TEMPERATURE',
      'LOW_TEMPERATURE',
      'HIGH_HUMIDITY',
      'LOW_HUMIDITY',
      'LOW_SOIL_MOISTURE',
      'HIGH_SOIL_MOISTURE',
      'DEVICE_OFFLINE',
      'DEVICE_BACK_ONLINE'
    ]
  },
  message: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  threshold: {
    type: Number,
    required: true
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  acknowledged: {
    type: Boolean,
    default: false
  },
  acknowledgedBy: {
    type: String,
    default: null
  },
  acknowledgedAt: {
    type: Date,
    default: null
  },
  autoResolved: {
    type: Boolean,
    default: false
  },
  resolvedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
alertSchema.index({ deviceId: 1, timestamp: -1 });
alertSchema.index({ acknowledged: 1, severity: 1 });

const Alert = mongoose.model('Alert', alertSchema);

export default Alert;
