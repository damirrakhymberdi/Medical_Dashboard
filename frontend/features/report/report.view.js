// features/report/report.view.js

export function renderReportPage({ date }) {
  return `
    <h1>Day Report</h1>

    <div class="card" style="margin-top:16px;">
      <div style="display:flex; gap:12px; flex-wrap:wrap; align-items:end;">
        <div style="min-width:220px;">
          <label class="muted" style="font-size:12px;">Date</label>
          <input id="reportDate" class="input" type="date" value="${date}" />
        </div>
        <button id="refreshReportBtn" class="btn btn-secondary" type="button">Refresh</button>
      </div>

      <div id="reportState" style="margin-top:14px;"></div>

      <div id="reportSummary" style="margin-top:14px;"></div>

      <div style="margin-top:16px;">
        <div class="muted" style="font-size:12px; margin-bottom:8px;">Payments</div>
        <div id="reportPayments"></div>
      </div>
    </div>
  `;
}

export function renderLoading(text = "Loading…") {
  return `<p class="muted">${escapeHtml(text)}</p>`;
}

export function renderError(message) {
  return `<p style="color:#b91c1c;">${escapeHtml(message)}</p>`;
}

export function renderSummary({ totalAmount, visitsCompleted }) {
  return `
    <div style="display:flex; gap:12px; flex-wrap:wrap;">
      <div class="card" style="flex:1; min-width:220px;">
        <div class="muted" style="font-size:12px;">Total amount</div>
        <div style="font-size:26px; font-weight:900; margin-top:6px;">
          ${Number(totalAmount).toLocaleString()}
        </div>
      </div>

      <div class="card" style="flex:1; min-width:220px;">
        <div class="muted" style="font-size:12px;">Visits completed</div>
        <div style="font-size:26px; font-weight:900; margin-top:6px;">
          ${Number(visitsCompleted).toLocaleString()}
        </div>
      </div>
    </div>
  `;
}

export function renderEmptyPayments() {
  return `<p class="muted">No payments for this date.</p>`;
}

export function renderPaymentsTable(list) {
  return `
    <table class="table">
      <thead>
        <tr>
          <th>Time</th>
          <th>Patient</th>
          <th>Amount</th>
          <th>Method</th>
        </tr>
      </thead>
      <tbody>
        ${list
          .map(
            (p) => `
          <tr>
            <td>${escapeHtml(p.time)}</td>
            <td>${escapeHtml(p.patientName)}</td>
            <td>${Number(p.amount).toLocaleString()}</td>
            <td><span class="badge">${escapeHtml(p.method)}</span></td>
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
