import { getState, setState } from "./core/state.js";
import { renderAuthPage } from "./features/auth/auth.view.js";
import { mountAuthPage } from "./features/auth/auth.controller.js";
import { mountSchedulePage } from "./features/schedule/schedule.controller.js";
import { mountPatientsPage } from "./features/patients/patients.controller.js";
import { mountVisitPage } from "./features/visits/visits.controller.js";
import { mountPaymentsPage } from "./features/payments/payments.controller.js";
import { mountReportPage } from "./features/report/report.controller.js";

const app = document.getElementById("app");

function renderLayout() {
  app.innerHTML = `
    <div class="layout">
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="logo">
            <div class="logo-icon">
              <img
                src="./assets/images/Medimetricslogotype.png"
                alt="MediMetrics logo"
                width="32"
                height="32"
              />
            </div>
            <span class="logo-text">MediMetrics</span>
          </div>
          <div class="support-info">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span>Поддержка: +7 771 163 2030</span>
          </div>
        </div>
        <nav class="menu" id="menu">
          <a href="#schedule" class="menu-item" data-route="schedule">
            <svg class="menu-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span>Расписание</span>
            <svg class="menu-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </a>
          <a href="#patients" class="menu-item" data-route="patients">
            <svg class="menu-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span>Пациенты</span>
            <svg class="menu-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </a>
          <a href="#payments" class="menu-item" data-route="payments">
            <svg class="menu-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            <span>Оплаты</span>
            <svg class="menu-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </a>
          <a href="#report" class="menu-item" data-route="report">
            <svg class="menu-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            <span>Отчёт</span>
            <svg class="menu-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </a>
        </nav>
      </aside>
      <div class="sidebar-backdrop" id="sidebarBackdrop"></div>
      <div class="main">
        <header class="header">
          <div class="header-left">
            <button class="burger-btn" id="sidebarToggle" type="button" aria-label="Открыть меню">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <line x1="4" y1="6" x2="20" y2="6"></line>
                <line x1="4" y1="12" x2="20" y2="12"></line>
                <line x1="4" y1="18" x2="20" y2="18"></line>
              </svg>
            </button>
            <input id="globalSearch" type="text" placeholder="Поиск пациента..." />
          </div>
          <div class="header-right">
            <div class="user" id="userBox">Гость</div>
            <button class="btn btn-secondary" id="logoutBtn" type="button">Выйти</button>
          </div>
        </header>
        <main class="content" id="page-content"></main>
      </div>
    </div>
  `;
}

function mountSidebarToggle() {
  const sidebar = document.querySelector(".sidebar");
  const toggleBtn = document.getElementById("sidebarToggle");
  const backdrop = document.getElementById("sidebarBackdrop");
  const menu = document.getElementById("menu");
  if (!sidebar || !toggleBtn || !backdrop) return;

  const close = () => {
    sidebar.classList.remove("open");
    backdrop.classList.remove("show");
  };

  const toggle = () => {
    const next = !sidebar.classList.contains("open");
    sidebar.classList.toggle("open", next);
    backdrop.classList.toggle("show", next);
  };

  toggleBtn.addEventListener("click", toggle);
  backdrop.addEventListener("click", close);
  menu?.addEventListener("click", (e) => {
    if (e.target.closest(".menu-item")) close();
  });
  if (!window.__sidebarEscBound) {
    window.__sidebarEscBound = true;
    window.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      document.querySelector(".sidebar")?.classList.remove("open");
      document.getElementById("sidebarBackdrop")?.classList.remove("show");
    });
  }
}

function setActiveMenu(route) {
  document
    .querySelectorAll(".menu-item")
    .forEach((a) => a.classList.toggle("active", a.dataset.route === route));
}

function setHeaderUser() {
  const { user } = getState();
  const userBox = document.getElementById("userBox");
  if (userBox)
    userBox.textContent =
      user?.role === "doctor"
        ? "Врач"
        : user?.role === "operator"
          ? "Оператор"
          : "Гость";
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.style.display = user ? "inline-flex" : "none";
}

function getAllowedRoutesByRole(role) {
  if (role === "doctor") return new Set(["schedule", "visit"]);
  return new Set(["schedule", "patients", "payments", "report", "visit"]);
}

function applyRoleToMenu() {
  const { user } = getState();
  const menu = document.getElementById("menu");
  if (!menu) return;
  ["patients", "payments", "report"].forEach((r) =>
    menu.querySelector(`[data-route="${r}"]`)?.classList.remove("hidden"),
  );
  if (user?.role === "doctor") {
    ["patients", "payments", "report"].forEach((r) =>
      menu.querySelector(`[data-route="${r}"]`)?.classList.add("hidden"),
    );
  }
}

function mountGlobalSearch() {
  const input = document.getElementById("globalSearch");
  if (!input) return;
  let timer = null;
  input.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const q = input.value.trim();
      if (q.length >= 2)
        window.location.hash = `#patients?q=${encodeURIComponent(q)}`;
    }, 400);
  });
}

function getRouteFromHash() {
  return (window.location.hash || "#schedule").replace("#", "").split("?")[0];
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
  if (!user && protectedRoutes.has(route)) return "login";
  if (
    user &&
    route !== "login" &&
    !getAllowedRoutesByRole(user.role).has(route)
  )
    return "schedule";
  return route;
}

function renderLogin() {
  app.innerHTML = renderAuthPage();
  mountAuthPage({
    onSuccess: () => {
      window.location.hash = "#schedule";
    },
  });
}

function renderProtected(route) {
  renderLayout();
  setHeaderUser();
  applyRoleToMenu();
  setActiveMenu(route);
  mountSidebarToggle();
  mountGlobalSearch();
  document.getElementById("logoutBtn")?.addEventListener("click", () => {
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
  if (route === "login") {
    if (window.location.hash !== "#login") window.location.hash = "#login";
    renderLogin();
    return;
  }
  renderProtected(route);
}

window.addEventListener("hashchange", renderRoute);
if (!window.location.hash) window.location.hash = "#login";
renderRoute();
