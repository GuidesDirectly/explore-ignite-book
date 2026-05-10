## Plan: Create GDPR data handling playbook

Create a single new documentation file at `docs/gdpr-playbook.md`. No code changes.

### File contents

The file will include section 1 (verbatim from prior message) plus drafted sections 2–7 tailored to GuidesDirectly's stack (Supabase, Stripe, GA4, Cloudflare).

**Section 1 — Data We Hold:** Guide profiles, traveler profiles, bookings, messages, GA4 analytics events.

**Section 2 — Right to Erasure (Article 17):** Step-by-step workflow:
1. Verify identity of requester via authenticated email
2. Delete Supabase rows in FK-safe order: messages → bookings → reviews → guide_availability → tours → guide_profiles → traveler profiles → user_roles → auth.users
3. Delete Supabase Storage assets (profile photos, tour photos, verification docs)
4. Anonymize Stripe customer (note: Stripe retains payment records for 7 years per legal/tax requirements; full deletion not possible)
5. Issue GA4 user-deletion request via Data Deletion API; rotate client_id
6. Confirm completion to user within 30 days (Article 12)

**Section 3 — Data Retention Policy:** Active accounts kept indefinitely; soft-deleted accounts purged after 30 days; payment records retained 7 years (Stripe / tax law); Supabase point-in-time backups retained 7 days.

**Section 4 — Data Processors:** Supabase (EU region hosting, DPA signed), Stripe (PCI-DSS Level 1, SCC for transfers), Google Analytics 4 (IP anonymization on, EU-US DPF), Cloudflare (CDN/WAF, EU-US DPF).

**Section 5 — Lawful Basis (Article 6):** Contract performance for bookings & account management; legitimate interest for product analytics & fraud prevention; consent for marketing emails & non-essential cookies.

**Section 6 — Data Breach Response:** 24h internal identification & containment; 72h notification to supervisory authority (Article 33) and to affected users when >250 users impacted or high risk to rights/freedoms; incident log retained 3 years.

**Section 7 — Data Controller Contact:** Michael Zlotnitsky — michael@iguidetours.net

### Out of scope

No code changes, no UI links to the playbook, no privacy policy edits.
