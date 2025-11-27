document.addEventListener('DOMContentLoaded', () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    window.location.href = 'login.html';
    return;
  }
  const user = JSON.parse(userStr);

  // Add a small header area if missing
  const header = document.querySelector('header');
  if (header) {
    let info = header.querySelector('.user-info-inline');
    if (!info) {
      info = document.createElement('div');
      info.className = 'user-info-inline';
      info.style.cssText = 'float:right;font-size:14px;color:#444;';
      header.appendChild(info);
    }
    info.innerHTML = `Hello, <strong>${escapeHtml(user.name)}</strong> (${escapeHtml(user.role||'user')}) <button id="btnLogoutSmall" style="margin-left:10px;padding:6px 10px;border-radius:6px;">Logout</button>`;
    const btn = document.getElementById('btnLogoutSmall');
    if (btn) btn.addEventListener('click', () => { localStorage.removeItem('user'); localStorage.removeItem('token'); window.location.href = 'login.html'; });
  }

  // Prefill any patient ID fields with the user's id when role is patient
  if (user.role && user.role.toLowerCase() === 'patient') {
    const patientIdInputs = document.querySelectorAll('input[id*="patientId"], input[id*="PatientId"], input[id*="patientid"]');
    patientIdInputs.forEach(i => i.value = user.id);
  }

  // For doctor/nurse/pharmacist, you may want to prefill staff id fields if present
  if (user.role && ['doctor','nurse','lab','pharmacist','admin'].includes(user.role.toLowerCase())) {
    const staffIdInputs = document.querySelectorAll('input[id*="doctorId"], input[id*="staffId"], input[id*="doctorID"]');
    staffIdInputs.forEach(i => { if (!i.value) i.value = user.id; });
  }

  // Small utility to escape HTML
  function escapeHtml(s) {
    return String(s).replace(/[&<>\