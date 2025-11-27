const API_BASE = "http://localhost:3000/api";

async function handleForm(formId, endpoint, method = "POST", resultId) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => (data[key] = value));
    try {
      const res = await fetch(API_BASE + endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: method === "GET" ? undefined : JSON.stringify(data),
      });
      const json = await res.json();
      document.getElementById(resultId).textContent = JSON.stringify(json, null, 2);
    } catch (err) {
      document.getElementById(resultId).textContent = "Error: " + err;
    }
  });
}

// Patient
handleForm("patient-history-form", "/patients/history", "POST", "patientHistoryResult");
handleForm("patient-records-form", "/patients/records", "POST", "patientRecordsResult");
handleForm("appointment-form", "/appointments/book", "POST", "appointmentResult");
handleForm("patient-update-form", "/patients/update", "POST", "patientUpdateResult");

// Doctor
handleForm("doc-history-form", "/patients/history", "POST", "docHistoryResult");
handleForm("doc-prescription-form", "/doctors/prescriptions", "POST", "docPrescriptionResult");
handleForm("doc-treatment-form", "/doctors/treatments", "POST", "docTreatmentResult");

// Nurse
handleForm("nurse-update-record-form", "/nurses/records", "POST", "nurseUpdateRecordResult");
handleForm("nurse-vitals-form", "/nurses/vitals", "POST", "nurseVitalsResult");
handleForm("nurse-ward-form", "/nurses/wards", "POST", "nurseWardResult");

// Admin
handleForm("admin-add-staff-form", "/admin/staff/add", "POST", "adminStaffResult");
handleForm("admin-remove-staff-form", "/admin/staff/remove", "POST", "adminStaffResult");
handleForm("admin-user-accounts-form", "/admin/users", "POST", "adminUserAccountsResult");
handleForm("admin-security-form", "/admin/security", "POST", "adminSecurityResult");

// Lab
handleForm("lab-upload-form", "/lab/results/upload", "POST", "labUploadResult");
handleForm("lab-manage-form", "/lab/results/list", "POST", "labManageResult");

// Pharmacist
handleForm("pharmacy-prescriptions-form", "/pharmacy/prescriptions", "POST", "pharmacyPrescriptionsResult");
handleForm("pharmacy-dispense-form", "/pharmacy/dispense", "POST", "pharmacyDispenseResult");
handleForm("pharmacy-stock-form", "/pharmacy/stock", "POST", "pharmacyStockResult");
