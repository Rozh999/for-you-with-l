# MFT Final – NFT Marketplace

Responsive NFT marketplace landing page + sign‑up page built from the
[MFT‑Final Figma design](https://www.figma.com/design/YmsfbfQLoC2X38E7jkudZT/MFT-Final)
with **Vite**, **Tailwind CSS v4**, vanilla **JavaScript (ES modules)**, **axios**
and **json-server**.

## Tasks

| # | Task | Where |
|---|------|-------|
| 1 | Sticky header | `index.html` (`<header id="site-header">`), `src/js/ui.js → initStickyHeader` |
| 2 | Hamburger menu | `src/js/ui.js → initHamburgerMenu` |
| 3 | Smooth scroll | `src/css/main.css` (`scroll-behavior`), `src/js/ui.js → initSmoothScroll` |
| 4 | Back‑to‑top button | `src/js/ui.js → initBackToTop` |
| 5 | Countdown timer | `src/js/countdown.js` (auction ends in 59:59:59, persisted in `localStorage`) |
| 6 | Sign‑up form validation | `signup.html`, `src/js/signup.js` |
| 7 | Store new user in `users.json` | `src/js/api.js → createUser` (POST to json-server) |
| 8 | Fetch & render `data.json` | `src/js/api.js → fetchData`, `src/js/script.js` |
| 9 | Push project to GitHub | see below |
| 10 | Deploy on Vercel | see below |

## Getting started

```bash
npm install
npm start          # Vite dev server + Tailwind watcher + users API, all at once
```

- Site: <http://localhost:5173>
- Users API (json-server): <http://localhost:3000/users>

Or run the pieces separately:

```bash
npm run dev              # Vite only
npm run watch:tw         # Tailwind → src/css/style.css
npm run watch:users-api  # json-server on port 3000
```

## Build

```bash
npm run build     # compiles Tailwind, then builds index.html + signup.html into dist/
npm run preview   # serves dist/
```

## Project structure

```
index.html              homepage
signup.html             create‑account page
src/css/main.css        Tailwind source (theme tokens, components)
src/css/style.css       compiled CSS (generated)
src/js/script.js        homepage entry: fetch data.json and render sections
src/js/signup.js        sign‑up page entry: validation + create user
src/js/ui.js            sticky header, hamburger, smooth scroll, back‑to‑top, digest forms
src/js/countdown.js     auction countdown
src/js/api.js           axios helpers (data.json, users API)
public/assets/          images, icons, data.json, users.json
```

## Sign‑up storage

The form validates username, email, password strength and password
confirmation, checks for duplicates, then `POST`s to the json-server users
API, which appends the record to `public/assets/data/users.json`.

The API base URL can be changed with `VITE_USERS_API` (see `.env.example`).
When the API is not reachable (for example on the static Vercel deployment) the
user is kept in the browser's `localStorage` and the UI says so.

## Deploy

1. **GitHub** – create an empty repository, then:

   ```bash
   git remote set-url origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```

2. **Vercel** – import the GitHub repository. Vercel auto‑detects Vite:
   build command `npm run build`, output directory `dist`.
