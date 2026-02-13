/*
 * NodeMCU Sensor Data Logger
 * --------------------------
 * Reads DHT11 (Temperature & Humidity) and Soil Moisture Sensor
 * Sends data to backend server via HTTP POST every 5 seconds
 * 
 * Hardware Connections:
 * - DHT11: VCC→3.3V, GND→GND, DATA→D4
 * - Soil Moisture: VCC→3.3V, GND→GND, A0→A0
 * 
 * Required Libraries:
 * - ESP8266WiFi (built-in)
 * - ESP8266HTTPClient (built-in)
 * - DHT sensor library (Adafruit)
 * - Adafruit Unified Sensor
 * - ArduinoJson
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <DHT.h>
#include <ArduinoJson.h>

// ============ CONFIGURATION - CHANGE THESE! ============
const char* ssid = "VPKBIET BFL Incubation Centre";     // ⚠️ MUST be 2.4 GHz network!
const char* password = "";                                // Open network (no password)
const char* serverUrl = "http://172.16.14.151:3001/api/sensors/data";  // ✅ Your PC IP Address
const char* settingsUrl = "http://172.16.14.151:3001/api/devices";     // Settings endpoint
// =======================================================

// Pin Definitions
#define DHTPIN D4                // DHT11 data pin connected to D4 (GPIO2)
#define DHTTYPE DHT11            // DHT sensor type
#define SOIL_MOISTURE_PIN A0     // Soil moisture sensor on A0

// Create DHT object
DHT dht(DHTPIN, DHTTYPE);
WiFiClient wifiClient;

// Variables
unsigned long lastSendTime = 0;
unsigned long lastSettingsCheck = 0;
unsigned long sendInterval = 5000;  // Send data every 5 seconds (will be updated from backend)
const unsigned long settingsCheckInterval = 10000;  // Check settings every 10 seconds
int failedAttempts = 0;

void setup() {
  // Initialize Serial Monitor
  Serial.begin(115200);
  delay(100);
  Serial.println("\n\n");
  Serial.println("╔════════════════════════════════════════╗");
  Serial.println("║   NodeMCU Sensor Logger v1.0          ║");
  Serial.println("╚════════════════════════════════════════╝");
  
  // Initialize DHT sensor
  dht.begin();
  Serial.println("✅ DHT11 sensor initialized");
  
  // Connect to WiFi
  connectToWiFi();
  
  // Fetch initial settings from backend
  Serial.println("📋 Fetching settings from backend...");
  fetchSettingsFromBackend();
  Serial.print("⏱️  Data collection interval: ");
  Serial.print(sendInterval / 1000);
  Serial.println(" seconds\n");
}

void connectToWiFi() {
  Serial.println("\n🌐 Connecting to WiFi...");
  Serial.print("   SSID: ");
  Serial.println(ssid);
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  Serial.println();
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("✅ WiFi Connected Successfully!");
    Serial.print("📡 IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("📶 Signal Strength: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
    Serial.print("🎯 Backend URL: ");
    Serial.println(serverUrl);
    Serial.println();
  } else {
    Serial.println("❌ WiFi Connection Failed!");
    Serial.println("   Please check:");
    Serial.println("   - WiFi name and password are correct");
    Serial.println("   - Router is powered on");
    Serial.println("   - Using 2.4GHz WiFi (not 5GHz)");
    Serial.println();
  }
}

void loop() {
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️  WiFi disconnected! Reconnecting...");
    connectToWiFi();
    delay(1000);
    return;
  }
  
  // Check for settings updates periodically
  if (millis() - lastSettingsCheck >= settingsCheckInterval) {
    lastSettingsCheck = millis();
    fetchSettingsFromBackend();
  }
  
  // Send data at interval
  if (millis() - lastSendTime >= sendInterval) {
    lastSendTime = millis();
    readAndSendSensorData();
  }
  
  // Small delay to prevent watchdog timer issues
  delay(10);
}

void fetchSettingsFromBackend() {
  if (WiFi.status() != WL_CONNECTED) {
    return;
  }
  
  HTTPClient http;
  http.begin(wifiClient, settingsUrl);
  http.setTimeout(5000);
  
  int httpCode = http.GET();
  
  if (httpCode == 200) {
    String payload = http.getString();
    
    // Parse JSON to get reading interval
    StaticJsonDocument<1024> doc;
    DeserializationError error = deserializeJson(doc, payload);
    
    if (!error && doc["devices"].size() > 0) {
      int newInterval = doc["devices"][0]["settings"]["readingInterval"] | 5;
      unsigned long newIntervalMs = newInterval * 1000;
      
      if (newIntervalMs != sendInterval) {
        Serial.println("\n⚙️  Settings Updated from Backend!");
        Serial.print("   Old interval: ");
        Serial.print(sendInterval / 1000);
        Serial.println(" seconds");
        Serial.print("   New interval: ");
        Serial.print(newInterval);
        Serial.println(" seconds");
        
        sendInterval = newIntervalMs;
        Serial.println("   ✅ Reading interval updated!\n");
      }
    }
  }
  
  http.end();
}

void readAndSendSensorData() {
  Serial.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  Serial.println("📊 Reading Sensors...");
  
  // Read DHT11 sensor
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();
  
  // Read soil moisture sensor
  int soilAnalog = analogRead(SOIL_MOISTURE_PIN);
  // Convert to percentage (0-1024 → 0-100%)
  // Note: 1024 = dry, 0 = wet, so we reverse it
  int soilMoisture = map(soilAnalog, 1024, 0, 0, 100);
  soilMoisture = constrain(soilMoisture, 0, 100);
  
  // Validate DHT readings
  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("❌ Failed to read from DHT sensor!");
    Serial.println("   Check wiring and connections");
    failedAttempts++;
    
    if (failedAttempts > 5) {
      Serial.println("⚠️  Multiple failures detected!");
      Serial.println("   Trying to reinitialize sensor...");
      dht.begin();
      failedAttempts = 0;
    }
    
    return;
  }
  
  failedAttempts = 0;
  
  // Display readings
  Serial.println("\n┌─────────────────────────────────┐");
  Serial.print("│ 🌡️  Temperature: ");
  Serial.print(temperature, 1);
  Serial.println(" °C      │");
  Serial.print("│ 💧 Humidity:    ");
  Serial.print(humidity, 1);
  Serial.println(" %       │");
  Serial.print("│ 🌱 Soil:        ");
  Serial.print(soilMoisture);
  Serial.println(" %       │");
  Serial.print("│ 📡 Raw Soil:    ");
  Serial.print(soilAnalog);
  Serial.println("           │");
  Serial.println("└─────────────────────────────────┘\n");
  
  // Status indicators
  if (temperature > 35) {
    Serial.println("🔥 Warning: High temperature!");
  }
  if (humidity < 30) {
    Serial.println("⚠️  Warning: Low humidity!");
  }
  if (soilMoisture < 30) {
    Serial.println("🚨 Warning: Soil is dry! Needs watering!");
  }
  
  // Send data to backend
  sendToBackend(temperature, humidity, soilMoisture);
}

void sendToBackend(float temperature, float humidity, int soilMoisture) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ Not connected to WiFi. Skipping upload.");
    return;
  }
  
  Serial.println("📤 Sending to backend...");
  
  // Create JSON document
  StaticJsonDocument<200> doc;
  doc["temperature"] = round(temperature * 10) / 10.0;  // Round to 1 decimal
  doc["humidity"] = round(humidity * 10) / 10.0;
  doc["soilMoisture"] = soilMoisture;
  
  // Serialize JSON to string
  String jsonData;
  serializeJson(doc, jsonData);
  
  Serial.print("📦 Payload: ");
  Serial.println(jsonData);
  
  // Send HTTP POST request
  HTTPClient http;
  http.begin(wifiClient, serverUrl);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(5000);  // 5 second timeout
  
  int httpCode = http.POST(jsonData);
  
  // Check response
  if (httpCode > 0) {
    Serial.print("✅ HTTP Response: ");
    Serial.println(httpCode);
    
    if (httpCode == 200) {
      String response = http.getString();
      Serial.print("📥 Server response: ");
      Serial.println(response);
      Serial.println("✨ Data sent successfully!\n");
    }
  } else {
    Serial.print("❌ HTTP POST failed: ");
    Serial.println(http.errorToString(httpCode));
    Serial.println("   Possible issues:");
    Serial.println("   - Backend server not running");
    Serial.println("   - Wrong IP address in serverUrl");
    Serial.println("   - Firewall blocking connection");
    Serial.println();
  }
  
  http.end();
}

// Helper function to get WiFi status string
String getWiFiStatus() {
  switch (WiFi.status()) {
    case WL_CONNECTED:       return "Connected";
    case WL_NO_SHIELD:       return "No Shield";
    case WL_IDLE_STATUS:     return "Idle";
    case WL_NO_SSID_AVAIL:   return "No SSID Available";
    case WL_SCAN_COMPLETED:  return "Scan Completed";
    case WL_CONNECT_FAILED:  return "Connection Failed";
    case WL_CONNECTION_LOST: return "Connection Lost";
    case WL_DISCONNECTED:    return "Disconnected";
    default:                 return "Unknown";
  }
}
