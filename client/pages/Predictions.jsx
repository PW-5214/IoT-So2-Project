import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { TrendingUp, Activity, Zap, Target, Brain, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

export default function Predictions() {
  const API_URL = "/api/sensors";
  
  const [historicalData, setHistoricalData] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [currentValue, setCurrentValue] = useState({ temperature: 0, humidity: 0, soilMoisture: 0 });
  const [modelInfo, setModelInfo] = useState({ type: 'LSTM', status: 'loading' });
  const [useLSTM, setUseLSTM] = useState(true);
  
  // Fetch LSTM predictions from backend
  const fetchLSTMPredictions = async () => {
    try {
      const response = await fetch(`${API_URL}/predictions?steps=6`);
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.predictions) {
          const formatted = data.predictions.map(pred => ({
            time: new Date(pred.timestamp).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            temperature: pred.temperature,
            humidity: pred.humidity,
            soilMoisture: pred.soilMoisture,
            confidence: pred.confidence,
            isPrediction: true
          }));
          
          setPredictions(formatted);
          setModelInfo({ 
            type: 'LSTM Neural Network', 
            status: 'active',
            sequenceLength: data.sequence_length
          });
          return true;
        } else {
          console.warn('LSTM prediction failed, falling back to linear model:', data.error);
          setModelInfo({ 
            type: 'Linear Trend (Fallback)', 
            status: 'fallback',
            error: data.error 
          });
          return false;
        }
      }
      return false;
    } catch (error) {
      console.error('Error fetching LSTM predictions:', error);
      setModelInfo({ 
        type: 'Linear Trend (Fallback)', 
        status: 'error',
        error: error.message 
      });
      return false;
    }
  };
  
  // Fetch historical data for predictions
  const fetchData = async () => {
    try {
      const response = await fetch(`${API_URL}/history?hours=6&limit=30`);
      if (response.ok) {
        const data = await response.json();
        
        // Handle both API response formats (data.data or data.readings)
        const readings = data.data || data.readings || [];
        
        // Format data
        const formatted = readings.map(reading => ({
          time: new Date(reading.timestamp).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          temperature: reading.temperature,
          humidity: reading.humidity,
          soilMoisture: reading.soilMoisture
        })).reverse();
        
        setHistoricalData(formatted);
        
        // Get current values
        if (readings.length > 0) {
          const latest = readings[0];
          setCurrentValue({
            temperature: latest.temperature,
            humidity: latest.humidity,
            soilMoisture: latest.soilMoisture
          });
        }
        
        // Try LSTM predictions first, fallback to linear if it fails
        if (useLSTM) {
          const lstmSuccess = await fetchLSTMPredictions();
          if (!lstmSuccess) {
            generatePredictions(formatted);
          }
        } else {
          generatePredictions(formatted);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  
  // Simple prediction algorithm
  const generatePredictions = (data) => {
    if (data.length < 5) return;
    
    // Calculate trend (simple linear regression)
    const recent = data.slice(-10);
    const tempTrend = (recent[recent.length - 1].temperature - recent[0].temperature) / recent.length;
    const humidityTrend = (recent[recent.length - 1].humidity - recent[0].humidity) / recent.length;
    const soilTrend = (recent[recent.length - 1].soilMoisture - recent[0].soilMoisture) / recent.length;
    
    // Generate next 6 predictions (30 min intervals)
    const predictionData = [];
    const now = new Date();
    
    for (let i = 1; i <= 6; i++) {
      const futureTime = new Date(now.getTime() + i * 30 * 60000);
      predictionData.push({
        time: futureTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        temperature: Math.max(0, Math.min(50, recent[recent.length - 1].temperature + (tempTrend * i))),
        humidity: Math.max(0, Math.min(100, recent[recent.length - 1].humidity + (humidityTrend * i))),
        soilMoisture: Math.max(0, Math.min(100, recent[recent.length - 1].soilMoisture + (soilTrend * i))),
        isPrediction: true
      });
    }
    
    setPredictions(predictionData);
  };
  
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);
  
  // Combine historical and prediction data
  const combinedData = [...historicalData, ...predictions];
  
  // Calculate confidence
  const getConfidence = (index) => {
    // If predictions have confidence values from LSTM, use those
    if (predictions[index]?.confidence) {
      return predictions[index].confidence;
    }
    // Otherwise, use simple decreasing confidence
    return Math.max(50, 95 - (index * 7)); // Decreasing confidence over time
  };
  
  return (
    <Layout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 bg-background">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1 flex items-center gap-3">
            <Brain className="w-8 h-8 text-accent" />
            Predictive Analytics
            <span className="px-3 py-1 text-xs font-bold bg-purple-500 text-white rounded-full">
              AI-POWERED
            </span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Advanced forecasting using historical trends • Next 3 hours prediction
          </p>
        </div>
        
        {/* Prediction Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border-2 border-purple-500/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Target className="w-5 h-5 text-purple-500" />
              </div>
              <h3 className="font-bold text-foreground">Temperature Forecast</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Current</p>
                <p className="text-2xl font-bold text-foreground">{currentValue.temperature.toFixed(1)}°C</p>
              </div>
              {predictions.length > 0 && (
                <>
                  <div>
                    <p className="text-xs text-muted-foreground">+1 Hour</p>
                    <p className="text-lg font-semibold text-purple-500">{predictions[1]?.temperature.toFixed(1)}°C</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">+3 Hours</p>
                    <p className="text-lg font-semibold text-purple-500">{predictions[5]?.temperature.toFixed(1)}°C</p>
                    <p className="text-xs text-muted-foreground mt-1">Confidence: {getConfidence(5)}%</p>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl border-2 border-blue-500/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Activity className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="font-bold text-foreground">Humidity Forecast</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Current</p>
                <p className="text-2xl font-bold text-foreground">{currentValue.humidity.toFixed(1)}%</p>
              </div>
              {predictions.length > 0 && (
                <>
                  <div>
                    <p className="text-xs text-muted-foreground">+1 Hour</p>
                    <p className="text-lg font-semibold text-blue-500">{predictions[1]?.humidity.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">+3 Hours</p>
                    <p className="text-lg font-semibold text-blue-500">{predictions[5]?.humidity.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground mt-1">Confidence: {getConfidence(5)}%</p>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border-2 border-green-500/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="font-bold text-foreground">Soil Moisture Forecast</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Current</p>
                <p className="text-2xl font-bold text-foreground">{currentValue.soilMoisture.toFixed(0)}%</p>
              </div>
              {predictions.length > 0 && (
                <>
                  <div>
                    <p className="text-xs text-muted-foreground">+1 Hour</p>
                    <p className="text-lg font-semibold text-green-500">{predictions[1]?.soilMoisture.toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">+3 Hours</p>
                    <p className="text-lg font-semibold text-green-500">{predictions[5]?.soilMoisture.toFixed(0)}%</p>
                    <p className="text-xs text-muted-foreground mt-1">Confidence: {getConfidence(5)}%</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Prediction Charts */}
        <div className="bg-card rounded-xl border border-border/60 p-6 shadow-md">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent" />
            Predictive Model Visualization
          </h2>
          {combinedData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={combinedData}>
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="soilGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis 
                  dataKey="time" 
                  tick={{ fill: '#888', fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fill: '#888', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.9)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    padding: '10px'
                  }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold', marginBottom: '5px' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  dot={{ fill: '#ef4444', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Temperature (°C)"
                />
                <Line 
                  type="monotone" 
                  dataKey="humidity" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Humidity (%)"
                />
                <Line 
                  type="monotone" 
                  dataKey="soilMoisture" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Soil Moisture (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[400px] text-muted-foreground">
              <div className="text-center">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Loading prediction data...</p>
              </div>
            </div>
          )}
          <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-foreground rounded"></div>
              <span>Historical Data (Solid Line)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-purple-500 rounded"></div>
              <span>Predicted Values</span>
            </div>
          </div>
        </div>
        
        {/* Model Information */}
        <div className={cn(
          "rounded-xl border p-6",
          modelInfo.status === 'active' 
            ? "bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30" 
            : "bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30"
        )}>
          <div className="flex items-start gap-4">
            <AlertCircle className={cn(
              "w-6 h-6 flex-shrink-0 mt-1",
              modelInfo.status === 'active' ? "text-purple-500" : "text-yellow-500"
            )} />
            <div className="flex-1">
              <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                About This Prediction Model
                {modelInfo.status === 'active' && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-purple-500 text-white rounded-full">
                    AI-POWERED
                  </span>
                )}
                {modelInfo.status === 'fallback' && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-yellow-500 text-black rounded-full">
                    FALLBACK
                  </span>
                )}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                {modelInfo.status === 'active' 
                  ? "This forecasting system uses a Long Short-Term Memory (LSTM) neural network trained on your historical sensor data to predict future values with high accuracy."
                  : "Advanced LSTM predictions are currently unavailable. Using linear trend analysis as a fallback method."
                }
                {modelInfo.error && (
                  <span className="block mt-2 text-yellow-600 dark:text-yellow-400 text-xs">
                    Error: {modelInfo.error}
                  </span>
                )}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-card/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Algorithm</p>
                  <p className="font-semibold text-foreground">{modelInfo.type}</p>
                </div>
                <div className="bg-card/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Data Window</p>
                  <p className="font-semibold text-foreground">
                    {modelInfo.sequenceLength ? `Last ${modelInfo.sequenceLength} Readings` : 'Last 30 Readings'}
                  </p>
                </div>
                <div className="bg-card/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Forecast Range</p>
                  <p className="font-semibold text-foreground">Next 30 Minutes</p>
                </div>
              </div>
              {modelInfo.status === 'active' && (
                <div className="mt-3 text-xs text-muted-foreground">
                  <strong>How it works:</strong> The LSTM model analyzes patterns in temperature, humidity, and soil moisture over time,
                  learning complex temporal relationships to make accurate predictions. Confidence decreases for longer-term forecasts.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
