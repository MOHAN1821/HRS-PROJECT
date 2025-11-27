-- MySQL init script for HRS project
CREATE DATABASE IF NOT EXISTS health_records_db;
USE health_records_db;

CREATE TABLE IF NOT EXISTS patients (
  id VARCHAR(32) PRIMARY KEY,
  name VARCHAR(255),
  contact VARCHAR(32)
);

CREATE TABLE IF NOT EXISTS prescriptions (
  id VARCHAR(32) PRIMARY KEY,
  patient_id VARCHAR(32),
  items TEXT,
  dispensed BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);

CREATE TABLE IF NOT EXISTS lab_reports (
  id VARCHAR(32) PRIMARY KEY,
  patient_id VARCHAR(32),
  test_name VARCHAR(255),
  result TEXT,
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- Sample seed data
INSERT INTO patients (id, name, contact) VALUES
('P1','John Doe','9999999999'),
('P2','Jane Smith','8888888888')
ON DUPLICATE KEY UPDATE name=VALUES(name), contact=VALUES(contact);

INSERT INTO prescriptions (id, patient_id, items, dispensed) VALUES
('RX1','P1','["Metformin"]', FALSE),
('RX2','P2','["Amlodipine"]', FALSE)
ON DUPLICATE KEY UPDATE items=VALUES(items), dispensed=VALUES(dispensed);

INSERT INTO lab_reports (id, patient_id, test_name, result) VALUES
('L1','P1','Blood Sugar','Normal'),
('L2','P2','Cholesterol','Borderline')
ON DUPLICATE KEY UPDATE test_name=VALUES(test_name), result=VALUES(result);
