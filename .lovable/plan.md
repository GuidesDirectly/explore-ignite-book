

# Add Read More Toggle to About Section

**File:** `src/pages/GuideProfilePage.tsx` — two small edits

## Edit 1 — Add state variable
After line 67, add:
```tsx
const [bioExpanded, setBioExpanded] = useState(false);
```

## Edit 2 — Update About section body (lines 471–473)
Replace the `<p>` that renders `{translatedBio}` with:

```tsx
<p className="leading-relaxed whitespace-pre-line" style={{ color: "rgba(255,255,255,0.65)" }}>
  {translatedBio.length > 200 && !bioExpanded
    ? translatedBio.slice(0, 200) + "..."
    : translatedBio}
</p>
{translatedBio.length > 200 && (
  <span
    onClick={() => setBioExpanded(!bioExpanded)}
    style={{ color: "#C9A84C", fontSize: "13px", cursor: "pointer" }}
    className="inline-block mt-2 hover:underline"
  >
    {bioExpanded ? "Show less" : "Read more"}
  </span>
)}
```

Nothing else changes.

