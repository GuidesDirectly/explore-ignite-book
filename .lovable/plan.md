

## Plan — Add Sign Up tab to Login + verify traveler redirect

### FIX 1 — Add Sign Up tab to `Login.tsx`

Refactor `src/pages/Login.tsx` to use the existing `Tabs` component with two tabs: **Sign In** (existing form) and **Sign Up** (new form).

**Sign Up form fields:**
- Email
- Password (with `PasswordStrengthMeter` reused from existing component)
- Confirm password (must match)
- Terms agreement checkbox + small disclosure text linking to terms

**Sign Up handler logic:**
1. Client-side validation: email format, password matches confirm, password is strong (`isPasswordStrong`), terms checkbox checked.
2. Optional but consistent with existing security: call `checkPasswordBreached()` before signup; warn but allow if HIBP fails open.
3. Call `supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/` } })`.
4. The DB trigger `handle_new_user()` already auto-inserts `user_roles` with role `'user'` (or `'admin'` for the very first user) — **no extra insert needed**.
5. After successful signup:
   - If session is returned (email confirmation disabled) → redirect to `/traveler/onboarding`.
   - If no session (email confirmation enabled) → toast "Check your email to confirm" and stay on page.
6. Toast on errors (existing user, weak password, etc.).

### FIX 2 — Verify post-login redirect logic

Reviewing existing `Login.tsx` (shown in current-code):

```ts
if (roleSet.has("admin")) navigate("/admin");
else if (roleSet.has("guide") || guideProfile) navigate("/guide-dashboard");
else if (!travelerProfile?.onboarding_complete) navigate("/traveler/onboarding");
else navigate("/traveler/dashboard");
```

Issues vs. spec:
1. Spec says guide redirect should be `/guide/dashboard`, but existing route is `/guide-dashboard`. Checked `App.tsx` history — actual route is `/guide-dashboard`. **Keep existing route** (changing it would break the rest of the app, and memory says "Do not modify Header/Hero/navigation"). The spec wording is approximate — existing behavior is correct.
2. Logic for traveler vs onboarding is already correct: if no admin/guide role and `onboarding_complete !== true`, goes to `/traveler/onboarding`; otherwise `/traveler/dashboard`. ✅
3. Admin redirect → `/admin`. ✅

**No logic change needed for Fix 2** — the redirect already does what the spec asks. Will add a small console.log to make debugging the test account easier, and ensure that if the `traveler_profiles` row doesn't exist yet (returns null), we route to `/traveler/onboarding` (already handled by `!travelerProfile?.onboarding_complete` since null is falsy). ✅

For the **Sign Up** path specifically, after auto-signin a fresh user has no profile row → will land on `/traveler/onboarding`. ✅

### Files touched

| Path | Change |
|---|---|
| `src/pages/Login.tsx` | Add `Tabs` wrapper, Sign In + Sign Up panes, sign-up handler, password meter, terms checkbox |

### Untouched
Header, Hero, Navbar, all routes, `handle_new_user` trigger (already assigns role), all other pages, RLS, traveler dashboard/onboarding pages.

### After
Publish. Test by signing up a new email → should land on `/traveler/onboarding`. Test by logging in `testtraveler@iguidetours.net` → lands on `/traveler/onboarding` if incomplete, else `/traveler/dashboard`.

