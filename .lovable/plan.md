

# Bug Fix — Guides Page Empty for Logged-In Users

## Root Cause

The `guide_profiles_public` view is created with `security_invoker=on`, meaning it applies the **caller's** RLS permissions on the base `guide_profiles` table.

The base table `guide_profiles` has these SELECT policies:
- `anon_can_view_approved_guides` — role: **anon** — `status = 'approved'`
- `Admins can view all profiles` — admin only
- `Guides can view own profile` — `auth.uid() = user_id`

When a regular authenticated user (not admin, not a guide) visits `/guides`, **none of these policies match**. The anon policy only applies to the `anon` role, not `authenticated`. So zero rows are returned.

The GuidesPage.tsx query itself is correct (`.eq("status", "approved")` is present). No code change needed.

## Fix

Add one RLS policy on `guide_profiles` allowing authenticated users to view approved profiles:

```sql
CREATE POLICY "authenticated_can_view_approved_guides"
ON public.guide_profiles
FOR SELECT
TO authenticated
USING (status = 'approved');
```

## What changes
- One database migration adding the policy above

## What does NOT change
- No code files modified
- No frontend changes
- GuidesPage.tsx stays exactly as-is
- No other RLS policies modified

