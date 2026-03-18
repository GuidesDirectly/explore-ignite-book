

## Fix Login Button Visibility

**Root cause**: The `outline` button variant applies `bg-background` (a light color ~`hsl(209, 40%, 96%)`), while `text-header-foreground` resolves to white (`hsl(0, 0%, 100%)`). White text on a near-white background is invisible.

**Fix in `src/components/Navbar.tsx` line 159**:

Add `bg-transparent` to override the variant's `bg-background`, keeping the button text white against the dark header. The hover state already uses `hover:bg-header-foreground/10` which is fine.

```tsx
className="border-header-foreground/30 text-header-foreground hover:text-header-foreground hover:bg-header-foreground/10 font-medium gap-1.5 bg-transparent"
```

Single line change, one file affected.

