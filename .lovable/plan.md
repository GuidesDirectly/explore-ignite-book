

# Restore MeetGuidesSection to Homepage

**File:** `src/pages/Home.tsx` — two additions

1. **Add import** with the other imports:
   ```tsx
   import MeetGuidesSection from "@/components/MeetGuidesSection";
   ```

2. **Add JSX** between HowItWorksSection and DestinationsSection:
   ```tsx
   {/* Meet Our Founding Guides */}
   <MeetGuidesSection />
   ```

No other files touched. No changes to MeetGuidesSection.tsx.

