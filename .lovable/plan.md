

## Execution: AI Placement & Header Visibility

Two targeted edits, ready to apply.

### 1. Navbar Login Button (`src/components/Navbar.tsx`, line 159)

Change Login button classes to explicit white colors:

```
border-header-foreground/30 text-header-foreground/90 hover:text-header-foreground hover:bg-white/10
→ border-white/30 text-white hover:text-white hover:bg-white/10
```

### 2. ForGuidesSection AI Block (`src/components/ForGuidesSection.tsx`)

- **Line 3**: Remove unused imports `BarChart3, Sliders, CheckCircle`
- **Lines 15-20**: Delete `aiFeatures` array
- **Lines 68-104**: Replace the entire AI Tour Assistant `<motion.div>` with:
```tsx
<p className="flex items-center justify-center gap-2 text-sm mb-8" style={{ color: "hsl(40, 33%, 75%)" }}>
  <Bot className="w-4 h-4 text-primary" />
  Includes AI-powered business tools to help you price and plan effectively.
</p>
```

### Files affected
1. `src/components/Navbar.tsx` — 1 line
2. `src/components/ForGuidesSection.tsx` — 3 edits (imports, array, block replacement)

