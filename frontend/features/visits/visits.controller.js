// features/visits/visits.controller.js
import {
  getSchedule,
  startVisit,
  finishVisit,
  getDoctors,
} from "../../core/api.js";
import { getState, setState } from "../../core/state.js";
import {
  renderVisitPageShell,
  renderVisitLoading,
  renderVisitError,
  renderVisitForm,
} from "./visits.view.js";

export async function mountVisitPage() {
  const page = document.getElementById("page-content");
  page.innerHTML = renderVisitPageShell();

  const card = document.getElementById("visitCard");
  card.innerHTML = renderVisitLoading("Loading appointment…");

  try {
    const apptId = getIdFromHash();
    if (!apptId) throw new Error("Appointment id is missing");

    // We need appointment details.
    // Easiest way: load schedule for current selected doctor/date, then find appointment.
    // If not found (maybe different doctor/date), we load doctors and try all for selectedDate.
    const appointment = await findAppointmentById(apptId);
    if (!appointment) throw new Error("Appointment not found");

    // visit can be null until started
    const visit = appointment.visitId ? { id: appointment.visitId } : null;

    // render initial form
    render(appointment, null, false);

    // handlers
    document
      .getElementById("backToScheduleBtn")
      ?.addEventListener("click", () => {
        window.location.hash = "#schedule";
      });

    document
      .getElementById("startVisitBtn")
      ?.addEventListener("click", async () => {
        const startBtn = document.getElementById("startVisitBtn");
        startBtn.disabled = true;

        try {
          card.innerHTML = renderVisitLoading("Starting visit…");
          const v = await startVisit(appointment.id);

          // refresh appointment to update status/visitId
          const refreshed = await findAppointmentById(appointment.id);
          render(refreshed, v, v.isFinal);
        } catch (err) {
          card.innerHTML = renderVisitError(
            err?.message || "Failed to start visit",
          );
          // rerender again
          const refreshed = await findAppointmentById(appointment.id);
          render(refreshed, null, false);
        }
      });

    document
      .getElementById("visitForm")
      ?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const errBox = document.getElementById("visitError");
        errBox.textContent = "";

        const finishBtn = document.getElementById("finishVisitBtn");
        finishBtn.disabled = true;
        const old = finishBtn.textContent;
        finishBtn.textContent = "Finishing…";

        try {
          const fd = new FormData(e.target);
          const payload = {
            complaint: fd.get("complaint"),
            diagnosis: fd.get("diagnosis"),
            notes: fd.get("notes"),
          };

          const v = await finishVisit(appointment.id, payload);

          const refreshed = await findAppointmentById(appointment.id);
          render(refreshed, v, true);
        } catch (err) {
          errBox.textContent = err?.message || "Finish failed";
        } finally {
          finishBtn.textContent = old;
          // if success we re-rendered locked form, so enable is not needed.
          finishBtn.disabled = false;
        }
      });
  } catch (err) {
    card.innerHTML = renderVisitError(
      err?.message || "Failed to load visit page",
    );
  }

  function render(appointment, visit, isFinal) {
    card.innerHTML = renderVisitForm({ appointment, visit, isFinal });
  }
}

function getIdFromHash() {
  const hash = window.location.hash || "";
  const qs = hash.split("?")[1] || "";
  const params = new URLSearchParams(qs);
  return params.get("id");
}

// Tries to find appointment by scanning schedules.
// For mock it is enough.
async function findAppointmentById(appointmentId) {
  const state = getState();

  // ensure doctors exist
  let doctors = state.doctors;
  if (!doctors || !doctors.length) {
    doctors = await getDoctors();
    setState({ doctors });
  }

  const date = state.selectedDate;

  // try selectedDoctor first
  if (state.selectedDoctorId) {
    const list = await getSchedule(state.selectedDoctorId, date);
    const found = list.find((a) => a.id === appointmentId);
    if (found) return found;
  }

  // scan all doctors for selected date
  for (const d of doctors) {
    const list = await getSchedule(d.id, date);
    const found = list.find((a) => a.id === appointmentId);
    if (found) return found;
  }

  return null;
}
