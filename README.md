# Life OS

A single-page "cockpit personnel" — Today, Nutrition & Groceries, Sprint & Recovery, Goals, and Tracking — built from the Claude Design handoff in `../project/`. Plain React + Vite. All data always lives in the browser's `localStorage` (key `oslife.v4`) first; when the page is opened as the published Claude Artifact with the `db` capability, it also syncs the same document to that artifact's cloud store in real time (`lifeos/data`), so the data survives a lost/cleared browser and follows the account across devices. Outside that context (this dev server, a plain static host) it's `localStorage`-only, same as the original brief (web app, usable on desktop and mobile via the browser, no App Store, no backend required).

## Run it

```
npm install
npm run dev       # local dev server
npm run build     # production build to dist/
npm run preview   # serve the production build locally
```

## Structure

- `src/lib/constants.js`, `src/lib/utils.js` — static data and date/text helpers.
- `src/lib/seed.js` — first-run demo data (meals, times, goals, books, …).
- `src/lib/logic.js` — pure computations shared across tabs (meal rotation, training/kcal targets, recovery scoring, style helpers).
- `src/hooks/useLifeOS.js` — all app state, persistence, and the cross-module wiring (a task ticked on Today updates Goals, sessions feed Nutrition's calorie target and meal count, etc.).
- `src/components/*Tab.jsx` — the five sections' UI.

## Notes

- Hydration reminders use the Notification API when permission is granted, and fall back to in-app toasts otherwise; a browser tab must stay open for either to fire (there's no backend to push them).
- "Share check-in" uses the Web Share API where available, otherwise copies the check-in text to the clipboard.
- Installable to the home screen: `index.html` links `public/manifest.webmanifest` and carries the `apple-mobile-web-app-*` meta tags Safari checks before opening a home-screen icon full-screen instead of in browser chrome. The published Artifact version inlines both the manifest and the icon as data URIs (an Artifact can't host separate files), so it carries the same tags without needing this `public/` folder.
- Cloud sync (`src/hooks/useLifeOS.js`): on load it calls `window.claude.use("db")`; when that resolves (only inside the claude.ai Artifact viewer, with the `db` capability granted at publish) it subscribes to the `lifeos/data` document and keeps every local edit written there too. A one-time toast on load reports which mode is active ("Cloud sync on…" vs "Saved on this device only…"). Anywhere else `window.claude` doesn't exist, so this is skipped entirely and the app runs exactly as before.
