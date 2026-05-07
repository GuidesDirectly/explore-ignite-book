Three targeted edits to `src/pages/GuideProfilePage.tsx`:

1. **Share URL uses slug, not user_id**
   Replace:
   ```ts
   const profileUrl = `https://iguidetours.net/guide/${guide.user_id}`;
   ```
   with:
   ```ts
   const slug = generateGuideSlug(fd.firstName, fd.lastName, guide.service_areas?.[0] || "");
   const profileUrl = `https://iguidetours.net/guide/${slug}`;
   ```
   (Verify `generateGuideSlug` is already imported from `@/lib/utils`; if not, add the import.)

2. **Remove redundant status filter in slug lookup**
   Inside `fetchGuide`, in the slug-based query against `guide_profiles_public`, remove:
   ```ts
   .eq("status", "approved")
   ```
   The view already enforces status + activation_status.

3. **Fix JSON-LD rating scale to 1–10**
   In the `aggregateRating` block, replace:
   ```json
   "bestRating": "5", "worstRating": "1"
   ```
   with:
   ```json
   "bestRating": "10", "worstRating": "1"
   ```

No other logic, styling, or behavior changes.