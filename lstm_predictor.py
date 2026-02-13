"""
LSTM Time Series Predictor for IoT Sensor Data
Predicts next sensor readings (temperature, humidity, soil moisture) using LSTM
"""

import sys
import json
import numpy as np
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

try:
    from tensorflow import keras
    from tensorflow.keras.models import Sequential, load_model
    from tensorflow.keras.layers import LSTM, Dense, Dropout
    from tensorflow.keras.optimizers import Adam
    from sklearn.preprocessing import MinMaxScaler
    import joblib
    import os
except ImportError as e:
    print(json.dumps({
        "error": "Missing dependencies. Install: pip install tensorflow scikit-learn joblib numpy",
        "details": str(e)
    }))
    sys.exit(1)

class LSTMPredictor:
    def __init__(self, model_dir='models'):
        self.model_dir = model_dir
        self.model_path = os.path.join(model_dir, 'lstm_model.h5')
        self.scaler_path = os.path.join(model_dir, 'scaler.pkl')
        self.sequence_length = 10  # Use last 10 readings to predict next
        self.model = None
        self.scaler = None
        
        # Create models directory if it doesn't exist
        os.makedirs(model_dir, exist_ok=True)
    
    def prepare_data(self, data):
        """
        Prepare time series data for LSTM
        data: list of readings with temperature, humidity, soilMoisture
        """
        if len(data) < self.sequence_length:
            raise ValueError(f"Need at least {self.sequence_length} data points")
        
        # Extract features
        features = []
        for reading in data:
            features.append([
                reading['temperature'],
                reading['humidity'],
                reading['soilMoisture']
            ])
        
        return np.array(features)
    
    def create_sequences(self, data):
        """Create sequences for LSTM training"""
        X, y = [], []
        for i in range(len(data) - self.sequence_length):
            X.append(data[i:i + self.sequence_length])
            y.append(data[i + self.sequence_length])
        return np.array(X), np.array(y)
    
    def build_model(self):
        """Build LSTM model architecture"""
        model = Sequential([
            LSTM(64, activation='relu', return_sequences=True, input_shape=(self.sequence_length, 3)),
            Dropout(0.2),
            LSTM(32, activation='relu', return_sequences=False),
            Dropout(0.2),
            Dense(16, activation='relu'),
            Dense(3)  # 3 outputs: temperature, humidity, soilMoisture
        ])
        
        model.compile(
            optimizer=Adam(learning_rate=0.001),
            loss='mse',
            metrics=['mae']
        )
        
        return model
    
    def train(self, historical_data, epochs=50):
        """
        Train LSTM model on historical data
        historical_data: list of readings sorted by timestamp (oldest to newest)
        """
        try:
            # Prepare data
            features = self.prepare_data(historical_data)
            
            # Normalize data
            self.scaler = MinMaxScaler(feature_range=(0, 1))
            features_scaled = self.scaler.fit_transform(features)
            
            # Create sequences
            X, y = self.create_sequences(features_scaled)
            
            if len(X) < 10:
                raise ValueError("Not enough data for training. Need at least 20 readings")
            
            # Build model
            self.model = self.build_model()
            
            # Train model
            self.model.fit(
                X, y,
                epochs=epochs,
                batch_size=8,
                validation_split=0.1,
                verbose=0
            )
            
            # Save model and scaler
            self.model.save(self.model_path)
            joblib.dump(self.scaler, self.scaler_path)
            
            return {
                "success": True,
                "message": f"Model trained on {len(historical_data)} readings",
                "sequences": len(X)
            }
        
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def load_model(self):
        """Load pre-trained model"""
        try:
            if os.path.exists(self.model_path) and os.path.exists(self.scaler_path):
                self.model = load_model(self.model_path)
                self.scaler = joblib.load(self.scaler_path)
                return True
            return False
        except Exception as e:
            print(f"Error loading model: {e}", file=sys.stderr)
            return False
    
    def predict_next(self, recent_data, steps=6):
        """
        Predict next N readings
        recent_data: list of last N readings (should have at least sequence_length readings)
        steps: number of future predictions to make
        """
        try:
            # Load model if not already loaded
            if self.model is None:
                if not self.load_model():
                    # Train a quick model if none exists
                    if len(recent_data) >= 20:
                        train_result = self.train(recent_data, epochs=30)
                        if not train_result.get('success'):
                            return {
                                "error": "Failed to train model",
                                "details": train_result.get('error')
                            }
                    else:
                        return {
                            "error": "No pre-trained model found and not enough data to train",
                            "needed": 20,
                            "available": len(recent_data)
                        }
            
            # Prepare input sequence
            features = self.prepare_data(recent_data[-self.sequence_length:])
            features_scaled = self.scaler.transform(features)
            
            # Make predictions
            predictions = []
            current_sequence = features_scaled.copy()
            
            for i in range(steps):
                # Reshape for prediction
                X = current_sequence[-self.sequence_length:].reshape(1, self.sequence_length, 3)
                
                # Predict next value
                pred_scaled = self.model.predict(X, verbose=0)
                
                # Inverse transform to get actual values
                pred_actual = self.scaler.inverse_transform(pred_scaled)[0]
                
                # Ensure values are in valid ranges
                temperature = float(np.clip(pred_actual[0], 0, 50))
                humidity = float(np.clip(pred_actual[1], 0, 100))
                soil_moisture = float(np.clip(pred_actual[2], 0, 100))
                
                # Calculate timestamp (5-minute intervals)
                last_timestamp = datetime.now()
                if 'timestamp' in recent_data[-1]:
                    last_timestamp = datetime.fromisoformat(recent_data[-1]['timestamp'].replace('Z', '+00:00'))
                
                future_time = last_timestamp + timedelta(minutes=5 * (i + 1))
                
                # Calculate confidence (decreases with prediction distance)
                confidence = max(50, 95 - (i * 7))
                
                predictions.append({
                    "temperature": round(temperature, 1),
                    "humidity": round(humidity, 1),
                    "soilMoisture": round(soil_moisture, 1),
                    "timestamp": future_time.isoformat(),
                    "confidence": confidence,
                    "isPrediction": True
                })
                
                # Update sequence for next prediction
                current_sequence = np.vstack([current_sequence, pred_scaled[0]])
            
            return {
                "success": True,
                "predictions": predictions,
                "model": "LSTM",
                "sequence_length": self.sequence_length
            }
        
        except Exception as e:
            return {
                "error": str(e),
                "traceback": str(sys.exc_info())
            }

def main():
    """Main function to handle command line usage"""
    if len(sys.argv) < 2:
        print(json.dumps({
            "error": "Usage: python lstm_predictor.py <action> [data]",
            "actions": ["train", "predict"]
        }))
        sys.exit(1)
    
    action = sys.argv[1]
    predictor = LSTMPredictor()
    
    if action == "train":
        # Expect JSON data from stdin
        data = json.loads(sys.stdin.read())
        result = predictor.train(data, epochs=50)
        print(json.dumps(result))
    
    elif action == "predict":
        # Expect JSON data from stdin
        data = json.loads(sys.stdin.read())
        steps = int(sys.argv[2]) if len(sys.argv) > 2 else 6
        result = predictor.predict_next(data, steps)
        print(json.dumps(result))
    
    else:
        print(json.dumps({"error": f"Unknown action: {action}"}))
        sys.exit(1)

if __name__ == "__main__":
    main()
