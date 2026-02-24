// features/report/report.view.js

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function renderReportPage({ date }) {
  return `
    <div class="report-container">

      <!-- Toolbar -->
      <div class="report-toolbar">
        <div class="report-form-group">
          <label class="report-label">Дата</label>
          <input id="reportDate" class="payments-input" type="date" value="${date}" />
        </div>
        <button id="refreshReportBtn" class="btn btn-secondary" type="button">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          Обновить
        </button>
      </div>

      <!-- State (loading/error) -->
      <div id="reportState"></div>

      <!-- Summary cards -->
      <div id="reportSummary"></div>

      <!-- Payments list -->
      <div id="reportPayments"></div>

    </div>
  `;
}

export function renderLoading(text = "Загрузка…") {
  return `
    <div class="payments-empty" style="margin-top:16px;">
      <div class="spinner"></div>
      <div class="state-text">${escapeHtml(text)}</div>
    </div>
  `;
}

export function renderError(message) {
  return `
    <div class="payments-empty" style="margin-top:16px;">
      <div class="state-icon">⚠️</div>
      <div class="form-error" style="min-height:auto;">${escapeHtml(message)}</div>
    </div>
  `;
}

export function renderSummary({ totalAmount, visitsCompleted }) {
  return `
    <div class="report-summary-grid">
      <div class="report-stat-card">
        <div class="report-stat-label">Общая сумма</div>
        <div class="report-stat-value">${Number(totalAmount).toLocaleString()} ₸</div>
      </div>
      <div class="report-stat-card">
        <div class="report-stat-label">Завершённых визитов</div>
        <div class="report-stat-value">${Number(visitsCompleted)}</div>
      </div>
    </div>
  `;
}

export function renderEmptyPayments() {
  return `
    <div class="payments-empty" style="margin-top:0;">
      <div class="state-icon">💰</div>
      <div class="state-text" style="margin-top:0;">Нет оплат за эту дату</div>
    </div>
  `;
}

export function renderPaymentsTable(list) {
  const total = list.reduce((s, p) => s + Number(p.amount), 0);
  return `
    <div class="payments-summary">
      <div class="payments-summary-item">
        <span class="payments-summary-label">Всего платежей:</span>
        <span class="payments-summary-value">${list.length}</span>
      </div>
      <div class="payments-summary-item">
        <span class="payments-summary-label">Итого:</span>
        <span class="payments-summary-value payments-summary-total">${total.toLocaleString()} ₸</span>
      </div>
    </div>

    <div class="payments-list">
      ${list
        .map(
          (p) => `
        <div class="payment-item">
          <div class="payment-indicator"></div>
          <div class="payment-info">
            <div class="payment-header">
              <span class="payment-time">${escapeHtml(p.time)}</span>
              <span class="payment-amount">${Number(p.amount).toLocaleString()} ₸</span>
            </div>
            <div class="payment-details">
              <span class="payment-patient">${escapeHtml(p.patientName)}</span>
              <span class="payment-method-badge ${escapeHtml(p.method)}">
                ${p.method === "cash" ? "💵 Наличные" : "💳 Карта"}
              </span>
            </div>
          </div>
        </div>
      `,
        )
        .join("")}
    </div>
  `;
}
