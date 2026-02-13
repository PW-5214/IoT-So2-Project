import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  deviceName: {
    type: String,
    required: true,
    default: 'IoT Sensor Device'
  },
  location: {
    zone: {
      type: String,
      default: 'A'
    },
    name: {
      type: String,
      default: 'Unknown'
    },
    description: {
      type: String,
      default: 'Field sensor location'
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  installDate: {
    type: Date,
    default: Date.now
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  settings: {
    readingInterval: {
      type: Number,
      default: 5 // seconds
    },
    dataRetention: {
      type: Number,
      default: 30 // days
    },
    alertSound: {
      type: Boolean,
      default: true
    },
    emailNotifications: {
      type: Boolean,
      default: false
    },
    thresholds: {
      temperatureMax: {
        type: Number,
        default: 35
      },
      temperatureMin: {
        type: Number,
        default: 10
      },
      humidityMax: {
        type: Number,
        default: 80
      },
      humidityMin: {
        type: Number,
        default: 30
      },
      soilMoistureMin: {
        type: Number,
        default: 30
      }
    }
  },
  firmwareVersion: {
    type: String,
    default: '1.0.0'
  },
  ipAddress: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

const Device = mongoose.model('Device', deviceSchema);

export default Device;
