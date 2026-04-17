

## Plan — Restore anon access to `guide_profiles_public`

### Context
The user reports `/guides` is empty again. They've supplied SQL to:
1. Re-`GRANT SELECT` on the view to `anon`/`authenticated`.
2. Add a base-table policy allowing public to see approved + active rows.
3. Verify with a SELECT.

Reviewing current DB state from the schema dump:
- View `guide_profiles_public` exists (created in migration `20260417234640`) with `security_invoker = on`.
- Base table `guide_profiles` already has TWO relevant SELECT policies for `anon, authenticated`:
  - `public_can_view_approved_active_rows` → `status='approved' AND activation_status='active'`
  - `public_can_view_approved_profiles_via_view` → `status='approved'`
- Prior migration already issued `GRANT SELECT ON public.guide_profiles_public TO anon, authenticated`.

So the policy the user wants to add is **functionally a duplicate** of the existing `public_can_view_approved_active_rows` (just a different name). The GRANT is also already in place. However, re-asserting both is harmless and gives us a clean verification step. Note: Postgres does not support `CREATE POLICY IF NOT EXISTS` — must wrap in a `DO` block.

### Migration (single file)
```sql
-- Re-assert SELECT grants on the public view (idempotent)
GRANT SELECT ON public.guide_profiles_public TO anon, authenticated;

-- Add named policy (guarded — Postgres has no CREATE POLICY IF NOT EXISTS)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'guide_profiles'
      AND policyname = 'Public can view approved active guides'
  ) THEN
    CREATE POLICY "Public can view approved active guides"
      ON public.guide_profiles
      FOR SELECT
      TO anon, authenticated
      USING (status = 'approved' AND activation_status = 'active');
  END IF;
END $$;
```

### Verification (after migration)
Run via `supabase--read_query`:
```sql
SELECT id, user_id, status FROM public.guide_profiles_public LIMIT 10;
```
Expected: 5 rows (Michael, Mike, Eduard, Farmers, Americo).

If the view returns rows under the service role but the page still shows empty, the issue is client-side (React Query stale cache, or a runtime error blocking the fetch) — we'd then re-inspect `GuidesPage.tsx` console output rather than the DB.

### Files touched
| Type | Path |
|---|---|
| Migration | new — re-grant + guarded policy |

### Untouched
View definition, all other policies, application code, Header, Hero, Navbar.

### After
Verify via SELECT, reload `/guides`, confirm 5 guides visible. Then publish.

