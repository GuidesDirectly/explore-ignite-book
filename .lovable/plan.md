

# Security Hardening: api-guides Edge Function + View + RLS

## Changes (3 total, no frontend modifications)

### 1. Database Migration — Recreate view with `security_invoker`

```sql
CREATE OR REPLACE VIEW guide_profiles_public
WITH (security_invoker = true) AS
SELECT
  id,
  user_id,
  service_areas,
  status,
  created_at,
  translations,
  jsonb_build_object(
    'firstName', form_data->'firstName',
    'lastName', form_data->'lastName',
    'biography', form_data->'biography',
    'languages', form_data->'languages',
    'specializations', form_data->'specializations',
    'tourTypes', form_data->'tourTypes',
    'targetAudience', form_data->'targetAudience'
  ) AS form_data
FROM guide_profiles
WHERE status = 'approved';
```

The view already has the correct sanitized columns. This migration adds `security_invoker = true` so even service-role callers respect the view's column restrictions.

### 2. Database Migration — Drop overly-broad RLS policy

```sql
DROP POLICY IF EXISTS "Anyone can view approved guide profiles" ON guide_profiles;
```

After this, only admins and guide-own-profile policies remain on the base table.

### 3. Edge Function Update — `supabase/functions/api-guides/index.ts`

- Switch both queries from `guide_profiles` to `guide_profiles_public`
- Use explicit column select (no `SELECT *`)
- Remove `.eq("status", "approved")` (view already filters)
- Add `sanitiseGuide()` with `FORBIDDEN_FIELDS` blocklist
- Apply sanitisation to all responses before returning

```text
Files modified:
  supabase/functions/api-guides/index.ts  (edge function)
  1 new migration                          (view + RLS policy)
```

### Verification After Apply

- [ ] Migration applied with no SQL errors
- [ ] Edge function deployed successfully
- [ ] Old "Anyone can view approved guide profiles" policy confirmed dropped

