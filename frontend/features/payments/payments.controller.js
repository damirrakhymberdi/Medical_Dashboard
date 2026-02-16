// features/payments/payments.controller.js
import { createPayment, getPaymentsByDate } from "../../core/api.js";
import { getState, setState } from "../../core/state.js";
import {
  renderPaymentsPage,
  renderLoading,
  renderError,
  renderEmpty,
  renderPaymentsTable,
} from "./payments.view.js";

export function mountPaymentsPage() {
  const page = document.getElementById("page-content");

  const s = getState();
  const date = s.selectedDate;

  page.innerHTML = renderPaymentsPage({ date });

  const dateInput = document.getElementById("payDate");
  const amountInput = document.getElementById("payAmount");
  const methodSelect = document.getElementById("payMethod");
  const submitBtn = document.getElementById("paySubmit");
  const errBox = document.getElementById("payError");

  const stateBox = document.getElementById("paymentsState");
  const tableBox = document.getElementById("paymentsTable");

  loadPayments(date);

  dateInput.addEventListener("change", () => {
    setState({ selectedDate: dateInput.value });
    loadPayments(dateInput.value);
  });

  submitBtn.addEventListener("click", async () => {
    errBox.textContent = "";

    const amount = Number(amountInput.value);
    const method = methodSelect.value;

    if (!Number.isFinite(amount) || amount <= 0) {
      errBox.textContent = "Enter valid amount";
      return;
    }

    const patients = getState().patients || [];
    const patientId = patients[0]?.id;

    if (!patientId) {
      errBox.textContent =
        "No patient available. Go to Patients and create at least one.";
      return;
    }

    submitBtn.disabled = true;
    const old = submitBtn.textContent;
    submitBtn.textContent = "Accepting…";

    try {
      await createPayment({
        date: dateInput.value,
        amount,
        method,
        patientId,
        visitId: null,
      });

      amountInput.value = "";
      await loadPayments(dateInput.value);
    } catch (err) {
      errBox.textContent = err?.message || "Payment failed";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = old;
    }
  });

  async function loadPayments(date) {
    try {
      stateBox.innerHTML = renderLoading("Loading payments…");
      tableBox.innerHTML = "";

      const list = await getPaymentsByDate(date);
      setState({ payments: list });

      if (!list.length) {
        stateBox.innerHTML = renderEmpty();
        return;
      }

      stateBox.innerHTML = "";
      tableBox.innerHTML = renderPaymentsTable(list);
    } catch (err) {
      stateBox.innerHTML = renderError(
        err?.message || "Failed to load payments",
      );
      tableBox.innerHTML = "";
    }
  }
}
