// features/visits/visits.view.js

export function renderVisitPageShell() {
  return `
    <h1>Visit</h1>
    <div class="card" style="margin-top:16px;" id="visitCard"></div>
  `;
}

export function renderVisitLoading(text = "Loading visit…") {
  return `<p class="muted">${text}</p>`;
}

export function renderVisitError(message) {
  return `<p style="color:#b91c1c;">${message}</p>`;
}

export function renderVisitForm({ appointment, visit, isFinal }) {
  const disabledAttr = isFinal ? "disabled" : "";

  return `
    <div style="display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap;">
      <div>
        <div class="muted" style="font-size:12px;">Appointment</div>
        <div style="font-weight:800;">${appointment.date} • ${appointment.time}</div>
        <div class="muted" style="margin-top:4px; font-size:13px;">Patient: ${appointment.patientName}</div>
      </div>

      <div>
        <div class="muted" style="font-size:12px;">Status</div>
        <div><span class="badge ${appointment.status}">${appointment.status}</span></div>
      </div>
    </div>

    <div style="margin-top:14px; display:flex; gap:10px; flex-wrap:wrap;">
      <button class="btn btn-secondary" id="backToScheduleBtn" type="button">← Back</button>
      <button class="btn" id="startVisitBtn" type="button" ${visit ? "disabled" : ""}>
        Start visit
      </button>
    </div>

    <form id="visitForm" style="margin-top:16px; display:grid; gap:12px;">
      <label class="muted" style="font-size:12px; display:grid; gap:6px;">
        Complaint
        <textarea class="input" name="complaint" rows="2" ${disabledAttr}>${escapeHtml(visit?.complaint || "")}</textarea>
      </label>

      <label class="muted" style="font-size:12px; display:grid; gap:6px;">
        Diagnosis
        <textarea class="input" name="diagnosis" rows="2" ${disabledAttr}>${escapeHtml(visit?.diagnosis || "")}</textarea>
      </label>

      <label class="muted" style="font-size:12px; display:grid; gap:6px;">
        Notes
        <textarea class="input" name="notes" rows="3" ${disabledAttr}>${escapeHtml(visit?.notes || "")}</textarea>
      </label>

      <div id="visitError" style="min-height:18px; color:#b91c1c; font-size:13px;"></div>

      <div style="display:flex; justify-content:flex-end; gap:10px;">
        <button class="btn" id="finishVisitBtn" type="submit" ${isFinal ? "disabled" : ""}>
          Finish
        </button>
      </div>

      ${isFinal ? `<div class="muted" style="font-size:12px;">Visit is completed. Form is locked.</div>` : ``}
    </form>
  `;
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
