

# Routing Fix — Two Changes

## 1. Add `/guides` route — `src/App.tsx`

Add one line after the existing `/tours` route (line 51):

```typescript
<Route path="/guides" element={<Tours />} />
```

No other changes to App.tsx. The `/tours` route remains.

## 2. Clickable specialization tags — `src/components/MeetGuidesSection.tsx`

Replace the static `<span>` for each specialization pill with a clickable element:

- Add `onClick={() => navigate(`/guide/${guide.id}?specialization=${encodeURIComponent(spec)}`)}`
- Add `cursor-pointer` class
- Add `onMouseEnter`: set background to `rgba(201,168,76,0.22)`
- Add `onMouseLeave`: reset background to `rgba(201,168,76,0.12)`

No other changes to MeetGuidesSection.tsx. No other files touched.

