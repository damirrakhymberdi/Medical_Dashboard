// Initialize default DB if needed and setup clone
const clone = (data) => JSON.parse(JSON.stringify(data));

const TODAY = new Date().toISOString().slice(0, 10);

function delay(ms = 600) {
  return new Promise((res) => setTimeout(res, ms));
}

function maybeFail() {}

// Remove redundant clone function since we defined it at top
// function clone(data) {
//   return structuredClone
//     ? structuredClone(data)
//     : JSON.parse(JSON.stringify(data));
// }

function genId(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

function shiftDate(isoDate, days) {
  const d = new Date(`${isoDate}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function getPatientName(patientId) {
  const p = db.patients.find((x) => x.id === patientId);
  return p ? p.name : "Неизвестно";
}

function validateStatus(status) {
  const allowed = new Set(["scheduled", "arrived", "completed", "cancelled"]);
  if (!allowed.has(status)) throw new Error("Неверный статус записи");
}

function validatePaymentMethod(method) {
  const allowed = new Set(["cash", "card"]);
  if (!allowed.has(method)) throw new Error("Неверный метод оплаты");
}

const initialDb = {
  doctors: [
    { id: "d1", name: "Dr. Smith", specialty: "Терапевт" },
    { id: "d2", name: "Dr. Johnson", specialty: "Стоматолог" },
    { id: "d3", name: "Dr. Lee", specialty: "Кардиолог" },
    { id: "d4", name: "Dr. Nguyen", specialty: "Ортодонт" },
    { id: "d5", name: "Dr. Garcia", specialty: "Хирург" },
    { id: "d6", name: "Dr. Patel", specialty: "Педиатр" },
  ],
  patients: [
    {
      id: "p1",
      name: "Иван Иванов",
      phone: "87001112233",
      birthDate: "2001-04-10",
      createdAt: "2023-03-02",
    },
    {
      id: "p2",
      name: "Анна Петрова",
      phone: "87009998877",
      birthDate: "1998-11-05",
      createdAt: "2023-11-10",
    },
    {
      id: "p3",
      name: "Дамир Алиев",
      phone: "87005556677",
      birthDate: "2005-02-01",
      createdAt: "2024-01-15",
    },
  ],
  appointments: [
    {
      id: "a1",
      doctorId: "d1",
      date: TODAY,
      time: "09:30",
      duration: 30,
      patientId: "p1",
      status: "scheduled",
      visitId: null,
    },
    {
      id: "a2",
      doctorId: "d1",
      date: TODAY,
      time: "10:00",
      duration: 60,
      patientId: "p2",
      status: "arrived",
      visitId: null,
    },
    {
      id: "a3",
      doctorId: "d2",
      date: TODAY,
      time: "11:30",
      duration: 45,
      patientId: "p3",
      status: "scheduled",
      visitId: null,
    },
    {
      id: "a5",
      doctorId: "d2",
      date: TODAY,
      time: "09:00",
      duration: 30,
      patientId: "p1",
      status: "completed",
      visitId: null,
    },
    {
      id: "a6",
      doctorId: "d3",
      date: TODAY,
      time: "10:30",
      duration: 90,
      patientId: "p2",
      status: "arrived",
      visitId: null,
    },
    {
      id: "a7",
      doctorId: "d1",
      date: TODAY,
      time: "14:00",
      duration: 45,
      patientId: "p3",
      status: "scheduled",
      visitId: null,
    },
    {
      id: "a8",
      doctorId: "d3",
      date: TODAY,
      time: "13:00",
      duration: 60,
      patientId: "p1",
      status: "cancelled",
      visitId: null,
    },
    {
      id: "a9",
      doctorId: "d4",
      date: TODAY,
      time: "08:30",
      duration: 30,
      patientId: "p3",
      status: "scheduled",
      visitId: null,
    },
    {
      id: "a10",
      doctorId: "d5",
      date: TODAY,
      time: "12:00",
      duration: 60,
      patientId: "p1",
      status: "arrived",
      visitId: null,
    },
    {
      id: "a11",
      doctorId: "d6",
      date: TODAY,
      time: "09:00",
      duration: 45,
      patientId: "p2",
      status: "completed",
      visitId: null,
    },
    {
      id: "a4",
      doctorId: "d1",
      date: shiftDate(TODAY, -1),
      time: "15:00",
      duration: 30,
      patientId: "p3",
      status: "completed",
      visitId: "v1",
    },
  ],
  visits: [
    {
      id: "v1",
      appointmentId: "a4",
      doctorId: "d1",
      patientId: "p3",
      startedAt: `${shiftDate(TODAY, -1)}T15:00:00`,
      finishedAt: `${shiftDate(TODAY, -1)}T15:25:00`,
      complaint: "Зубная боль",
      diagnosis: "Кариес",
      notes: "Рекомендована консультация стоматолога",
      isFinal: true,
    },
  ],
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
  inventory: [
    { id: "inv1", name: "Имплант Straumann BLT", category: "Имплантология", quantity: 15, unit: "шт", minQuantity: 5 },
    { id: "inv2", name: "Ultracain D-S forte 1.7ml", category: "Анестезия", quantity: 120, unit: "амп", minQuantity: 50 },
    { id: "inv3", name: "Filtek Z250 (шприц)", category: "Терапия", quantity: 8, unit: "шт", minQuantity: 3 },
    { id: "inv4", name: "Слепочная масса Speedex", category: "Ортопедия", quantity: 4, unit: "упак", minQuantity: 2 },
    { id: "inv5", name: "Перчатки смотровые (M)", category: "Расходники", quantity: 45, unit: "упак", minQuantity: 10 },
  ],
  users: [
    { id: "u1", name: "Алексей Владельцев", phone: "87001234567", email: "owner@clinic.kz", role: "owner", isActive: true, createdAt: "2023-01-01" },
    { id: "u2", name: "Мария Админова", phone: "87007654321", email: "admin@clinic.kz", role: "admin", isActive: true, createdAt: "2023-02-15" },
    { id: "u3", name: "Дмитрий Врачев", phone: "87005551234", email: "doctor@clinic.kz", role: "doctor", isActive: true, createdAt: "2023-03-10" },
  ],
};

function getDb() {
  let data;
  if (typeof localStorage !== "undefined") {
    const saved = localStorage.getItem("medimetrics_db");
    data = saved ? JSON.parse(saved) : clone(initialDb);
  } else {
    data = clone(initialDb);
  }
  if (!Array.isArray(data.users)) data.users = clone(initialDb.users);
  return data;
}

function saveDb() {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("medimetrics_db", JSON.stringify(db));
  }
}

const db = getDb();

export async function login(phone, password) {
  await delay(800);
  const cleanPhone = String(phone || "").replace(/\D/g, "");
  if (cleanPhone.length < 10) throw new Error("Неверный номер телефона");
  
  if (password === "1234" || password === "owner")
    return { role: "owner", phone: cleanPhone, name: "Владелец" };
  if (password === "admin")
    return { role: "admin", phone: cleanPhone, name: "Админ" };
  if (password === "doctor")
    return { role: "doctor", phone: cleanPhone, name: "Врач" };
  if (password === "patient")
    return { role: "patient", phone: cleanPhone, name: "Пациент" };
    
  throw new Error("Неверный пароль. Попробуйте: 1234, admin, doctor или patient");
}

export async function getDoctors() {
  await delay();
  return clone(db.doctors);
}

export async function getSchedule(doctorId, date) {
  await delay();
  if (!doctorId) throw new Error("Выберите врача");
  if (!date) throw new Error("Выберите дату");
  const list = db.appointments
    .filter((a) => a.doctorId === doctorId && a.date === date)
    .sort((a, b) => a.time.localeCompare(b.time))
    .map((a) => ({ ...a, patientName: getPatientName(a.patientId) }));
  return clone(list);
}

export async function createAppointment(data) {
  await delay();
  const doctorId = String(data?.doctorId || "");
  const patientId = String(data?.patientId || "");
  const date = String(data?.date || "");
  const time = String(data?.time || "");
  const duration = Number(data?.duration) || 30;
  if (!doctorId) throw new Error("Выберите врача");
  if (!patientId) throw new Error("Выберите пациента");
  if (!date) throw new Error("Выберите дату");
  if (!time) throw new Error("Выберите время");
  const appt = {
    id: genId("a"),
    doctorId,
    patientId,
    date,
    time,
    duration,
    status: "scheduled",
    visitId: null,
  };
  db.appointments.push(appt);
  saveDb();
  return clone({ ...appt, patientName: getPatientName(patientId) });
}

export async function searchPatients(query = "") {
  await delay();
  const q = String(query).trim().toLowerCase();
  
  // Create an array of patients
  const patientsArray = Array.isArray(db.patients) ? db.patients : [];
  
  const list = patientsArray
    .filter(
      (p) =>
        !q || p.name.toLowerCase().includes(q) || String(p.phone).includes(q),
    )
    .sort((a, b) => {
        // Сортировка по дате регистрации по убыванию (сначала новые)
        const dateA = new Date(a.createdAt || "2000-01-01");
        const dateB = new Date(b.createdAt || "2000-01-01");
        if (dateB > dateA) return 1;
        if (dateB < dateA) return -1;
        return a.name.localeCompare(b.name);
    });
  return clone(list);
}

export async function getPatientById(id) {
  await delay(350);
  const p = db.patients.find((x) => x.id === id);
  if (!p) throw new Error("Пациент не найден");
  
  // Добавляем динамические данные для вкладки "Лечение" и "Визиты" на основе расписания и визитов
  const patientVisits = db.visits.filter(v => v.patientId === id);
  const patientAppointments = db.appointments.filter(a => a.patientId === id);
  
  const formattedTreatments = patientVisits.map(v => {
    const doctor = db.doctors.find(d => d.id === v.doctorId);
    const appt = db.appointments.find(a => a.id === v.appointmentId);
    return {
      procedure: v.diagnosis || "Лечение", // Для демо используем диагноз как процедуру
      diagnosis: v.complaint || "Без диагноза",
      doctor: doctor ? doctor.name : "Неизвестный врач",
      date: appt ? appt.date : "Неизвестная дата",
      cost: "15 000", // Заглушка, можно брать из payments
      aiSummary: v.notes || "AI резюме не сформировано."
    };
  });

  const formattedVisits = patientAppointments.map(a => {
    const doctor = db.doctors.find(d => d.id === a.doctorId);
    return {
      date: a.date,
      time: a.time,
      type: "Прием специалиста", // Заглушка
      doctor: doctor ? doctor.name : "Неизвестный врач",
      status: a.status === 'completed' ? 'Завершен' : 'Запланирован'
    };
  });

  const fullPatientData = {
    ...p,
    treatments: formattedTreatments,
    visits: formattedVisits
  };
  
  return clone(fullPatientData);
}

export async function createPatient(data) {
  await delay();
  const name = String(data?.name || "").trim();
  const phone = String(data?.phone || "").replace(/\D/g, "");
  const birthDate = data?.birthDate ? String(data.birthDate) : "";
  if (name.length < 2) throw new Error("Имя слишком короткое");
  if (phone.length < 10) throw new Error("Неверный номер телефона");
  if (db.patients.some((p) => p.phone === phone))
    throw new Error("Пациент с таким телефоном уже существует");
  const newPatient = { 
    id: genId("p"), 
    name, 
    phone, 
    birthDate,
    createdAt: TODAY // сохраняем дату регистрации
  };
  db.patients.push(newPatient);
  saveDb();
  return clone(newPatient);
}

export async function updatePatient(id, patch) {
  await delay();
  const p = db.patients.find((x) => x.id === id);
  if (!p) throw new Error("Пациент не найден");
  const name = patch?.name !== undefined ? String(patch.name).trim() : p.name;
  const phone =
    patch?.phone !== undefined
      ? String(patch.phone).replace(/\D/g, "")
      : p.phone;
  const birthDate =
    patch?.birthDate !== undefined
      ? String(patch.birthDate || "")
      : p.birthDate;
  if (name.length < 2) throw new Error("Имя слишком короткое");
  if (phone.length < 10) throw new Error("Неверный номер телефона");
  if (
    phone !== p.phone &&
    db.patients.some((x) => x.phone === phone && x.id !== id)
  ) {
    throw new Error("Этот телефон уже используется другим пациентом");
  }
  p.name = name;
  p.phone = phone;
  p.birthDate = birthDate;
  saveDb();
  return clone(p);
}

export async function updateAppointmentStatus(appointmentId, status) {
  await delay(450);
  validateStatus(status);
  const appt = db.appointments.find((a) => a.id === appointmentId);
  if (!appt) throw new Error("Запись не найдена");
  if (status === "completed" && !appt.visitId)
    throw new Error("Нельзя завершить без визита");
  appt.status = status;
  saveDb();
  return clone(appt);
}

export async function startVisit(appointmentId) {
  await delay(700);
  const appt = db.appointments.find((a) => a.id === appointmentId);
  if (!appt) throw new Error("Запись не найдена");
  if (appt.status === "cancelled") throw new Error("Запись отменена");
  if (appt.status === "completed") throw new Error("Визит уже завершён");
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
  if (appt.status === "scheduled") appt.status = "arrived";
  saveDb();
  return clone(visit);
}

export async function finishVisit(appointmentId, visitData) {
  await delay(800);
  const appt = db.appointments.find((a) => a.id === appointmentId);
  if (!appt) throw new Error("Запись не найдена");
  if (!appt.visitId) throw new Error("Визит не начат");
  const visit = db.visits.find((v) => v.id === appt.visitId);
  if (!visit) throw new Error("Визит не найден");
  if (visit.isFinal) throw new Error("Визит уже завершён");
  const complaint = String(visitData?.complaint || "").trim();
  const diagnosis = String(visitData?.diagnosis || "").trim();
  const notes = String(visitData?.notes || "").trim();
  if (complaint.length < 2) throw new Error("Введите жалобу пациента");
  if (diagnosis.length < 2) throw new Error("Введите диагноз");
  visit.complaint = complaint;
  visit.diagnosis = diagnosis;
  visit.notes = notes;
  visit.isFinal = true;
  visit.finishedAt = new Date().toISOString();
  appt.status = "completed";

  // AI Автосписание со склада
  if (db.inventory) {
    const textToAnalyze = (notes + " " + diagnosis).toLowerCase();
    
    // Простой парсер для демо-целей
    if (textToAnalyze.includes("имплант") || textToAnalyze.includes("straumann")) {
      const item = db.inventory.find(i => i.name.toLowerCase().includes("straumann"));
      if (item && item.quantity > 0) item.quantity -= 1;
    }
    
    if (textToAnalyze.includes("пломб") || textToAnalyze.includes("filtek")) {
      const item = db.inventory.find(i => i.name.toLowerCase().includes("filtek"));
      if (item && item.quantity > 0) item.quantity -= 1;
    }

    if (textToAnalyze.includes("анестези") || textToAnalyze.includes("ultracain")) {
      const item = db.inventory.find(i => i.name.toLowerCase().includes("ultracain"));
      if (item && item.quantity > 0) item.quantity -= 1;
    }
  }

  saveDb();
  return clone(visit);
}

export async function createPayment(data) {
  await delay(650);
  const amount = Number(data?.amount);
  const method = String(data?.method || "");
  const patientId = String(data?.patientId || "");
  const visitId = data?.visitId ? String(data.visitId) : null;
  if (!Number.isFinite(amount) || amount <= 0)
    throw new Error("Сумма должна быть больше 0");
  validatePaymentMethod(method);
  if (!patientId) throw new Error("Выберите пациента");
  const payment = {
    id: genId("pay"),
    date: data?.date ? String(data.date) : TODAY,
    time: new Date().toTimeString().slice(0, 5),
    patientId,
    visitId,
    amount,
    method,
  };
  db.payments.push(payment);
  saveDb();
  return clone(payment);
}

export async function getPaymentsByDate(date) {
  await delay(450);
  if (!date) throw new Error("Выберите дату");
  const list = db.payments
    .filter((p) => p.date === date)
    .sort((a, b) => a.time.localeCompare(b.time))
    .map((p) => ({ ...p, patientName: getPatientName(p.patientId) }));
  return clone(list);
}

export async function getDayReport(date) {
  await delay(700);
  if (!date) throw new Error("Выберите дату");
  const payments = await getPaymentsByDate(date);
  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const visitsCompleted = db.appointments.filter(
    (a) => a.date === date && a.status === "completed",
  ).length;
  return clone({ date, payments, totalAmount, visitsCompleted });
}

export async function getInventoryItems() {
  await delay(400);
  // Return sorted by category then name
  const list = (db.inventory || []).sort((a, b) => {
    if (a.category < b.category) return -1;
    if (a.category > b.category) return 1;
    return a.name.localeCompare(b.name);
  });
  return clone(list);
}

export async function addInventoryItem(data) {
  await delay(500);
  const name = String(data?.name || "").trim();
  const category = String(data?.category || "").trim();
  const quantity = Number(data?.quantity) || 0;
  const minQuantity = Number(data?.minQuantity) || 0;
  const unit = String(data?.unit || "шт").trim();

  if (name.length < 2) throw new Error("Название слишком короткое");
  if (!category) throw new Error("Укажите категорию");

  const newItem = {
    id: genId("inv"),
    name,
    category,
    quantity,
    minQuantity,
    unit
  };

  if (!db.inventory) db.inventory = [];
  db.inventory.push(newItem);
  saveDb();
  return clone(newItem);
}

export async function updateInventoryQuantity(id, delta) {
  await delay(300);
  if (!db.inventory) db.inventory = [];
  const item = db.inventory.find(x => x.id === id);
  if (!item) throw new Error("Материал не найден");
  
  const newQty = item.quantity + delta;
  if (newQty < 0) throw new Error("Недостаточно на складе");
  
  item.quantity = newQty;
  saveDb();
  return clone(item);
}

// ——— Пользователи (staff) ———
const ROLES = ["owner", "admin", "doctor"];

export async function getUsers(query = "") {
  await delay(350);
  const q = String(query).trim().toLowerCase();
  const list = (db.users || [])
    .filter(u => !q || u.name.toLowerCase().includes(q) || String(u.phone).includes(q) || (u.email || "").toLowerCase().includes(q))
    .sort((a, b) => (a.role === "owner" ? -1 : b.role === "owner" ? 1 : 0) || a.name.localeCompare(b.name));
  return clone(list);
}

export async function createUser(data) {
  await delay(400);
  const name = String(data?.name || "").trim();
  const phone = String(data?.phone || "").replace(/\D/g, "");
  const email = String(data?.email || "").trim();
  const role = ROLES.includes(data?.role) ? data.role : "admin";
  if (name.length < 2) throw new Error("Имя слишком короткое");
  if (phone.length < 10) throw new Error("Неверный номер телефона");
  if (db.users.some(u => u.phone === phone)) throw new Error("Пользователь с таким телефоном уже есть");
  const newUser = {
    id: genId("u"),
    name,
    phone,
    email,
    role,
    isActive: true,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  db.users.push(newUser);
  saveDb();
  return clone(newUser);
}

export async function updateUser(id, patch) {
  await delay(400);
  const u = db.users.find(x => x.id === id);
  if (!u) throw new Error("Пользователь не найден");
  if (patch.name !== undefined) u.name = String(patch.name).trim();
  if (patch.phone !== undefined) u.phone = String(patch.phone).replace(/\D/g, "");
  if (patch.email !== undefined) u.email = String(patch.email).trim();
  if (patch.role !== undefined && ROLES.includes(patch.role)) u.role = patch.role;
  if (patch.isActive !== undefined) u.isActive = !!patch.isActive;
  if (u.name.length < 2) throw new Error("Имя слишком короткое");
  if (u.phone.length < 10) throw new Error("Неверный номер телефона");
  saveDb();
  return clone(u);
}
