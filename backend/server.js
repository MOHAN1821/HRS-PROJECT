require('dotenv').config();

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const path = require('path');

// ===== MySQL Connection =====
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || "health_records_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function testDbConnection() {
  try {
    const conn = await pool.getConnection();
    await conn.query("SELECT 1");
    conn.release();
    console.log("✅ Connected to MySQL successfully.");
  } catch (err) {
    console.error("❌ MySQL connection failed:", err.message);
  }
}
testDbConnection();
// ============================

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend static files
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

// Fallback to index.html for SPA
app.get('*', (req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// In-memory demo data
let patients = [
  { id: "P1", name: "John Doe", contact: "9999999999", history: ["Diabetes"], treatments: ["Insulin"], prescriptions: [{ id: "RX1", items: ["Metformin"], dispensed: false }] },
  { id: "P2", name: "Jane Smith", contact: "8888888888", history: ["Hypertension"], treatments: ["BP monitoring"], prescriptions: [{ id: "RX2", items: ["Amlodipine"], dispensed: false }] }
];

let labReports = [];
let vitals = [];
let wards = [];
let staff = [];
let users = [];
let securityRules = [];
let medicines = [{ name: "Paracetamol", qty: 100 }];
let registeredUsers = [
  { id: "U0", name: "Mohan", email: "mohan@gmail.com", password: "mohan" }
];

// Helper
function findPatient(id) {
  return patients.find(p => p.id === id);
}

// Auth endpoints
app.post("/api/auth/signup", (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }
  
  if (registeredUsers.find(u => u.email === email)) {
    return res.status(400).json({ message: "Email already registered" });
  }
  
  const newUser = {
    id: "U" + (registeredUsers.length + 1),
    name,
    email,
    password
  };
  
  registeredUsers.push(newUser);
  res.json({ message: "Account created successfully", user: { id: newUser.id, name: newUser.name, email: newUser.email } });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  
  let user = registeredUsers.find(u => u.email === email && u.password === password);
  
  // Demo users
  if (!user) {
    if ((email === "john@example.com" && password === "password123") ||
        (email === "jane@example.com" && password === "password123")) {
      return res.json({
        message: "Login successful",
        token: "demo-token-" + Date.now(),
        user: { id: "P1", name: email === "john@example.com" ? "John Doe" : "Jane Smith", email }
      });
    }
    return res.status(401).json({ message: "Invalid email or password" });
  }
  
  res.json({
    message: "Login successful",
    token: "token-" + user.id,
    user: { id: user.id, name: user.name, email: user.email }
  });
});

// Get all registered users
app.post("/api/auth/users", (req, res) => {
  const users = registeredUsers.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email
  }));
  res.json({ users });
});

// Patients
app.post("/api/patients/history", (req, res) => {
  const { patientIdHistory } = req.body;
  const p = findPatient(patientIdHistory);
  if (!p) return res.status(404).json({ message: "Patient not found" });
  res.json({ id: p.id, name: p.name, history: p.history });
});

app.post("/api/patients/records", (req, res) => {
  const { patientIdRecords } = req.body;
  const p = findPatient(patientIdRecords);
  if (!p) return res.status(404).json({ message: "Patient not found" });
  const reports = labReports.filter(r => r.patientId === p.id);
  res.json({ prescriptions: p.prescriptions, labReports: reports });
});

app.post("/api/appointments/book", (req, res) => {
  const { patientIdAppointment, doctorIdAppointment, appointmentDateTime } = req.body;
  res.json({ message: "Appointment booked", patientId: patientIdAppointment, doctorId: doctorIdAppointment, dateTime: appointmentDateTime });
});

app.post("/api/patients/update", (req, res) => {
  const { patientIdUpdate, patientNameUpdate, patientContactUpdate } = req.body;
  const p = findPatient(patientIdUpdate);
  if (!p) return res.status(404).json({ message: "Patient not found" });
  if (patientNameUpdate) p.name = patientNameUpdate;
  if (patientContactUpdate) p.contact = patientContactUpdate;
  res.json({ message: "Patient updated", patient: p });
});

// Doctors
app.post("/api/doctors/prescriptions", (req, res) => {
  const { docPatientIdPres, diagnosis, prescription } = req.body;
  const p = findPatient(docPatientIdPres);
  if (!p) return res.status(404).json({ message: "Patient not found" });
  p.history.push(diagnosis);
  const newRx = { id: "RX" + (p.prescriptions.length + 1), items: [prescription], dispensed: false };
  p.prescriptions.push(newRx);
  res.json({ message: "Diagnosis and prescription added", patient: p });
});

app.post("/api/doctors/treatments", (req, res) => {
  const { docPatientIdTreatment } = req.body;
  const p = findPatient(docPatientIdTreatment);
  if (!p) return res.status(404).json({ message: "Patient not found" });
  res.json({ treatments: p.treatments || [] });
});

// Nurses
app.post("/api/nurses/records", (req, res) => {
  const { nursePatientIdUpdate, nurseNotes } = req.body;
  const p = findPatient(nursePatientIdUpdate);
  if (!p) return res.status(404).json({ message: "Patient not found" });
  p.history.push("Nurse note: " + nurseNotes);
  res.json({ message: "Record updated", patient: p });
});

app.post("/api/nurses/vitals", (req, res) => {
  const { nursePatientIdVitals, heartRate, bloodPressure, temperature } = req.body;
  const record = { patientId: nursePatientIdVitals, heartRate, bloodPressure, temperature, time: new Date().toISOString() };
  vitals.push(record);
  res.json({ message: "Vitals saved", record });
});

app.post("/api/nurses/wards", (req, res) => {
  const { wardName, bedNo, wardPatientId } = req.body;
  const record = { wardName, bedNo, patientId: wardPatientId };
  wards.push(record);
  res.json({ message: "Ward/bed assigned", record });
});

// Admin
app.post("/api/admin/staff/add", (req, res) => {
  const { staffName, staffRole } = req.body;
  const id = "S" + (staff.length + 1);
  const s = { id, name: staffName, role: staffRole };
  staff.push(s);
  users.push({ id, name: staffName, role: staffRole });
  res.json({ message: "Staff added", staff: s });
});

app.post("/api/admin/staff/remove", (req, res) => {
  const { staffIdRemove } = req.body;
  staff = staff.filter(s => s.id !== staffIdRemove);
  users = users.filter(u => u.id !== staffIdRemove);
  res.json({ message: "Staff removed", staffId: staffIdRemove });
});

app.post("/api/admin/users", (req, res) => {
  res.json({ users });
});

app.post("/api/admin/security", (req, res) => {
  const { securityRole, permissionDesc } = req.body;
  const rule = { role: securityRole, permission: permissionDesc };
  securityRules.push(rule);
  res.json({ message: "Security rule added", rule });
});

// Lab
app.post("/api/lab/results/upload", (req, res) => {
  const { labPatientId, labTestName, labResult } = req.body;
  const report = { id: "L" + (labReports.length + 1), patientId: labPatientId, testName: labTestName, result: labResult };
  labReports.push(report);
  res.json({ message: "Lab report uploaded", report });
});

app.post("/api/lab/results/list", (req, res) => {
  const { labManagePatientId } = req.body;
  const reports = labReports.filter(r => r.patientId === labManagePatientId);
  res.json({ reports });
});

// Pharmacy
app.post("/api/pharmacy/prescriptions", (req, res) => {
  const { pharmacyPatientId } = req.body;
  const p = findPatient(pharmacyPatientId);
  if (!p) return res.status(404).json({ message: "Patient not found" });
  res.json({ prescriptions: p.prescriptions });
});

app.post("/api/pharmacy/dispense", (req, res) => {
  const { prescriptionIdDispense } = req.body;
  let found = null;
  patients.forEach(p => {
    p.prescriptions.forEach(rx => {
      if (rx.id === prescriptionIdDispense) {
        rx.dispensed = true;
        found = rx;
      }
    });
  });
  if (!found) return res.status(404).json({ message: "Prescription not found" });
  res.json({ message: "Marked as dispensed", prescription: found });
});

app.post("/api/pharmacy/stock", (req, res) => {
  const { medicineName, medicineQty } = req.body;
  let m = medicines.find(x => x.name === medicineName);
  if (!m) {
    m = { name: medicineName, qty: 0 };
    medicines.push(m);
  }
  m.qty = parseInt(medicineQty, 10);
  res.json({ message: "Stock updated", medicine: m });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Health Records backend running on port", PORT);
});
