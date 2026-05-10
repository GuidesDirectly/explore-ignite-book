## Plan: Add Dependabot config and PR template

Create two new files under `.github/`. Documentation/config only — no application code changes.

### Files

**1. `.github/dependabot.yml`**

Dependabot v2 config with two npm ecosystems:

- Root `/` — weekly Mondays, 10 PR limit, reviewer `allharmony`, labels `dependencies` + `security`, ignore all major version bumps.
- `/supabase/functions` — weekly Mondays, 5 PR limit, labels `dependencies` + `edge-functions`.

**2. `.github/PULL_REQUEST_TEMPLATE.md`**

Sections:
- Description
- Type of change (Bug fix / New feature / Security fix / Documentation update)
- Schema change checklist (guide_profiles columns; guide_profiles_public allowlist)
- Testing:
  - Tested on preview URL
  - No console errors
  - RLS policies verified if DB changes made
  - Stripe webhook tested if payment changes made

### Out of scope

No edits to source code, edge functions, or existing config.
