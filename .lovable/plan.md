

## Navbar User Flow Fix — Execution Plan

### 1. New file: `src/pages/Login.tsx`
Clean universal login page:
- Email + password form using `supabase.auth.signInWithPassword`
- "Forgot password?" link → `/forgot-password`
- "Become a Guide" link → `/guide-register`
- On success, redirect to `/home`
- Centered card layout with Navbar

### 2. Edit: `src/App.tsx` (line 28)
- Add `import Login from "./pages/Login";`
- Add `<Route path="/login" element={<Login />} />` before the catch-all

### 3. Edit: `src/components/Navbar.tsx` — 5 areas

**Desktop Login (lines 156-164):** Change `variant="ghost"` → `variant="outline"`, destination `/guide-register` → `/login`, style as clean outline button

**Desktop CTAs (lines 171-202):**
- **Delete** "Find a Guide" button (lines 171-185)
- **"Book a Guide"** (line 189): Change `/explore` → `/tours`
- **"Join as Guide"** (lines 195-202): Change from `variant="outline"` to solid style: `bg-cta-join text-white hover:bg-cta-join/90`

**Mobile Login (line 297):** Change `/guide-register` → `/login`

**Mobile CTAs (lines 313-343):**
- **Delete** "Find a Guide" button (lines 314-328)
- **"Book a Guide"** (line 332): Change `/explore` → `/tours`
- **"Join as Guide"** (lines 336-343): Change to solid style matching desktop

### Result
Header simplified to: `[Login outline] | [Book a Guide solid] [Join as Guide solid] | 📞 🌐`

