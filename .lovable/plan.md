

# Tour Sorting Implementation Plan

## Single file: `src/pages/Tours.tsx`

### Changes

**1. Extend `TourListing` interface (line 43)**
Add `createdAt: string | null;` field.

**2. Update query to include `created_at` (line 60)**
Add `created_at` to the select string: `"id, user_id, form_data, service_areas, translations, created_at"`.

**3. Populate `createdAt` in listing builder (line 125-141)**
Add `createdAt: g.created_at ?? null,` to each listing object.

**4. Add `sortBy` state (after line 54)**
```typescript
const [sortBy, setSortBy] = useState("recommended");
```

**5. Add `sorted` memo (after `filtered` memo, after line 176)**
```typescript
const sorted = useMemo(() => {
  const arr = [...filtered];
  switch (sortBy) {
    case "price-low":
      return arr.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    case "price-high":
      return arr.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
    case "rating":
      return arr.sort((a, b) => b.rating - a.rating);
    case "newest":
      return arr.sort((a, b) => {
        if (!b.createdAt && !a.createdAt) return 0;
        if (!b.createdAt) return -1;
        if (!a.createdAt) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    default:
      return arr;
  }
}, [filtered, sortBy]);
```

**6. Replace results header (lines 308-312)**
Add sort dropdown right-aligned next to count, using `sorted.length`:
```tsx
<div className="flex items-center justify-between mb-8">
  <p className="text-sm text-muted-foreground">
    {loading ? "Loading..." : `${sorted.length} tour${sorted.length !== 1 ? "s" : ""} found`}
  </p>
  <Select value={sortBy} onValueChange={setSortBy}>
    <SelectTrigger className="w-[200px] bg-background">
      <SelectValue placeholder="Sort by" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="recommended">Recommended</SelectItem>
      <SelectItem value="price-low">Price (Lowest First)</SelectItem>
      <SelectItem value="price-high">Price (Highest First)</SelectItem>
      <SelectItem value="rating">Top Rated</SelectItem>
      <SelectItem value="newest">Newest</SelectItem>
    </SelectContent>
  </Select>
</div>
```

**7. Replace `filtered` with `sorted` in rendering (lines 320, 328)**
- `sorted.length === 0` for empty state
- `sorted.map(...)` for grid rendering

### Edge case handling
- **Null prices**: Placed last via `Infinity` / `-1` fallbacks
- **Null `createdAt`**: Handled with explicit null checks, nulls sorted last
- **Zero ratings**: Natural numeric sort handles correctly

### No changes to
- Backend / database / routing
- Existing filter logic
- TourCard component
- Any other files

