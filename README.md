# Razorpay Merchant Copilot — Telegram Bridge

> Your Razorpay dashboard, inside the app you already have open all day.

A Telegram bot that lets a Razorpay merchant check today's collections, recent payments, weekly performance, and settlement status — just by typing a message. No dashboard login, no app switch.

---

## Why this exists

Razorpay's merchant base is overwhelmingly small businesses — kirana stores, home-run D2C brands, single-location service providers. These merchants don't live in analytics dashboards. They live in **WhatsApp and Telegram**, because that's where they already talk to customers, suppliers, and delivery partners all day.

Asking a small merchant to open a browser, log into a dashboard, and read a settlement report is friction they'll skip. Asking them to type `"aaj kitna aaya"` into a chat they already have open is not.

This project is a bet on that gap: **payment insight should live inside the merchant's existing workflow, not require a separate one.** The dashboard isn't going away — this is a faster side door for the questions merchants ask most often ("how much came in today?", "when does my money settle?").

---

## What it does

| You type (English or Hinglish) | Bot replies with |
|---|---|
| `connect` / `start` | Walks you through linking your Razorpay account |
| `today` / `aaj ka collection` | Today's collected amount, captured vs failed count |
| `recent payments` / `last transactions` | Your last 5 payments |
| `this week` / `is hafte ka collection` | 7-day collection summary |
| `settlement` / `settlement kab` | Your most recent settlement |
| `disconnect` | Removes your credentials, unlinks the account |

The command parser matches natural phrasing (including common Hindi/Hinglish variants) rather than requiring exact slash-commands, because that's closer to how merchants actually type.

---

## Why Telegram, not WhatsApp

The original idea was WhatsApp-first, since that's the higher-usage channel for Indian small merchants. The MVP started there, on Twilio's WhatsApp sandbox.

It moved to Telegram for the hackathon build for one reason: **speed of iteration under a hard deadline.**

- WhatsApp Business API requires app-to-person approval, template message review, and (via Twilio) a sandbox with a join-code flow that's clunky to demo live.
- Telegram's Bot API needs one call to `@BotFather` and a webhook URL. No approval queue, no template whitelisting — you can go from zero to a working bot in minutes.

**This is a deployment-channel decision, not an architecture decision.** Every piece of business logic here — the merchant model, the Razorpay client, the command parser, the response formatter — is decoupled from Telegram specifically. Swapping in the WhatsApp Business API (via Meta's Cloud API, which doesn't have Twilio's sandbox friction) means writing a new adapter at the messaging layer; the onboarding state machine, encryption, and Razorpay integration underneath don't change. That's the intended next step post-hackathon, not a redesign.

---

## Security: what's a shortcut here vs. what's real

Being upfront about this, since it's the first thing worth scrutinizing:

**In this build**, a merchant links their account by sending their Razorpay Key ID and Key Secret as plain Telegram messages during onboarding. That is a deliberate demo shortcut, scoped to Razorpay **test-mode keys only** — it exists to make the "connect your account" flow demoable end-to-end in a 3-minute video without standing up a web app.

What's *not* a shortcut, and is already implemented:
- Key Secrets are never stored in plaintext. They're encrypted at rest with **AES-256-GCM** (random IV + auth tag per record) the moment onboarding completes — see `lib/encryption.js`.
- The Key Secret only exists in plaintext in-memory, for the duration of a single Razorpay API call, decrypted just-in-time from the stored ciphertext.
- `disconnect` performs a hard delete of the merchant record — no soft-delete, no lingering credentials.

**What changes for production**, and why the current flow wouldn't ship as-is:
- Chat messages pass through Telegram's servers and can sit in a user's message history — not an acceptable place for a live secret key, even encrypted at rest downstream. Production onboarding would collect credentials via an **authenticated HTTPS web form** (a short-lived onboarding link sent from the bot), never as chat text.
- Longer term, the better answer is avoiding raw API keys entirely — Razorpay's **OAuth-based Partner/Route integration** lets a merchant authorize access via a redirect flow instead of copy-pasting a secret, which removes the credential-handling problem altogether.
- Rate limiting and webhook signature verification on the Telegram side would also be hardened before any real deployment — both out of scope for the hackathon MVP.

The point being demoed here is the *product experience* of chat-native payment insight. The credential flow is intentionally the cheapest correct-enough version of that, not a claim that this is how it'd ship.

---

## Architecture

```
Telegram (webhook) → Express server → telegram.controller
                                              │
                        ┌─────────────────────┼─────────────────────┐
                        ▼                                           ▼
              onboarding.controller                        query.controller
              (link/unlink account,                    (parses "today", "settlement",
               state machine)                            etc. → fetches + formats)
                        │                                           │
                        ▼                                           ▼
                merchant.service ──── AES-256-GCM ────►      razorpay.client
              (Mongoose / MongoDB)      encryption          (Razorpay REST API)
```

- **`features/telegram-bot/`** — webhook handling, command parsing, onboarding state machine, per-merchant response cache
- **`features/merchant/`** — merchant model + service (credential storage, onboarding state)
- **`features/razorpay/`** — Razorpay API client + response formatting into chat-friendly text
- **`lib/`** — encryption, DB connection, date-range helpers, low-level Telegram send helper

Feature-sliced by design: the Telegram layer, the merchant/credential layer, and the Razorpay layer don't reach into each other's internals, which is what makes the "swap Telegram for WhatsApp later" claim above actually true rather than aspirational.

---

## Tech stack

- **Node.js / Express** — webhook server
- **MongoDB / Mongoose** — merchant + credential storage
- **Telegram Bot API** — via `axios`, webhook-based (not long polling)
- **Razorpay REST API** — payments, settlements (test mode)
- **AES-256-GCM** (Node `crypto`) — credential encryption at rest

---

## Setup

### Prerequisites
- Node.js 18+
- A MongoDB instance (local or Atlas)
- A Telegram bot token from [@BotFather](https://t.me/BotFather)
- A Razorpay **test mode** account (Key ID + Key Secret)
- A way to expose your local server for the Telegram webhook — [ngrok](https://ngrok.com/) works for a demo

### 1. Clone and install
```bash
git clone https://github.com/Imdilshan/Razorpay-Telegram-Bridge.git
cd Razorpay-Telegram-Bridge
npm install
```

### 2. Configure environment
Copy `.env.example` to `.env` and fill in:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/razorpay-telegram-bridge

# 32-byte (64 hex char) key for AES-256-GCM — generate with:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY=

TELEGRAM_BOT_TOKEN=

RAZORPAY_TEST_KEY_ID=
RAZORPAY_TEST_KEY_SECRET=
```

### 3. Seed demo data (optional, for a clean demo)
```bash
node scripts/seed-test-merchant.js
node scripts/seed-demo-transactions.js
```

### 4. Run the server
```bash
npm run dev
```

### 5. Expose it and set the Telegram webhook
```bash
ngrok http 3000
```
Then point Telegram at your tunnel:
```bash
curl -F "url=https://<your-ngrok-domain>/webhook/telegram" \
  https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook
```

### 6. Talk to your bot
Open your bot in Telegram and send `start`.

---

## Roadmap (post-hackathon)

- WhatsApp Business API adapter alongside Telegram (same core, new messaging layer)
- Web-based onboarding link to replace chat-based credential entry
- Razorpay OAuth/Partner flow to remove raw key handling entirely
- Daily/weekly digest pushed proactively, not just on-demand
- Multi-language responses beyond Hinglish keyword matching

---

## Hackathon scope note

Built in a single day. Deliberately excludes: AI/LLM integration, a web dashboard, payment creation, and refunds — kept to a 4-feature MVP (today's collections, recent transactions, weekly performance, settlement status) so it could be finished and demoed cleanly rather than left half-built.