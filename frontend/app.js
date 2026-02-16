import { getState, setState } from "./core/state.js";
import { renderAuthPage } from "./features/auth/auth.view.js";
import { mountAuthPage } from "./features/auth/auth.controller.js";

import { mountSchedulePage } from "./features/schedule/schedule.controller.js";
import { mountPatientsPage } from "./features/patients/patients.controller.js";
import { mountVisitPage } from "./features/visits/visits.controller.js";
import { mountPaymentsPage } from "./features/payments/payments.controller.js";
import { mountReportPage } from "./features/report/report.controller.js";

/* =========================
   1) Layout (App Shell)
   ========================= */
const app = document.getElementById("app");

function renderLayout() {
  app.innerHTML = `
    <div class="layout">
      <aside class="sidebar">
        <div class="logo">MediMetrics</div>

        <nav class="menu" id="menu">
          <a href="#schedule" class="menu-item" data-route="schedule">Schedule</a>
          <a href="#patients" class="menu-item" data-route="patients">Patients</a>
          <a href="#payments" class="menu-item" data-route="payments">Payments</a>
          <a href="#report" class="menu-item" data-route="report">Report</a>
        </nav>
      </aside>

      <div class="main">
        <header class="header">
          <input id="globalSearch" type="text" placeholder="Search..." />
          <div style="display:flex; align-items:center; gap:10px;">
            <div class="user" id="userBox">Guest</div>
            <button class="btn btn-secondary" id="logoutBtn" type="button">Logout</button>
          </div>
        </header>

        <main class="content" id="page-content"></main>
      </div>
    </div>
  `;
}

/* =========================
   2) Helpers
   ========================= */
function setActiveMenu(route) {
  const links = document.querySelectorAll(".menu-item");
  links.forEach((a) => a.classList.toggle("active", a.dataset.route === route));
}

function setHeaderUser() {
  const { user } = getState();

  const userBox = document.getElementById("userBox");
  if (userBox) userBox.textContent = user?.role ? user.role : "Guest";

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.style.display = user ? "inline-flex" : "none";
}

function getAllowedRoutesByRole(role) {
  if (role === "doctor") {
    // doctor can only work with schedule + visits
    return new Set(["schedule", "visit"]);
  }
  // operator (default)
  return new Set(["schedule", "patients", "payments", "report", "visit"]);
}

function applyRoleToMenu() {
  const { user } = getState();
  const menu = document.getElementById("menu");
  if (!menu) return;

  // reset (in case role changes / logout-login)
  menu.querySelector('[data-route="patients"]')?.classList.remove("hidden");
  menu.querySelector('[data-route="payments"]')?.classList.remove("hidden");
  menu.querySelector('[data-route="report"]')?.classList.remove("hidden");

  if (user?.role === "doctor") {
    menu.querySelector('[data-route="patients"]')?.classList.add("hidden");
    menu.querySelector('[data-route="payments"]')?.classList.add("hidden");
    menu.querySelector('[data-route="report"]')?.classList.add("hidden");
  }
}

/* =========================
   3) Router (auth + role guard)
   ========================= */
function getRouteFromHash() {
  const hash = window.location.hash || "#schedule";
  return hash.replace("#", "").split("?")[0];
}

function requireAuthAndRole(route) {
  const { user } = getState();

  const protectedRoutes = new Set([
    "schedule",
    "patients",
    "payments",
    "report",
    "visit",
  ]);

  // not logged in -> block protected
  if (!user && protectedRoutes.has(route)) return "login";

  // logged in -> role restriction
  if (user) {
    const allowedByRole = getAllowedRoutesByRole(user.role);
    if (route !== "login" && !allowedByRole.has(route)) {
      return "schedule";
    }
  }

  return route;
}

function renderLogin() {
  app.innerHTML = renderAuthPage();

  mountAuthPage({
    onSuccess: () => {
      // after login go schedule
      window.location.hash = "#schedule";
    },
  });
}

function renderProtected(route) {
  renderLayout();
  setHeaderUser();
  applyRoleToMenu();
  setActiveMenu(route);

  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn?.addEventListener("click", () => {
    setState({ user: null });
    window.location.hash = "#login";
  });

  if (route === "schedule") return mountSchedulePage();
  if (route === "patients") return mountPatientsPage();
  if (route === "visit") return mountVisitPage();
  if (route === "payments") return mountPaymentsPage();
  if (route === "report") return mountReportPage();
}

function renderRoute() {
  let route = getRouteFromHash();
  route = requireAuthAndRole(route);

  const allowed = new Set([
    "login",
    "schedule",
    "patients",
    "payments",
    "report",
    "visit",
  ]);
  if (!allowed.has(route)) route = "schedule";

  // force hash to #login if login required (so URL becomes clear)
  if (route === "login") {
    if (window.location.hash !== "#login") window.location.hash = "#login";
    renderLogin();
    return;
  }

  renderProtected(route);
}

function initRouter() {
  window.addEventListener("hashchange", renderRoute);
  if (!window.location.hash) window.location.hash = "#login";
  renderRoute();
}

initRouter();
