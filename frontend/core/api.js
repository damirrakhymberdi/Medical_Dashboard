// core/api.js
// Mock backend (in-memory DB) with delay + random errors.
// Later you can replace internals with real fetch() calls without touching UI logic.

const TODAY = new Date().toISOString().slice(0, 10); // e.g. "2026-02-16" (depends on user's system time)

// ---------- helpers ----------
function delay(ms = 600) {
  return new Promise((res) => setTimeout(res, ms));
}

function maybeFail(chance = 0.1) {
  if (Math.random() < chance)
    throw new Error("Network error. Please try again.");
}

function clone(data) {
  // prevents UI from mutating "DB" objects accidentally
  return structuredClone
    ? structuredClone(data)
    : JSON.parse(JSON.stringify(data));
}

function genId(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

// ---------- "DB" ----------
const db = {
  doctors: [
    { id: "d1", name: "Dr. Smith", specialty: "Therapist" },
    { id: "d2", name: "Dr. Johnson", specialty: "Dentist" },
    { id: "d3", name: "Dr. Lee", specialty: "Cardiologist" },
  ],

  patients: [
    {
      id: "p1",
      name: "John Doe",
      phone: "87001112233",
      birthDate: "2001-04-10",
    },
    {
      id: "p2",
      name: "Anna Ivanova",
      phone: "87009998877",
      birthDate: "1998-11-05",
    },
    {
      id: "p3",
      name: "Damir A.",
      phone: "87005556677",
      birthDate: "2005-02-01",
    },
  ],

  // Appointments = schedule items
  // status: scheduled | arrived | completed | cancelled
  appointments: [
    {
      id: "a1",
      doctorId: "d1",
      date: TODAY,
      time: "09:30",
      patientId: "p1",
      status: "scheduled",
      visitId: null,
    },
    {
      id: "a2",
      doctorId: "d1",
      date: TODAY,
      time: "10:00",
      patientId: "p2",
      status: "arrived",
      visitId: null,
    },
    {
      id: "a3",
      doctorId: "d2",
      date: TODAY,
      time: "11:30",
      patientId: "p3",
      status: "scheduled",
      visitId: null,
    },

    // yesterday example (for date switching)
    {
      id: "a4",
      doctorId: "d1",
      date: shiftDate(TODAY, -1),
      time: "15:00",
      patientId: "p3",
      status: "completed",
      visitId: "v1",
    },
  ],

  // Visits linked to appointmentId
  visits: [
    {
      id: "v1",
      appointmentId: "a4",
      doctorId: "d1",
      patientId: "p3",
      startedAt: `${shiftDate(TODAY, -1)}T15:00:00`,
      finishedAt: `${shiftDate(TODAY, -1)}T15:25:00`,
      complaint: "Toothache",
      diagnosis: "Caries",
      notes: "Recommended dentist consult",
      isFinal: true,
    },
  ],

  // Payments may link to visitId / patientId
  payments: [
    {
      id: "pay1",
      date: shiftDate(TODAY, -1),
      time: "15:30",
      patientId: "p3",
      visitId: "v1",
      amount: 5000,
      method: "cash",
    },
  ],
};

// helper to shift ISO date string by N days
function shiftDate(isoDate, days) {
  const d = new Date(`${isoDate}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function getPatientName(patientId) {
  const p = db.patients.find((x) => x.id === patientId);
  return p ? p.name : "Unknown";
}

function validateStatus(status) {
  const allowed = new Set(["scheduled", "arrived", "completed", "cancelled"]);
  if (!allowed.has(status)) throw new Error("Invalid appointment status");
}

function validatePaymentMethod(method) {
  const allowed = new Set(["cash", "card"]);
  if (!allowed.has(method)) throw new Error("Invalid payment method");
}

// ---------- API ----------
/**
 * AUTH
 */
export async function login(phone, password) {
  await delay(800);
  maybeFail(0.1);

  const cleanPhone = String(phone || "").replace(/\D/g, "");
  if (cleanPhone.length < 10) throw new Error("Phone number is invalid");

  // demo rule:
  // password "1234" -> operator
  // password "doctor" -> doctor
  if (password === "1234")
    return { role: "operator", phone: cleanPhone, name: "Operator" };
  if (password === "doctor")
    return { role: "doctor", phone: cleanPhone, name: "Doctor" };

  throw new Error("Invalid credentials");
}

/**
 * DOCTORS
 */
export async function getDoctors() {
  await delay();
  maybeFail(0.08);
  return clone(db.doctors);
}

/**
 * SCHEDULE
 * Returns appointments for doctor/date with expanded patientName (handy for UI)
 */
export async function getSchedule(doctorId, date) {
  await delay();
  maybeFail(0.12);

  if (!doctorId) throw new Error("Select a doctor");
  if (!date) throw new Error("Select a date");

  const list = db.appointments
    .filter((a) => a.doctorId === doctorId && a.date === date)
    .sort((a, b) => a.time.localeCompare(b.time))
    .map((a) => ({
      ...a,
      patientName: getPatientName(a.patientId),
    }));

  return clone(list);
}

/**
 * PATIENTS
 */
export async function searchPatients(query = "") {
  await delay();
  maybeFail(0.1);

  const q = String(query).trim().toLowerCase();
  const list = db.patients
    .filter((p) => {
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || String(p.phone).includes(q);
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return clone(list);
}

export async function getPatientById(id) {
  await delay(350);
  maybeFail(0.08);

  const p = db.patients.find((x) => x.id === id);
  if (!p) throw new Error("Patient not found");
  return clone(p);
}

export async function createPatient(data) {
  await delay();
  maybeFail(0.12);

  const name = String(data?.name || "").trim();
  const phone = String(data?.phone || "").replace(/\D/g, "");
  const birthDate = data?.birthDate ? String(data.birthDate) : "";

  if (name.length < 2) throw new Error("Patient name is too short");
  if (phone.length < 10) throw new Error("Patient phone is invalid");

  // simple unique phone check
  const exists = db.patients.some((p) => p.phone === phone);
  if (exists) throw new Error("Patient with this phone already exists");

  const newPatient = { id: genId("p"), name, phone, birthDate };
  db.patients.push(newPatient);

  return clone(newPatient);
}

export async function updatePatient(id, patch) {
  await delay();
  maybeFail(0.12);

  const p = db.patients.find((x) => x.id === id);
  if (!p) throw new Error("Patient not found");

  const name = patch?.name !== undefined ? String(patch.name).trim() : p.name;
  const phone =
    patch?.phone !== undefined
      ? String(patch.phone).replace(/\D/g, "")
      : p.phone;
  const birthDate =
    patch?.birthDate !== undefined
      ? String(patch.birthDate || "")
      : p.birthDate;

  if (name.length < 2) throw new Error("Patient name is too short");
  if (phone.length < 10) throw new Error("Patient phone is invalid");

  // unique phone if changed
  if (phone !== p.phone) {
    const exists = db.patients.some((x) => x.phone === phone && x.id !== id);
    if (exists) throw new Error("Another patient already uses this phone");
  }

  p.name = name;
  p.phone = phone;
  p.birthDate = birthDate;

  return clone(p);
}

/**
 * VISITS
 * startVisit creates/returns a visit linked to appointment
 * finishVisit finalizes + locks visit and marks appointment completed
 */
export async function startVisit(appointmentId) {
  await delay(700);
  maybeFail(0.12);

  const appt = db.appointments.find((a) => a.id === appointmentId);
  if (!appt) throw new Error("Appointment not found");

  if (appt.status === "cancelled") throw new Error("Cancelled appointment");
  if (appt.status === "completed") throw new Error("Visit already completed");

  // If visit already exists, just return it
  if (appt.visitId) {
    const existing = db.visits.find((v) => v.id === appt.visitId);
    if (existing) return clone(existing);
  }

  const visit = {
    id: genId("v"),
    appointmentId: appt.id,
    doctorId: appt.doctorId,
    patientId: appt.patientId,
    startedAt: `${appt.date}T${appt.time}:00`,
    finishedAt: null,
    complaint: "",
    diagnosis: "",
    notes: "",
    isFinal: false,
  };

  db.visits.push(visit);
  appt.visitId = visit.id;

  // Optionally move status to "arrived" when visit starts
  if (appt.status === "scheduled") appt.status = "arrived";

  return clone(visit);
}

export async function finishVisit(appointmentId, visitData) {
  await delay(800);
  maybeFail(0.12);

  const appt = db.appointments.find((a) => a.id === appointmentId);
  if (!appt) throw new Error("Appointment not found");

  if (!appt.visitId) throw new Error("Visit not started");

  const visit = db.visits.find((v) => v.id === appt.visitId);
  if (!visit) throw new Error("Visit not found");

  if (visit.isFinal) throw new Error("Visit already finalized");

  const complaint = String(visitData?.complaint || "").trim();
  const diagnosis = String(visitData?.diagnosis || "").trim();
  const notes = String(visitData?.notes || "").trim();

  // minimal validation (you can make stricter)
  if (complaint.length < 2) throw new Error("Complaint is required");
  if (diagnosis.length < 2) throw new Error("Diagnosis is required");

  visit.complaint = complaint;
  visit.diagnosis = diagnosis;
  visit.notes = notes;
  visit.isFinal = true;
  visit.finishedAt = new Date().toISOString();

  appt.status = "completed"; // important requirement

  return clone(visit);
}

/**
 * APPOINTMENT STATUS UPDATE (optional, handy)
 */
export async function updateAppointmentStatus(appointmentId, status) {
  await delay(450);
  maybeFail(0.12);

  validateStatus(status);

  const appt = db.appointments.find((a) => a.id === appointmentId);
  if (!appt) throw new Error("Appointment not found");

  // basic rule: if completed -> must have visit
  if (status === "completed" && !appt.visitId) {
    throw new Error("Cannot complete without a visit");
  }

  appt.status = status;
  return clone(appt);
}

/**
 * PAYMENTS
 */
export async function createPayment(data) {
  await delay(650);
  maybeFail(0.12);

  const amount = Number(data?.amount);
  const method = String(data?.method || "");
  const patientId = String(data?.patientId || "");
  const visitId = data?.visitId ? String(data.visitId) : null;

  if (!Number.isFinite(amount) || amount <= 0)
    throw new Error("Amount must be > 0");
  validatePaymentMethod(method);
  if (!patientId) throw new Error("Patient is required");

  const payment = {
    id: genId("pay"),
    date: data?.date ? String(data.date) : TODAY,
    time: new Date().toTimeString().slice(0, 5), // "HH:MM"
    patientId,
    visitId,
    amount,
    method, // cash | card
  };

  db.payments.push(payment);
  return clone(payment);
}

export async function getPaymentsByDate(date) {
  await delay(450);
  maybeFail(0.1);

  if (!date) throw new Error("Date is required");

  const list = db.payments
    .filter((p) => p.date === date)
    .sort((a, b) => a.time.localeCompare(b.time))
    .map((p) => ({
      ...p,
      patientName: getPatientName(p.patientId),
    }));

  return clone(list);
}

/**
 * DAY REPORT
 * - list of payments for date
 * - total sum
 * - completed visits count (appointments completed for date)
 */
export async function getDayReport(date) {
  await delay(700);
  maybeFail(0.12);

  if (!date) throw new Error("Date is required");

  const payments = await getPaymentsByDate(date);

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

  const visitsCompleted = db.appointments.filter(
    (a) => a.date === date && a.status === "completed",
  ).length;

  return clone({
    date,
    payments,
    totalAmount,
    visitsCompleted,
  });
}

/**
 * Debug helpers (optional)
 * Useful during dev to see what's inside DB.
 * Remove later if you want.
 */
export async function __debugDump() {
  await delay(150);
  return clone(db);
}
