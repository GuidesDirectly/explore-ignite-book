# GDPR Data Handling Playbook

## GuidesDirectly — Data Protection Procedures

### 1. Data We Hold

- **Guide profiles:** Name, bio, languages, service areas, profile photo, license number, insurance details, subscription tier, Stripe customer/account IDs.
- **Traveler profiles:** Name, email, booking history.
- **Bookings:** Tour details, dates, payment references.
- **Messages/Conversations:** Direct messages between travelers and guides.
- **Analytics:** GA4 events (e.g. `guide_profile_viewed`, `booking_initiated`).

---

### 2. Right to Erasure (Article 17)

When a verified data subject requests erasure, complete the following workflow within **30 days** (Article 12 response window):

1. **Verify identity.** Confirm request via the authenticated email address on the account. Reject anonymous requests.
2. **Delete Supabase rows** in foreign-key-safe order:
   1. `messages` / `conversations`
   2. `bookings`
   3. `reviews`
   4. `guide_availability`
   5. `tours`
   6. `guide_profiles`
   7. `traveler_profiles`
   8. `user_roles`
   9. `auth.users` (final)
3. **Delete Supabase Storage assets:** profile photos, tour photos, verification documents (license, insurance, ID scans). Purge from all buckets.
4. **Stripe:** Anonymize the Stripe customer object (replace name/email with `redacted@…`) and detach payment methods. **Note:** Stripe must retain underlying payment, invoice, and tax records for **7 years** to comply with financial/tax law (legal obligation under Article 17(3)(b)). Full deletion of payment records is not possible.
5. **GA4:** Submit a User-ID deletion request via the GA4 Data Deletion API and rotate/clear the visitor's `client_id` cookie. Confirm anonymization within 63 days (GA4 SLA).
6. **Confirm to the user** in writing within 30 days, listing what was deleted and what was retained under legal obligation.
7. **Log the request** in the internal erasure register (date, requester, scope, completion timestamp). Retain log 3 years.

---

### 3. Data Retention Policy

| Data class | Retention |
|---|---|
| Active accounts | Indefinite while account is active |
| Soft-deleted accounts | Hard-deleted **30 days** after deactivation |
| Inactive accounts (no login 36 months) | Notify, then delete after 90 days |
| Payment records (Stripe) | **7 years** (tax/financial law) |
| Messages | Deleted with the parent account |
| Analytics events (GA4) | 14 months (default GA4 retention) |
| Supabase point-in-time backups | **7 days** rolling |
| Erasure & breach logs | 3 years |

---

### 4. Data Processors

| Processor | Purpose | Safeguards |
|---|---|---|
| **Supabase** | Postgres DB, Auth, Storage, Edge Functions | EU region hosting, DPA signed, RLS enforced |
| **Stripe** | Payment processing, Connect payouts, subscriptions | PCI-DSS Level 1, Standard Contractual Clauses for international transfers |
| **Google Analytics 4** | Product analytics | IP anonymization on, EU-US Data Privacy Framework, data retention 14 months |
| **Cloudflare** | CDN, WAF, DDoS protection | EU-US Data Privacy Framework, no payload caching for authenticated routes |

A current list of sub-processors is published at `/privacy-policy` and updated on change.

---

### 5. Lawful Basis (Article 6)

| Processing activity | Lawful basis |
|---|---|
| Account creation, bookings, messaging, payments | **Contract performance** (Art. 6(1)(b)) |
| Product analytics, fraud prevention, security logging | **Legitimate interest** (Art. 6(1)(f)) — balanced against user rights |
| Marketing emails, non-essential cookies | **Consent** (Art. 6(1)(a)) — opt-in, withdrawable at any time |
| Tax/financial record retention | **Legal obligation** (Art. 6(1)(c)) |

---

### 6. Data Breach Response

1. **Hour 0–24 — Identify & contain.** On suspicion of breach, the on-call engineer rotates affected secrets, revokes tokens, and isolates compromised systems. Initial scope assessment documented in the incident log.
2. **Hour 24–72 — Notify supervisory authority.** If the breach is likely to result in a risk to data subjects' rights and freedoms, notify the lead supervisory authority within **72 hours** of becoming aware (Article 33). Include nature, categories, approximate number of subjects, contact point, likely consequences, and mitigation.
3. **Notify affected users** without undue delay when the breach is high risk to their rights and freedoms, **and** in any case when **more than 250 users** are affected (Article 34). Notification via email in plain language.
4. **Post-incident.** Root-cause analysis within 7 days; remediation tracked in the security backlog. Incident log retained **3 years**.

---

### 7. Data Controller Contact

**Data Controller:** Michael Zlotnitsky
**Email:** michael@iguidetours.net

All data subject requests (access, rectification, erasure, portability, objection, restriction) should be sent to the address above. Responses within 30 days.
