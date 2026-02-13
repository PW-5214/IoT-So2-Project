import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Activity, Wifi, WifiOff, Thermometer, Droplets, Sprout, Clock, MapPin, Cpu, Signal } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Monitoring() {
  const API_URL = "/api/sensors";
  
  const [sensorData, setSensorData] = useState({
    temperature: 0,
    humidity: 0,
    soilMoisture: 0,
    timestamp: new Date()
  });
  
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState("--:--:--");
  const [dataAge, setDataAge] = useState(0);
  
  // Fetch sensor data
  const fetchSensorData = async () => {
    try {
      const response = await fetch(`${API_URL}/current`);
      if (response.ok) {
        const data = await response.json();
        setSensorData(data);
        setIsConnected(true);
        
        const now = new Date();
        setLastUpdate(now.toLocaleTimeString());
        
        // Calculate data age
        if (data.timestamp) {
          const age = Math.floor((now - new Date(data.timestamp)) / 1000);
          setDataAge(age);
        }
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Error fetching sensor data:', error);
      setIsConnected(false);
    }
  };
  
  useEffect(() => {
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 2000); // Update every 2 seconds
    return () => clearInterval(interval);
  }, []);
  
  // Status helpers
  const getStatus = (value, min, max) => {
    if (value < min) return "low";
    if (value > max) return "high";
    return "normal";
  };
  
  const getStatusColor = (status) => {
    switch(status) {
      case "low": return "text-blue-500 bg-blue-500/10 border-blue-500/30";
      case "high": return "text-red-500 bg-red-500/10 border-red-500/30";
      default: return "text-green-500 bg-green-500/10 border-green-500/30";
    }
  };
  
  const tempStatus = getStatus(sensorData.temperature, 20, 35);
  const humidityStatus = getStatus(sensorData.humidity, 30, 70);
  const soilStatus = getStatus(sensorData.soilMoisture, 30, 70);
  
  return (
    <Layout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 bg-background">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1 flex items-center gap-3">
              <Activity className="w-8 h-8 text-accent" />
              Live Monitoring
              <span className="px-3 py-1 text-xs font-bold bg-red-500 text-white rounded-full animate-pulse">
                REAL-TIME
              </span>
            </h1>
            <p className="text-muted-foreground text-sm">
              Real-time sensor data from NodeMCU ESP8266 • Updates every 2 seconds
            </p>
          </div>
        </div>
        
        {/* Connection Status Banner */}
        <div className={cn(
          "rounded-lg border-2 p-4 transition-all",
          isConnected 
            ? "bg-green-500/10 border-green-500/30" 
            : "bg-red-500/10 border-red-500/30"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isConnected ? (
                <>
                  <Wifi className="w-6 h-6 text-green-500" />
                  <div>
                    <p className="font-bold text-green-500">Connected to Sensor Network</p>
                    <p className="text-xs text-muted-foreground">Last update: {lastUpdate} • Data age: {dataAge}s</p>
                  </div>
                </>
              ) : (
                <>
                  <WifiOff className="w-6 h-6 text-red-500" />
                  <div>
                    <p className="font-bold text-red-500">Connection Lost</p>
                    <p className="text-xs text-muted-foreground">Attempting to reconnect...</p>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Device ID</p>
                <p className="text-sm font-bold text-foreground">NodeMCU_001</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Signal Strength</p>
                <div className="flex items-center gap-1">
                  <Signal className="w-4 h-4 text-green-500" />
                  <p className="text-sm font-bold text-green-500">Excellent</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Live Sensor Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Temperature Card */}
          <div className="bg-gradient-to-br from-red-500/5 to-orange-500/5 rounded-xl border-2 border-red-500/20 p-6 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-red-500/10 rounded-lg">
                  <Thermometer className="w-6 h-6 text-red-500" />
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-bold text-red-500">LIVE</span>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Temperature</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-5xl font-bold text-foreground">
                  {sensorData.temperature.toFixed(1)}
                </span>
                <span className="text-2xl font-semibold text-muted-foreground">°C</span>
              </div>
              <div className={cn(
                "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border-2",
                getStatusColor(tempStatus)
              )}>
                {tempStatus.toUpperCase()}
              </div>
              <div className="mt-4 pt-4 border-t border-border/50">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Normal Range</span>
                  <span className="font-semibold text-foreground">20°C - 35°C</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Humidity Card */}
          <div className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-xl border-2 border-blue-500/20 p-6 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Droplets className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-bold text-blue-500">LIVE</span>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Humidity</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-5xl font-bold text-foreground">
                  {sensorData.humidity.toFixed(1)}
                </span>
                <span className="text-2xl font-semibold text-muted-foreground">%</span>
              </div>
              <div className={cn(
                "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border-2",
                getStatusColor(humidityStatus)
              )}>
                {humidityStatus.toUpperCase()}
              </div>
              <div className="mt-4 pt-4 border-t border-border/50">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Normal Range</span>
                  <span className="font-semibold text-foreground">30% - 70%</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Soil Moisture Card */}
          <div className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-xl border-2 border-green-500/20 p-6 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <Sprout className="w-6 h-6 text-green-500" />
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-bold text-green-500">LIVE</span>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Soil Moisture</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-5xl font-bold text-foreground">
                  {sensorData.soilMoisture.toFixed(0)}
                </span>
                <span className="text-2xl font-semibold text-muted-foreground">%</span>
              </div>
              <div className={cn(
                "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border-2",
                getStatusColor(soilStatus)
              )}>
                {soilStatus.toUpperCase()}
              </div>
              <div className="mt-4 pt-4 border-t border-border/50">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Normal Range</span>
                  <span className="font-semibold text-foreground">30% - 70%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Device Information */}
        <div className="bg-card rounded-xl border border-border/60 p-6 shadow-md">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-accent" />
            Device Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">Device Type</p>
              <p className="text-sm font-bold text-foreground">NodeMCU ESP8266</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">Location</p>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <p className="text-sm font-bold text-foreground">Industrial Zone A</p>
              </div>
            </div>
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">Uptime</p>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <p className="text-sm font-bold text-foreground">
                  {dataAge < 60 ? `${dataAge}s` : `${Math.floor(dataAge / 60)}m ${dataAge % 60}s`}
                </p>
              </div>
            </div>
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">Firmware</p>
              <p className="text-sm font-bold text-foreground">v1.0.0</p>
            </div>
          </div>
        </div>
        
        {/* System Health */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-lg border border-border/60 p-4">
            <p className="text-xs text-muted-foreground mb-2">Data Quality</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: '98%' }}></div>
              </div>
              <span className="text-sm font-bold text-green-500">98%</span>
            </div>
          </div>
          <div className="bg-card rounded-lg border border-border/60 p-4">
            <p className="text-xs text-muted-foreground mb-2">Update Frequency</p>
            <p className="text-2xl font-bold text-foreground">5s</p>
          </div>
          <div className="bg-card rounded-lg border border-border/60 p-4">
            <p className="text-xs text-muted-foreground mb-2">Connection Status</p>
            <p className="text-2xl font-bold text-green-500">Stable</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
