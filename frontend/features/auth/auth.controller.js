// features/auth/auth.controller.js
import { login } from "../../core/api.js";
import { setState } from "../../core/state.js";

export function mountAuthPage({ onSuccess }) {
  const form = document.getElementById("loginForm");
  const btn = document.getElementById("loginBtn");
  const errorBox = document.getElementById("loginError");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    errorBox.textContent = "";

    const fd = new FormData(form);
    const phone = fd.get("phone");
    const password = fd.get("password");

    if (!phone || !password) {
      errorBox.textContent = "Phone and password are required";
      return;
    }

    btn.disabled = true;
    const oldText = btn.textContent;
    btn.textContent = "Входим...";

    try {
      const user = await login(phone, password);
      setState({ user });
      onSuccess?.(user);
    } catch (err) {
      errorBox.textContent = err?.message || "Login failed";
    } finally {
      btn.disabled = false;
      btn.textContent = oldText;
    }
  });
}
