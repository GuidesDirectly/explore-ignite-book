

# Fix: Filter MeetGuidesSection by specific guide UUIDs

## Single change in `src/components/MeetGuidesSection.tsx`

**Lines ~38-41** — Replace the current query:

```typescript
// FROM:
.from("guide_profiles_public" as any)
.select("id, user_id, form_data, service_areas")
.limit(2)

// TO:
.from("guide_profiles_public" as any)
.select("id, user_id, form_data, service_areas")
.in("id", [
  "6f6e341e-b696-4c3f-80a8-ca64cc1be863",
  "f38ded03-43a2-4238-8b9a-eecb620a2a9c"
])
```

Remove `.limit(2)`. The `.in()` filter ensures only Michael Zlotnitsky and Mike McMains are ever returned.

No other files or sections touched.

