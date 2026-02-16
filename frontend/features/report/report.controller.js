// features/report/report.controller.js
import { getDayReport } from "../../core/api.js";
import { getState, setState } from "../../core/state.js";
import {
  renderReportPage,
  renderLoading,
  renderError,
  renderSummary,
  renderEmptyPayments,
  renderPaymentsTable,
} from "./report.view.js";

export function mountReportPage() {
  const page = document.getElementById("page-content");
  const date = getState().selectedDate;

  page.innerHTML = renderReportPage({ date });

  const dateInput = document.getElementById("reportDate");
  const refreshBtn = document.getElementById("refreshReportBtn");

  const stateBox = document.getElementById("reportState");
  const summaryBox = document.getElementById("reportSummary");
  const paymentsBox = document.getElementById("reportPayments");

  async function loadReport(d) {
    try {
      stateBox.innerHTML = renderLoading("Loading report…");
      summaryBox.innerHTML = "";
      paymentsBox.innerHTML = "";

      const report = await getDayReport(d);

      setState({
        selectedDate: d,
        payments: report.payments,
      });

      stateBox.innerHTML = "";
      summaryBox.innerHTML = renderSummary({
        totalAmount: report.totalAmount,
        visitsCompleted: report.visitsCompleted,
      });

      if (!report.payments.length) {
        paymentsBox.innerHTML = renderEmptyPayments();
        return;
      }

      paymentsBox.innerHTML = renderPaymentsTable(report.payments);
    } catch (err) {
      stateBox.innerHTML = renderError(err?.message || "Failed to load report");
      summaryBox.innerHTML = "";
      paymentsBox.innerHTML = "";
    }
  }

  dateInput.addEventListener("change", () => {
    loadReport(dateInput.value);
  });

  refreshBtn.addEventListener("click", () => {
    loadReport(dateInput.value);
  });

  loadReport(date);
}
