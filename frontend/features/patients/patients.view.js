// features/patients/patients.view.js

export function renderPatientsPage() {
  return `
    <h1>Patients</h1>

    <div class="card" style="margin-top:16px;">
      <div style="display:flex; gap:12px; flex-wrap:wrap; align-items:end;">
        <div style="flex:1; min-width:240px;">
          <label class="muted" style="font-size:12px;">Search</label>
          <input id="patientSearch" class="input" placeholder="Search by name or phone..." />
        </div>
        <button id="createPatientBtn" class="btn" type="button">Create patient</button>
      </div>

      <div id="patientsState" style="margin-top:14px;"></div>
      <div id="patientsTable" style="margin-top:14px;"></div>
    </div>
  `;
}

export function renderLoading(text = "Loading patients…") {
  return `<p class="muted">${text}</p>`;
}

export function renderError(message) {
  return `<p style="color:#b91c1c;">${message}</p>`;
}

export function renderEmpty() {
  return `<p class="muted">No patients found.</p>`;
}

export function renderPatientsTable(list) {
  return `
    <table class="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Phone</th>
          <th>Birth date</th>
          <th style="width:220px;">Actions</th>
        </tr>
      </thead>
      <tbody>
        ${list
          .map(
            (p) => `
          <tr>
            <td>${escapeHtml(p.name)}</td>
            <td>${escapeHtml(p.phone)}</td>
            <td>${p.birthDate ? escapeHtml(p.birthDate) : `<span class="muted">—</span>`}</td>
            <td>
              <button class="btn btn-secondary" data-action="view" data-id="${p.id}" type="button">View</button>
              <button class="btn btn-secondary" data-action="edit" data-id="${p.id}" type="button" style="margin-left:8px;">Edit</button>
            </td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
  `;
}

export function renderPatientForm({ mode, patient }) {
  const title = mode === "edit" ? "Edit patient" : "Create patient";
  return `
    <form id="patientForm">
      <div class="muted" style="font-size:12px; margin-bottom:10px;">${title}</div>

      <label class="muted" style="font-size:12px; display:grid; gap:6px; margin-bottom:10px;">
        Name
        <input class="input" name="name" value="${patient?.name ? escapeAttr(patient.name) : ""}" required />
      </label>

      <label class="muted" style="font-size:12px; display:grid; gap:6px; margin-bottom:10px;">
        Phone
        <input class="input" name="phone" value="${patient?.phone ? escapeAttr(patient.phone) : ""}" placeholder="8700..." required />
      </label>

      <label class="muted" style="font-size:12px; display:grid; gap:6px; margin-bottom:10px;">
        Birth date
        <input class="input" type="date" name="birthDate" value="${patient?.birthDate ? escapeAttr(patient.birthDate) : ""}" />
      </label>

      <div id="patientFormError" style="min-height:18px; color:#b91c1c; font-size:13px;"></div>

      <div style="display:flex; gap:10px; justify-content:flex-end; margin-top:12px;">
        <button class="btn btn-secondary" type="button" id="cancelPatientForm">Cancel</button>
        <button class="btn" type="submit" id="savePatientBtn">${mode === "edit" ? "Save" : "Create"}</button>
      </div>
    </form>
  `;
}

export function renderPatientCard(patient) {
  return `
    <div class="card" style="box-shadow:none; border:none; padding:0;">
      <div style="display:grid; gap:10px;">
        <div>
          <div class="muted" style="font-size:12px;">Name</div>
          <div style="font-weight:800; font-size:18px;">${escapeHtml(patient.name)}</div>
        </div>
        <div>
          <div class="muted" style="font-size:12px;">Phone</div>
          <div>${escapeHtml(patient.phone)}</div>
        </div>
        <div>
          <div class="muted" style="font-size:12px;">Birth date</div>
          <div>${patient.birthDate ? escapeHtml(patient.birthDate) : `<span class="muted">—</span>`}</div>
        </div>
      </div>
    </div>
  `;
}

/* helpers */
function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
function escapeAttr(str) {
  return escapeHtml(str).replaceAll("\n", " ");
}
