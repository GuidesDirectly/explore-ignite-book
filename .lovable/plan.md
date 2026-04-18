
## Plan — Force PWA cache busting + iframe guard

### Problem
The PWA service worker (`vite-plugin-pwa`) caches the old build's `index.html` and JS bundles. Even with `registerType: "autoUpdate"` already set, users keep seeing the stale tab bar without Analytics until they hard-reload or unregister the SW manually.

### Root causes
1. `cleanupOutdatedCaches` is not set — old precache entries linger.
2. `skipWaiting` / `clientsClaim` are not set — a new SW waits for all tabs to close before activating.
3. No client-side update prompt or auto-reload, so even when a new SW downloads, the user must close every tab to see new code.
4. No iframe/preview guard — SW pollutes the Lovable preview iframe (per Lovable PWA guidance).

### Changes

**1. `vite.config.ts` — VitePWA workbox block**

Add to the existing `workbox: { ... }`:
- `cleanupOutdatedCaches: true` — purges stale precache on activation
- `skipWaiting: true` — new SW takes over immediately
- `clientsClaim: true` — new SW controls open tabs without reload

Keep `registerType: "autoUpdate"` (already present).

**2. `src/main.tsx` — auto-reload on new SW + iframe unregister guard**

Add a small block before app render:
- If running inside an iframe or on a Lovable preview host (`id-preview--`, `lovableproject.com`), unregister all existing service workers (prevents preview pollution).
- Otherwise, listen for `controllerchange` from `navigator.serviceWorker` and call `window.location.reload()` once, so the moment a new SW activates the page refreshes to the new build.

This gives users the new Analytics tab on the very next normal refresh — no manual cache clear required.

### Files touched

| Path | Change |
|---|---|
| `vite.config.ts` | Add `cleanupOutdatedCaches: true`, `skipWaiting: true`, `clientsClaim: true` to workbox |
| `src/main.tsx` | Add iframe/preview SW unregister guard + `controllerchange` auto-reload |

### Untouched
`Admin.tsx`, `AnalyticsDashboard.tsx`, manifest, runtimeCaching rules, all routes/components.

### After
Publish. On the user's next normal refresh of `iguidetours.net/admin`, the new SW activates, the page auto-reloads once, and the Analytics tab appears.
