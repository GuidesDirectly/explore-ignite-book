

# Remove MeetGuidesSection from Homepage

**File:** `src/pages/Home.tsx` — two lines removed.

1. **Remove import** (line 12): `import MeetGuidesSection from "@/components/MeetGuidesSection";`
2. **Remove usage** (lines 67-68): The `{/* Section 6 — Featured Guides */}` comment and `<MeetGuidesSection />` component.

No other changes. No other files touched. `MeetGuidesSection.tsx` file remains in the project.

