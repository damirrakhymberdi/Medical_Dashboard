// features/schedule/schedule.view.js

export function renderScheduleLayout({
  doctors,
  selectedDoctorId,
  selectedDate,
}) {
  return `
    <h1>Schedule</h1>

    <div class="card" style="margin-top:16px;">
      <div style="display:flex; gap:12px; flex-wrap:wrap; align-items:end;">
        
        <div style="min-width:220px;">
          <label class="muted" style="font-size:12px;">Doctor</label>
          <select id="doctorSelect" class="input">
            <option value="">Select doctor</option>
            ${doctors
              .map(
                (d) =>
                  `<option value="${d.id}" ${d.id === selectedDoctorId ? "selected" : ""}>
                    ${d.name}
                  </option>`,
              )
              .join("")}
          </select>
        </div>

        <div style="min-width:220px;">
          <label class="muted" style="font-size:12px;">Date</label>
          <input id="dateInput" class="input" type="date" value="${selectedDate}" />
        </div>
      </div>

      <div id="scheduleContent" style="margin-top:16px;"></div>
    </div>
  `;
}

export function renderLoading() {
  return `<p class="muted">Loading schedule…</p>`;
}

export function renderError(message) {
  return `<p style="color:#b91c1c;">${escapeHtml(message)}</p>`;
}

export function renderEmpty() {
  return `<p class="muted">No appointments for this date.</p>`;
}

export function renderTable(list) {
  return `
    <table class="table">
      <thead>
        <tr>
          <th>Time</th>
          <th>Patient</th>
          <th>Status</th>
          <th style="width:170px;">Actions</th>
        </tr>
      </thead>
      <tbody>
        ${list
          .map(
            (a) => `
          <tr>
            <td>${escapeHtml(a.time)}</td>
            <td>${escapeHtml(a.patientName)}</td>
            <td><span class="badge ${escapeHtml(a.status)}">${escapeHtml(a.status)}</span></td>
            <td>
              <a class="btn btn-secondary" href="#visit?id=${encodeURIComponent(a.id)}" style="text-decoration:none;">
                Start visit
              </a>
            </td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
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
