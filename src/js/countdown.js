/**
 * Auction countdown timer.
 *
 * The auction end time is persisted in localStorage so a page refresh keeps
 * counting from where it left off. The first visit starts at 59:59:59 (as in
 * the design). When it hits zero it restarts so the demo never looks dead.
 */

const STORAGE_KEY = "nft-auction-ends-at";
const DURATION_MS = (59 * 60 * 60 + 59 * 60 + 59) * 1000; // 59:59:59

const pad = (n) => String(n).padStart(2, "0");

const readEndTime = function () {
  try {
    const stored = Number(localStorage.getItem(STORAGE_KEY));
    if (stored && stored > Date.now()) return stored;
  } catch {
    /* localStorage unavailable (private mode etc.) */
  }
  return null;
};

const writeEndTime = function (endsAt) {
  try {
    localStorage.setItem(STORAGE_KEY, String(endsAt));
  } catch {
    /* ignore */
  }
};

export const initCountdown = function () {
  const root = document.getElementById("countdown");
  if (!root) return;

  const hoursEl = root.querySelector('[data-unit="hours"]');
  const minutesEl = root.querySelector('[data-unit="minutes"]');
  const secondsEl = root.querySelector('[data-unit="seconds"]');

  let endsAt = readEndTime();
  if (!endsAt) {
    endsAt = Date.now() + DURATION_MS;
    writeEndTime(endsAt);
  }

  const render = () => {
    let remaining = endsAt - Date.now();

    if (remaining <= 0) {
      endsAt = Date.now() + DURATION_MS;
      writeEndTime(endsAt);
      remaining = DURATION_MS;
    }

    const totalSeconds = Math.floor(remaining / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    hoursEl.textContent = pad(hours);
    minutesEl.textContent = pad(minutes);
    secondsEl.textContent = pad(seconds);
  };

  render();
  setInterval(render, 1000);
};
