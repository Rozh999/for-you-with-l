/**
 * Shared UI behaviours used on every page:
 *  - sticky header shadow
 *  - hamburger / mobile menu
 *  - smooth scrolling for in-page anchors
 *  - back-to-top button
 *  - newsletter ("weekly digest") forms
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* ---------- Sticky header ---------- */
export const initStickyHeader = function () {
  const header = document.getElementById("site-header");
  if (!header) return;

  const update = () => {
    header.classList.toggle("header-scrolled", window.scrollY > 10);
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
};

/* ---------- Hamburger menu ---------- */
export const initHamburgerMenu = function () {
  const toggle = document.getElementById("menu-toggle");
  const menu = document.getElementById("mobile-menu");
  if (!toggle || !menu) return;

  const iconOpen = toggle.querySelector('[data-icon="open"]');
  const iconClose = toggle.querySelector('[data-icon="close"]');

  const setOpen = (open) => {
    menu.dataset.open = String(open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    iconOpen?.classList.toggle("hidden", open);
    iconClose?.classList.toggle("hidden", !open);
  };

  const isOpen = () => menu.dataset.open === "true";

  toggle.addEventListener("click", () => setOpen(!isOpen()));

  // Close after choosing a link
  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });

  // Close on Escape
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen()) setOpen(false);
  });

  // Close when clicking outside the header
  document.addEventListener("click", (event) => {
    if (isOpen() && !event.target.closest("#site-header")) setOpen(false);
  });

  // Reset when the viewport grows to the desktop layout
  const mq = window.matchMedia("(min-width: 834px)");
  mq.addEventListener("change", (event) => {
    if (event.matches) setOpen(false);
  });
};

/* ---------- Smooth scroll ---------- */
export const initSmoothScroll = function () {
  const header = document.getElementById("site-header");

  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;

    const id = link.getAttribute("href").slice(1);
    if (!id) return;

    const target = document.getElementById(id);
    if (!target) return;

    event.preventDefault();

    const headerHeight = header ? header.offsetHeight : 0;
    const top =
      target.getBoundingClientRect().top + window.scrollY - headerHeight;

    window.scrollTo({ top, behavior: "smooth" });
    history.replaceState(null, "", `#${id}`);
  });
};

/* ---------- Back to top ---------- */
export const initBackToTop = function () {
  const button = document.getElementById("back-to-top");
  if (!button) return;

  const update = () => {
    button.dataset.visible = String(window.scrollY > 400);
  };

  update();
  window.addEventListener("scroll", update, { passive: true });

  button.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
};

/* ---------- Newsletter forms ---------- */
export const initDigestForms = function () {
  const forms = document.querySelectorAll("#digest-form, #footer-digest-form");

  forms.forEach((form) => {
    const input = form.querySelector('input[type="email"]');
    const message = document.getElementById(
      `${form.id.replace("-form", "")}-message`,
    );

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const value = input.value.trim();

      if (!EMAIL_RE.test(value)) {
        input.classList.add("ring-2", "ring-danger");
        if (message) {
          message.textContent = "Please enter a valid email address.";
          message.className = "mt-3 min-h-[20px] text-sm text-danger";
        }
        return;
      }

      input.classList.remove("ring-2", "ring-danger");
      if (message) {
        message.textContent = "Thanks! You're subscribed to the weekly digest.";
        message.className = "mt-3 min-h-[20px] text-sm text-success";
      }
      form.reset();
    });

    input.addEventListener("input", () => {
      input.classList.remove("ring-2", "ring-danger");
      if (message) message.textContent = "";
    });
  });
};

/* ---------- Boot everything that is shared ---------- */
export const initSharedUI = function () {
  initStickyHeader();
  initHamburgerMenu();
  initSmoothScroll();
  initBackToTop();
  initDigestForms();
};
