## Edits

### 1. `vite.config.ts`
- Remove the `runtimeCaching` entry for `https://*.supabase.co/*` (NetworkFirst on RLS-gated API is the root cause of silent stale responses).
- Extend `navigateFallbackDenylist` to `[/^\/~oauth/, /^\/auth/, /\/functions\/v1\//]`.
- Keep `skipWaiting`, `clientsClaim`, `cleanupOutdatedCaches` as-is.

### 2. `src/main.tsx`
- In the production `controllerchange` handler, before `window.location.reload()`, await `caches.keys()` and delete every entry. Guarantees stale Supabase responses from the old SW are wiped on the first visit after the new build ships.

## After apply

1. Click **Publish → Update** to push to `iguidetours.net`.
2. One hard reload on the live domain — the new SW installs, claims, wipes caches, reloads. Returning visitors auto-update afterward.
3. Open a Lovable Support ticket for the domain disconnect + Entri `www` recovery link expiring (not agent-fixable; already escalated via feedback).
4. Cloudflare → Speed → Optimization: confirm Rocket Loader and Auto Minify (JS) are OFF.

## Files

- `vite.config.ts`
- `src/main.tsx`
