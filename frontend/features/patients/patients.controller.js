// features/patients/patients.controller.js
import {
  searchPatients,
  createPatient,
  updatePatient,
  getPatientById,
} from "../../core/api.js";
import { getState, setState } from "../../core/state.js";
import { openModal, closeModal } from "../../ui/modal.js";
import {
  renderPatientsPage,
  renderLoading,
  renderError,
  renderEmpty,
  renderPatientsTable,
  renderPatientForm,
  renderPatientCard,
} from "./patients.view.js";

let searchTimer = null;

export function mountPatientsPage() {
  const page = document.getElementById("page-content");
  page.innerHTML = renderPatientsPage();

  const searchInput = document.getElementById("patientSearch");
  const createBtn = document.getElementById("createPatientBtn");
  const stateBox = document.getElementById("patientsState");
  const tableBox = document.getElementById("patientsTable");

  // Initial load
  loadPatients("");

  // Debounced search
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    const q = searchInput.value;
    searchTimer = setTimeout(() => loadPatients(q), 250);
  });

  // Create
  createBtn.addEventListener("click", () => openCreateModal());

  // Actions in table (event delegation)
  tableBox.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const action = btn.dataset.action;
    const id = btn.dataset.id;

    if (action === "view") openViewModal(id);
    if (action === "edit") openEditModal(id);
  });

  async function loadPatients(query) {
    try {
      stateBox.innerHTML = renderLoading("Loading patients…");
      tableBox.innerHTML = "";

      const list = await searchPatients(query);
      setState({ patients: list });

      if (!list.length) {
        stateBox.innerHTML = renderEmpty();
        return;
      }

      stateBox.innerHTML = "";
      tableBox.innerHTML = renderPatientsTable(list);
    } catch (err) {
      stateBox.innerHTML = renderError(
        err?.message || "Failed to load patients",
      );
      tableBox.innerHTML = "";
    }
  }

  function openCreateModal() {
    openModal({
      title: "Create patient",
      content: renderPatientForm({ mode: "create", patient: null }),
    });

    const form = document.getElementById("patientForm");
    const cancel = document.getElementById("cancelPatientForm");
    const saveBtn = document.getElementById("savePatientBtn");
    const errBox = document.getElementById("patientFormError");

    cancel.addEventListener("click", closeModal);

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      errBox.textContent = "";

      saveBtn.disabled = true;
      const old = saveBtn.textContent;
      saveBtn.textContent = "Creating…";

      try {
        const fd = new FormData(form);
        const data = {
          name: fd.get("name"),
          phone: fd.get("phone"),
          birthDate: fd.get("birthDate"),
        };

        await createPatient(data);
        closeModal();

        // reload list with current query
        loadPatients(searchInput.value);
      } catch (err) {
        errBox.textContent = err?.message || "Create failed";
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = old;
      }
    });
  }

  async function openEditModal(patientId) {
    openModal({
      title: "Edit patient",
      content: renderLoading("Loading patient…"),
    });

    try {
      const patient = await getPatientById(patientId);

      // replace modal body with form
      openModal({
        title: "Edit patient",
        content: renderPatientForm({ mode: "edit", patient }),
      });

      const form = document.getElementById("patientForm");
      const cancel = document.getElementById("cancelPatientForm");
      const saveBtn = document.getElementById("savePatientBtn");
      const errBox = document.getElementById("patientFormError");

      cancel.addEventListener("click", closeModal);

      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        errBox.textContent = "";

        saveBtn.disabled = true;
        const old = saveBtn.textContent;
        saveBtn.textContent = "Saving…";

        try {
          const fd = new FormData(form);
          const patch = {
            name: fd.get("name"),
            phone: fd.get("phone"),
            birthDate: fd.get("birthDate"),
          };

          await updatePatient(patientId, patch);
          closeModal();

          loadPatients(searchInput.value);
        } catch (err) {
          errBox.textContent = err?.message || "Save failed";
        } finally {
          saveBtn.disabled = false;
          saveBtn.textContent = old;
        }
      });
    } catch (err) {
      openModal({
        title: "Edit patient",
        content: renderError(err?.message || "Failed to load patient"),
      });
    }
  }

  async function openViewModal(patientId) {
    openModal({ title: "Patient card", content: renderLoading("Loading…") });

    try {
      const patient = await getPatientById(patientId);
      openModal({ title: "Patient card", content: renderPatientCard(patient) });
    } catch (err) {
      openModal({
        title: "Patient card",
        content: renderError(err?.message || "Failed to load patient"),
      });
    }
  }
}
