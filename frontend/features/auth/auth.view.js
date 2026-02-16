// features/auth/auth.view.js
export function renderAuthPage() {
  return `
    <div class="auth-wrap">
      <div class="auth-card card">
        <div class="auth-brand">MediMetrics</div>
        <div class="auth-title">Вход</div>
        <div class="auth-subtitle">Введите телефон и пароль</div>

        <form id="loginForm" class="auth-form">
          <label class="auth-label">
            Телефон
            <input class="input" name="phone" type="tel" placeholder="8700..." autocomplete="tel" required />
          </label>

          <label class="auth-label">
            Пароль
            <input class="input" name="password" type="password" placeholder="••••" autocomplete="current-password" required />
          </label>

          <div id="loginError" class="auth-error" aria-live="polite"></div>

          <button id="loginBtn" class="btn" type="submit">Войти</button>

          <div class="auth-hint">
            Demo: пароль <b>1234</b> → operator, пароль <b>doctor</b> → doctor
          </div>
        </form>
      </div>
    </div>
  `;
}
