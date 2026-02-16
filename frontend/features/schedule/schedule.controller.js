// features/schedule/schedule.controller.js
import { getDoctors, getSchedule } from "../../core/api.js";
import { getState, setState } from "../../core/state.js";
import {
  renderScheduleLayout,
  renderLoading,
  renderError,
  renderEmpty,
  renderTable,
} from "./schedule.view.js";

export async function mountSchedulePage() {
  const page = document.getElementById("page-content");

  try {
    page.innerHTML = `<p class="muted">Loading doctors…</p>`;

    const doctors = await getDoctors();
    const state = getState();

    const selectedDoctorId = state.selectedDoctorId || doctors[0]?.id || "";
    const selectedDate = state.selectedDate;

    setState({ doctors, selectedDoctorId });

    page.innerHTML = renderScheduleLayout({
      doctors,
      selectedDoctorId,
      selectedDate,
    });

    const doctorSelect = document.getElementById("doctorSelect");
    const dateInput = document.getElementById("dateInput");

    doctorSelect.addEventListener("change", () => {
      setState({ selectedDoctorId: doctorSelect.value });
      loadSchedule();
    });

    dateInput.addEventListener("change", () => {
      setState({ selectedDate: dateInput.value });
      loadSchedule();
    });

    loadSchedule();
  } catch (err) {
    page.innerHTML = renderError(
      err?.message || "Failed to load schedule page",
    );
  }
}

async function loadSchedule() {
  const { selectedDoctorId, selectedDate } = getState();
  const box = document.getElementById("scheduleContent");

  if (!box) return;

  if (!selectedDoctorId) {
    box.innerHTML = `<p class="muted">Please select a doctor.</p>`;
    return;
  }

  try {
    box.innerHTML = renderLoading();
    const list = await getSchedule(selectedDoctorId, selectedDate);

    if (!list.length) {
      box.innerHTML = renderEmpty();
      return;
    }

    box.innerHTML = renderTable(list);
  } catch (err) {
    box.innerHTML = renderError(err?.message || "Failed to load schedule");
  }
}
