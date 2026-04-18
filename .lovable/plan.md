

## Plan — In-app messaging system (FINAL, approved)

### Database migration
- Enable Realtime publication on `messages` and `conversations`
- Set `replica identity full` on both tables
- Add indexes: `messages(conversation_id, created_at)`, `conversations(traveler_user_id, last_message_at desc)`, `conversations(guide_user_id, last_message_at desc)`

### New files

**`src/lib/messaging.ts`** — `getOrCreateConversation`, `sendMessage`, `markConversationRead`

**`src/components/messaging/ConversationPanel.tsx`** — `Sheet`-based slide-in (right, `w-full sm:max-w-md`):
- Props: `open`, `onClose`, `conversationId`, `peerName`, `peerAvatarUrl`, `peerInitials`, `viewerRole`, `peerFirstName?`, `peerCity?`
- Loads messages, subscribes to `postgres_changes` INSERT for real-time
- Auto-scroll to bottom; mark-read on open
- Bottom: textarea + Send. **Placeholder when thread is empty:** `Hi {peerFirstName}, I'm interested in a tour in {peerCity}. Can you tell me more about your availability and pricing?` (placeholder only — not pre-filled value)
- Fire-and-forget `send-notification` with `type: 'new_message'` after send

**`src/components/messaging/MessageGuideButton.tsx`** — wraps existing message button visual:
- Auth gate: not logged in → `navigate('/login?tab=signup&returnTo=' + path + '&context=message')`
- Logged in → `getOrCreateConversation` then open `ConversationPanel`
- Accepts `guideUserId`, `guideFirstName`, `guideLastName`, `guideAvatarUrl?`, `guideCity?`, `children`

**`src/components/dashboard/GuideMessagesInbox.tsx`** — guide-side inbox (mirror of traveler)

### Modified files

- `src/components/MeetGuidesSection.tsx` — wire Message button via `MessageGuideButton` (pass `service_areas[0]` as `guideCity`)
- `src/pages/GuidesPage.tsx` — same wiring
- `src/pages/GuideProfilePage.tsx` — same wiring
- `src/pages/Login.tsx` — honor `?returnTo=` in `routeAfterAuth`; show "Create a free account to message this guide" banner when `?context=message`
- `src/components/traveler/MessagesInbox.tsx` — rewrite: previews, unread (bold + dot), realtime, click → `ConversationPanel`
- `src/pages/GuideDashboard.tsx` — mount `GuideMessagesInbox`; unread-count badge on Conversations stat
- `supabase/functions/send-notification/index.ts` — add `'new_message'` to `VALID_TYPES`/`PUBLIC_TYPES`; new handler resolves recipient email via service-role `auth.admin.getUserById`; subject `New message from {senderName} — GuidesDirectly`; body has sender, 100-char preview, CTA to dashboard; also inserts row into `notifications` table for the recipient

### Untouched
Header/Navbar, Hero, Footer, color tokens, table schemas, RLS policies, Stripe/founding logic, all other dashboards.

### After
Publish.

