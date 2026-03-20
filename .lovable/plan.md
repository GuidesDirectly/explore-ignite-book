

# Fix "Find a Guide" Button Navigation

## Single change: `src/components/Navbar.tsx`

Replace the `onClick` handler on the "Find a Guide" button (lines 170-183):

**Current:**
```tsx
onClick={() => {
  if (isHome) {
    document.querySelector("#hero-search")?.scrollIntoView({ behavior: "smooth" });
  } else {
    navigate("/home#hero-search");
  }
}}
```

**New:**
```tsx
onClick={() => navigate("/tours")}
```

No other changes to imports, styling, structure, or any other file.

