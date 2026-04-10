

# TravelerAiCta Component Rewrite

## Summary
Replace the entire content of `src/components/TravelerAiCta.tsx` with the new conversion-focused design featuring a deep navy gradient background, eyebrow label with Claude AI pill, mock conversation demo, benefit pills, and gold CTA button.

## Single File Change

**`src/components/TravelerAiCta.tsx`** — Full rewrite with:
- Deep navy diagonal gradient background (`#0A1628` → `#122040` → `#0A1628`)
- "AI TRIP ARCHITECT" eyebrow + "Powered by Claude AI" pill
- Serif H2: "Plan with AI. Travel with humans." (44px desktop / 30px mobile)
- Descriptive subheading (max-width 600px)
- Three benefit pills (Sparkles, MapPin, Clock icons in gold)
- Static mock conversation block with user bubble (gold) and AI response (dark)
- Green "✓ Itinerary built in 8 seconds" confirmation
- Gold CTA button → navigates to `/chat`
- Reassurance text below CTA
- Imports: `Sparkles`, `MapPin`, `Clock` from lucide-react; `useNavigate` from react-router-dom
- Remove framer-motion dependency (not needed for this static layout), or keep for entrance animation — will use a simple fade-in with `motion.div` to stay consistent with the rest of the site

No other files modified.

