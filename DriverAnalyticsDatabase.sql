-- Create database
CREATE DATABASE DriverAnalytics;
USE DriverAnalytics;

-- Create Family Accounts table
CREATE TABLE family_accounts (
    family_id INT AUTO_INCREMENT PRIMARY KEY,
    family_name VARCHAR(100) NOT NULL,
    invite_code CHAR(6) UNIQUE NOT NULL
);

-- Create Users table
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('parent','teen') NOT NULL,
    family_id INT,
    FOREIGN KEY (family_id) REFERENCES family_accounts(family_id)
);

-- Create Scores table
CREATE TABLE scores (
    score_id INT AUTO_INCREMENT PRIMARY KEY,
    overall_score DECIMAL(5,2),
    speed_score DECIMAL(5,2),
    brake_score DECIMAL(5,2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create Trips table
CREATE TABLE trips (
    trip_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    start_time DATETIME,
    end_time DATETIME,
    distance_km DECIMAL(6,2),
    avg_speed DECIMAL(5,2),
    score_id INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (score_id) REFERENCES scores(score_id)
);

-- Create DataPoints table
CREATE TABLE datapoints (
    point_id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id INT NOT NULL,
    timestamp DATETIME,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    speed DECIMAL(5,2),
    acceleration DECIMAL(5,2),
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id)
);

-- Insert test family
INSERT INTO family_accounts (family_name, invite_code)
VALUES ('Johnson Family', 'A1B2C3');

-- Insert test users
INSERT INTO users (name, email, password, role, family_id)
VALUES
('Alex Johnson', 'parent.demo@driveranalytics.com', 'test123', 'parent', 1),
('Jordan Johnson', 'teen.demo@driveranalytics.com', 'test123', 'teen', 1);

-- Insert sample trip and score
INSERT INTO scores (overall_score, speed_score, brake_score)
VALUES (85.00, 90.00, 80.00);

INSERT INTO trips (user_id, start_time, end_time, distance_km, avg_speed, score_id)
VALUES (2, '2025-11-10 09:00:00', '2025-11-10 09:30:00', 15.5, 50.2, 1);

-- Sample datapoints
INSERT INTO datapoints (trip_id, timestamp, latitude, longitude, speed, acceleration)
VALUES
(1, '2025-11-10 09:01:00', 43.4516, -80.4925, 48.5, 0.8),
(1, '2025-11-10 09:05:00', 43.4520, -80.4950, 52.0, -0.5),
(1, '2025-11-10 09:10:00', 43.4550, -80.4970, 50.1, 0.3);

-- Verify everything
SELECT * FROM family_accounts;
SELECT * FROM users;
SELECT * FROM trips;
SELECT * FROM datapoints;
SELECT * FROM scores;

