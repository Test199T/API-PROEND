-- Exercise Log Database Schema (Simple Version)

-- Create exercise_log table
CREATE TABLE IF NOT EXISTS exercise_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  exercise_name VARCHAR(200) NOT NULL,
  exercise_type VARCHAR(50) CHECK (exercise_type IN ('cardio', 'strength', 'flexibility', 'balance', 'sports', 'other')),
  duration_minutes INTEGER CHECK (duration_minutes > 0 AND duration_minutes <= 1440),
  sets INTEGER CHECK (sets > 0 AND sets <= 100),
  reps INTEGER CHECK (reps > 0 AND reps <= 1000),
  weight_kg DECIMAL(6,2) CHECK (weight_kg > 0 AND weight_kg <= 1000),
  distance_km DECIMAL(6,2) CHECK (distance_km > 0 AND distance_km <= 1000),
  calories_burned INTEGER CHECK (calories_burned >= 0 AND calories_burned <= 10000),
  intensity VARCHAR(20) CHECK (intensity IN ('low', 'moderate', 'high', 'very_high')),
  notes TEXT,
  exercise_date DATE NOT NULL,
  exercise_time TIME,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_exercise_log_user_id ON exercise_log(user_id);
CREATE INDEX idx_exercise_log_exercise_date ON exercise_log(exercise_date);
CREATE INDEX idx_exercise_log_exercise_type ON exercise_log(exercise_type);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_exercise_log_updated_at 
  BEFORE UPDATE ON exercise_log 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO exercise_log (
  user_id, 
  exercise_name, 
  exercise_type, 
  duration_minutes, 
  distance_km, 
  calories_burned, 
  intensity, 
  notes, 
  exercise_date, 
  exercise_time
) VALUES 
  (1, 'Running', 'cardio', 30, 5.0, 300, 'moderate', 'Morning run', '2024-01-15', '07:00:00'),
  (1, 'Bench Press', 'strength', NULL, NULL, 120, 'high', 'Chest workout', '2024-01-15', '18:30:00'),
  (1, 'Yoga', 'flexibility', 45, NULL, 150, 'low', 'Evening stretch', '2024-01-16', '19:00:00')
ON CONFLICT DO NOTHING;
