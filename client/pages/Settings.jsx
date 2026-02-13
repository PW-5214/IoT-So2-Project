import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Settings as SettingsIcon, Bell, Database, Wifi, User, Shield, Save, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Settings() {
  const API_URL = "/api";
  
  const [settings, setSettings] = useState({
    // Alert Thresholds
    temperatureMax: 35,
    temperatureMin: 20,
    humidityMax: 70,
    humidityMin: 30,
    soilMoistureMin: 30,
    
    // System Settings
    readingInterval: 5,
    dataRetention: 30,
    alertSound: true,
    emailNotifications: false,
    
    // Device Settings
    deviceName: "NodeMCU_001",
    deviceId: "NodeMCU_001",
    location: "Unknown"
  });
  
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Load device settings from MongoDB
  const loadDeviceSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/devices`);
      if (response.ok) {
        const data = await response.json();
        if (data.devices && data.devices.length > 0) {
          const device = data.devices[0];
          setSettings(prev => ({
            ...prev,
            deviceId: device.deviceId || "NodeMCU_001",
            deviceName: device.deviceName || "NodeMCU_001",
            location: device.location?.name || device.location?.zone || "Unknown",
            temperatureMax: device.settings?.thresholds?.temperatureMax || 35,
            temperatureMin: device.settings?.thresholds?.temperatureMin || 20,
            humidityMax: device.settings?.thresholds?.humidityMax || 70,
            humidityMin: device.settings?.thresholds?.humidityMin || 30,
            soilMoistureMin: device.settings?.thresholds?.soilMoistureMin || 30,
            readingInterval: device.settings?.readingInterval || 5,
            dataRetention: device.settings?.dataRetention || 30,
            alertSound: device.settings?.alertSound !== undefined ? device.settings.alertSound : true,
            emailNotifications: device.settings?.emailNotifications || false
          }));
        }
      } else {
        throw new Error('Failed to load settings from server');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setError('Failed to load settings. Using default values.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadDeviceSettings();
  }, []);
  
  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
    setError(null);
  };
  
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/devices/${settings.deviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceName: settings.deviceName,
          location: settings.location,
          thresholds: {
            temperatureMax: parseFloat(settings.temperatureMax),
            temperatureMin: parseFloat(settings.temperatureMin),
            humidityMax: parseFloat(settings.humidityMax),
            humidityMin: parseFloat(settings.humidityMin),
            soilMoistureMin: parseFloat(settings.soilMoistureMin)
          },
          readingInterval: parseInt(settings.readingInterval),
          dataRetention: parseInt(settings.dataRetention),
          alertSound: settings.alertSound,
          emailNotifications: settings.emailNotifications
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        setSaved(true);
        console.log('✅ Settings saved successfully:', result);
        
        // Reload settings to confirm
        await loadDeviceSettings();
        
        // Reset saved state after 3 seconds
        setTimeout(() => setSaved(false), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setError(`Failed to save: ${error.message}`);
      setTimeout(() => setError(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 bg-background">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1 flex items-center gap-3">
              <SettingsIcon className="w-8 h-8 text-accent" />
              System Settings
            </h1>
            <p className="text-muted-foreground text-sm">
              Configure thresholds, alerts, and system preferences
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className={cn(
              "px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2",
              saving || loading
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : saved
                ? "bg-green-600 hover:bg-green-700 text-white shadow-md"
                : "bg-accent hover:bg-accent/80 text-white shadow-md hover:shadow-lg"
            )}
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <Save className="w-4 h-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
              <p className="text-blue-800 dark:text-blue-200 font-medium">Loading settings...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="text-red-800 dark:text-red-200 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {saved && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Save className="w-5 h-5 text-green-600 dark:text-green-400" />
              <p className="text-green-800 dark:text-green-200 font-medium">Settings saved successfully!</p>
            </div>
          </div>
        )}
        
        {/* Alert Thresholds */}
        <div className="bg-card rounded-xl border border-border/60 p-6 shadow-md">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-accent" />
            Alert Thresholds
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Set threshold values for automatic alert generation
          </p>
          
          <div className="space-y-6">
            {/* Temperature */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Maximum Temperature (°C)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="25"
                    max="50"
                    value={settings.temperatureMax}
                    onChange={(e) => handleChange('temperatureMax', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    value={settings.temperatureMax}
                    onChange={(e) => handleChange('temperatureMax', parseInt(e.target.value))}
                    className="w-20 px-3 py-2 bg-background border border-border rounded-lg text-foreground font-semibold"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Alert when temperature exceeds this value</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Minimum Temperature (°C)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="25"
                    value={settings.temperatureMin}
                    onChange={(e) => handleChange('temperatureMin', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    value={settings.temperatureMin}
                    onChange={(e) => handleChange('temperatureMin', parseInt(e.target.value))}
                    className="w-20 px-3 py-2 bg-background border border-border rounded-lg text-foreground font-semibold"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Alert when temperature falls below this value</p>
              </div>
            </div>
            
            {/* Humidity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Maximum Humidity (%)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="60"
                    max="100"
                    value={settings.humidityMax}
                    onChange={(e) => handleChange('humidityMax', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    value={settings.humidityMax}
                    onChange={(e) => handleChange('humidityMax', parseInt(e.target.value))}
                    className="w-20 px-3 py-2 bg-background border border-border rounded-lg text-foreground font-semibold"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Alert when humidity exceeds this value</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Minimum Humidity (%)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={settings.humidityMin}
                    onChange={(e) => handleChange('humidityMin', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    value={settings.humidityMin}
                    onChange={(e) => handleChange('humidityMin', parseInt(e.target.value))}
                    className="w-20 px-3 py-2 bg-background border border-border rounded-lg text-foreground font-semibold"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Alert when humidity falls below this value</p>
              </div>
            </div>
            
            {/* Soil Moisture */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Minimum Soil Moisture (%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={settings.soilMoistureMin}
                  onChange={(e) => handleChange('soilMoistureMin', parseInt(e.target.value))}
                  className="flex-1"
                />
                <input
                  type="number"
                  value={settings.soilMoistureMin}
                  onChange={(e) => handleChange('soilMoistureMin', parseInt(e.target.value))}
                  className="w-20 px-3 py-2 bg-background border border-border rounded-lg text-foreground font-semibold"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Alert when soil moisture falls below this value</p>
            </div>
          </div>
        </div>
        
        {/* System Settings */}
        <div className="bg-card rounded-xl border border-border/60 p-6 shadow-md">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-accent" />
            System Configuration
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                ⏱️ Reading Interval (seconds)
              </label>
              <select
                value={settings.readingInterval}
                onChange={(e) => handleChange('readingInterval', parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground font-semibold"
              >
                <option value={3}>3 seconds (High Frequency)</option>
                <option value={5}>5 seconds (Default - Recommended)</option>
                <option value={10}>10 seconds</option>
                <option value={15}>15 seconds</option>
                <option value={30}>30 seconds</option>
                <option value={60}>60 seconds (Low Frequency)</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                ⚡ Controls how often sensors collect and send data
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                💡 Changes apply automatically to NodeMCU hardware (within 10 seconds)
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Data Retention (days)
              </label>
              <select
                value={settings.dataRetention}
                onChange={(e) => handleChange('dataRetention', parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground font-semibold"
              >
                <option value={7}>7 days</option>
                <option value={30}>30 days (Default)</option>
                <option value={90}>90 days</option>
                <option value={365}>1 year</option>
                <option value={0}>Unlimited</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1">How long to keep historical data in MongoDB</p>
            </div>
            
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">Alert Sound</p>
                  <p className="text-xs text-muted-foreground">Play sound when alert is triggered</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.alertSound}
                    onChange={(e) => handleChange('alertSound', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-accent transition-all peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Email Notifications</p>
                <p className="text-xs text-muted-foreground">Send email alerts for critical events</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-accent transition-all peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
          </div>
        </div>
        
        {/* Device Settings */}
        <div className="bg-card rounded-xl border border-border/60 p-6 shadow-md">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Wifi className="w-5 h-5 text-accent" />
            Device Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Device Name
              </label>
              <input
                type="text"
                value={settings.deviceName}
                onChange={(e) => handleChange('deviceName', e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground font-semibold"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Location
              </label>
              <input
                type="text"
                value={settings.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground font-semibold"
              />
            </div>
          </div>
        </div>
        
        {/* About */}
        <div className="bg-gradient-to-r from-accent/10 to-purple-500/10 rounded-xl border border-accent/30 p-6">
          <div className="flex items-start gap-4">
            <Shield className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-foreground mb-2">IoT Sensor Monitoring System</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Version 1.0.0 • Built with React, Node.js, MongoDB Atlas, and NodeMCU ESP8266
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-card/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Frontend</p>
                  <p className="font-semibold text-foreground">React + Vite</p>
                </div>
                <div className="bg-card/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Backend</p>
                  <p className="font-semibold text-foreground">Node.js + Express</p>
                </div>
                <div className="bg-card/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Database</p>
                  <p className="font-semibold text-foreground">MongoDB Atlas</p>
                </div>
                <div className="bg-card/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Hardware</p>
                  <p className="font-semibold text-foreground">NodeMCU ESP8266</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
