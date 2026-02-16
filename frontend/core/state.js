// core/state.js
const state = {
  user: null, // кейін auth-та толтырылады
  selectedDoctorId: "",
  selectedDate: new Date().toISOString().slice(0, 10),

  doctors: [],
  appointments: [],
  patients: [],
  payments: [],
};

const listeners = new Set();

export function getState() {
  return state;
}

export function setState(patch) {
  Object.assign(state, patch);
  listeners.forEach((fn) => fn(state));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
