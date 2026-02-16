// features/payments/payments.view.js

export function renderPaymentsPage({ date }) {
  return `
    <h1>Payments</h1>

    <div class="card" style="margin-top:16px;">
      <div style="display:flex; gap:12px; flex-wrap:wrap; align-items:end;">
        <div style="min-width:220px;">
          <label class="muted" style="font-size:12px;">Date</label>
          <input id="payDate" class="input" type="date" value="${date}" />
        </div>

        <div style="min-width:220px;">
          <label class="muted" style="font-size:12px;">Amount</label>
          <input id="payAmount" class="input" type="number" placeholder="0" min="0" />
        </div>

        <div style="min-width:220px;">
          <label class="muted" style="font-size:12px;">Method</label>
          <select id="payMethod" class="input">
            <option value="cash">cash</option>
            <option value="card">card</option>
          </select>
        </div>

        <button id="paySubmit" class="btn" type="button">Accept</button>
      </div>

      <div id="payError" style="min-height:18px; color:#b91c1c; font-size:13px; margin-top:10px;"></div>

      <div style="margin-top:14px;">
        <div class="muted" style="font-size:12px; margin-bottom:8px;">Payments list</div>
        <div id="paymentsState"></div>
        <div id="paymentsTable" style="margin-top:10px;"></div>
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

export function renderEmpty() {
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
