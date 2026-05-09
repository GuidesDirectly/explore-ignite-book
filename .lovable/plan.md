## GA4 Analytics Integration

Add Google Analytics 4 (Measurement ID `G-0KGEME028E`) with two custom events.

### 1. `index.html` — inject GA4 snippet
Add the async gtag loader and inline config inside `<head>`, after the JSON-LD block and before `</head>`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-0KGEME028E"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-0KGEME028E');
</script>
```

### 2. `src/vite-env.d.ts` — TypeScript global
Append a `Window.gtag` declaration so call sites compile cleanly:
```ts
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}
export {};
```
All call sites use `window.gtag?.(...)` (optional chaining) so events no-op safely if the script is blocked.

### 3. `src/pages/GuideProfilePage.tsx` — `guide_profile_viewed`
Immediately after `setGuide(data)` inside the data fetch:
```ts
window.gtag?.('event', 'guide_profile_viewed', {
  guide_id: data.id,
  guide_name: `${data.form_data?.firstName ?? ''} ${data.form_data?.lastName ?? ''}`.trim(),
  guide_city: data.service_areas?.[0] || '',
});
```

### 4. `src/components/BookingRequestForm.tsx` — `booking_initiated`
Fire **after a successful insert** (not on submit click). In `handleSubmit`, inside the `if (error) { ... } else { ... }` success branch — alongside `setSubmitted(true)` and the existing `toast.success(...)`:
```ts
window.gtag?.('event', 'booking_initiated', {
  guide_id: guideUserId,
  guide_name: guideName,
});
```

### Skipped
- **Step 5 (`booking_completed` in `BookingCheckout.tsx`)** — intentionally omitted; checkout flow is disabled per zero-commission direct-contact model.
- **`stripe-webhook` (server-side)** — already excluded by spec.

### Notes
- No service-worker, Supabase, Vite, or Cloudflare changes.
- Two events total: `guide_profile_viewed`, `booking_initiated`.
