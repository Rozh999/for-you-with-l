import { createUser, getUsers } from "./api.js";
import { initSharedUI } from "./ui.js";

initSharedUI();

/* ---------- validation rules ---------- */

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const validators = {
  username(value) {
    if (!value) return "Username is required.";
    if (!USERNAME_RE.test(value)) {
      return "3-20 characters: letters, numbers and underscores only.";
    }
    return "";
  },
  email(value) {
    if (!value) return "Email address is required.";
    if (!EMAIL_RE.test(value)) return "Please enter a valid email address.";
    return "";
  },
  password(value) {
    if (!value) return "Password is required.";
    if (value.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(value)) return "Add at least one uppercase letter.";
    if (!/[a-z]/.test(value)) return "Add at least one lowercase letter.";
    if (!/\d/.test(value)) return "Add at least one number.";
    return "";
  },
  confirmPassword(value, values) {
    if (!value) return "Please confirm your password.";
    if (value !== values.password) return "Passwords do not match.";
    return "";
  },
};

/* ---------- DOM ---------- */

const form = document.getElementById("signup-form");
const submitButton = document.getElementById("signup-submit");
const messageEl = document.getElementById("signup-message");

const fields = {
  username: form.elements.username,
  email: form.elements.email,
  password: form.elements.password,
  confirmPassword: form.elements.confirmPassword,
};

const getValues = () =>
  Object.fromEntries(
    Object.entries(fields).map(([name, input]) => [name, input.value.trim()]),
  );

const showFieldError = function (name, error) {
  const input = fields[name];
  const wrapper = input.closest(".field");
  const errorEl = form.querySelector(`[data-error-for="${name}"]`);

  wrapper.classList.toggle("is-invalid", Boolean(error));
  input.setAttribute("aria-invalid", error ? "true" : "false");
  if (errorEl) errorEl.textContent = error;
};

const setMessage = function (text, type = "info") {
  const colors = {
    info: "text-caption",
    error: "text-danger",
    success: "text-success",
  };
  messageEl.textContent = text;
  messageEl.className = `mt-4 min-h-[22px] text-sm ${colors[type]}`;
};

const validateField = function (name) {
  const values = getValues();
  const error = validators[name](values[name], values);
  showFieldError(name, error);
  return !error;
};

const validateAll = function () {
  return Object.keys(fields)
    .map((name) => validateField(name))
    .every(Boolean);
};

/* ---------- live validation ---------- */

Object.entries(fields).forEach(([name, input]) => {
  input.addEventListener("blur", () => validateField(name));
  input.addEventListener("input", () => {
    // Clear the error as soon as the user starts fixing the field
    if (input.closest(".field").classList.contains("is-invalid")) {
      validateField(name);
    }
    if (name === "password" && fields.confirmPassword.value) {
      validateField("confirmPassword");
    }
    if (messageEl.textContent) setMessage("");
  });
});

/* ---------- submit ---------- */

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!validateAll()) {
    const firstInvalid = form.querySelector('[aria-invalid="true"]');
    firstInvalid?.focus();
    return;
  }

  const { username, email, password } = getValues();

  submitButton.disabled = true;
  setMessage("Creating your account…");

  try {
    const { users } = await getUsers();

    const emailTaken = users.some(
      (user) => user.email?.toLowerCase() === email.toLowerCase(),
    );
    const usernameTaken = users.some(
      (user) => user.username?.toLowerCase() === username.toLowerCase(),
    );

    if (emailTaken)
      showFieldError("email", "This email is already registered.");
    if (usernameTaken) showFieldError("username", "This username is taken.");

    if (emailTaken || usernameTaken) {
      setMessage("Please fix the highlighted fields.", "error");
      return;
    }

    const { source } = await createUser({ username, email, password });

    form.reset();
    Object.keys(fields).forEach((name) => showFieldError(name, ""));

    setMessage(
      source === "api"
        ? "Account created! Your details were saved to users.json."
        : "Account created! (users API not reachable, saved in this browser instead.)",
      "success",
    );
  } catch (error) {
    console.error("Sign up failed:", error);
    setMessage("Something went wrong. Please try again.", "error");
  } finally {
    submitButton.disabled = false;
  }
});
