# Answerly

AI-powered phone receptionist for businesses. Never miss a call again.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Telephony**: Twilio
- **Styling**: Tailwind CSS
- **Deployment**: Vercel (recommended)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy the example file and fill in your credentials:

```bash
cp .env.local.example .env.local
```

You'll need:
- **Supabase**: Project URL, anon key, and service role key from your Supabase dashboard
- **Twilio**: Account SID, auth token, and a phone number

### 3. Set up the database

Run the SQL schema in your Supabase SQL Editor:
- Open `answerly-schema.sql`
- Paste into Supabase SQL Editor
- Execute

### 4. Configure Twilio webhooks

In your Twilio console, set up your phone number's webhook URLs:

- **Voice webhook (POST)**: `https://your-domain.com/api/twilio/voice`
- **Status callback (POST)**: `https://your-domain.com/api/twilio/status`

For local development, use ngrok:

```bash
ngrok http 3000
```

Then use the ngrok URL in Twilio's webhook config.

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
  app/
    api/
      twilio/
        voice/route.ts      # Incoming call webhook
        status/route.ts      # Call status updates
    auth/
      login/page.tsx         # Login page
      signup/page.tsx        # Signup + org creation
      callback/route.ts      # Supabase auth callback
    dashboard/
      layout.tsx             # Dashboard shell (sidebar + topbar)
      page.tsx               # Overview with metrics
      calls/
        page.tsx             # Call log
        [id]/page.tsx        # Call detail + transcript
      notifications/page.tsx # Notifications feed
      analytics/page.tsx     # Call volume stats
      settings/page.tsx      # Twilio, AI, hours, team, billing
      help/page.tsx          # Documentation
    layout.tsx               # Root layout
    page.tsx                 # Redirects to /dashboard
  components/
    layout/
      sidebar.tsx            # Navigation sidebar
      topbar.tsx             # Page header bar
  lib/
    supabase/
      client.ts              # Browser Supabase client
      server.ts              # Server Supabase client
      admin.ts               # Service role client (API routes only)
    auth.ts                  # getCurrentUser, getCurrentOrg helpers
    utils.ts                 # Formatting utilities
  types/
    database.ts              # TypeScript types for all tables
  middleware.ts              # Auth redirects
```

## How It Works

1. Business forwards their phone number to their Answerly Twilio number
2. Twilio receives the call and hits `/api/twilio/voice`
3. The API route looks up which org owns that number
4. A call record is created in the database
5. A notification is auto-generated via database trigger
6. TwiML response greets the caller (v1: simple greeting, v2: AI voice)
7. When the call ends, `/api/twilio/status` updates the call record
8. The dashboard displays all calls, transcripts, and analytics in real-time

## Roadmap

- [ ] AI voice conversation (OpenAI Realtime / ElevenLabs + Twilio Media Streams)
- [ ] AI call summaries and intent classification
- [ ] SMS follow-up messages
- [ ] One-click callback
- [ ] Calendar integration (Google Calendar)
- [ ] Call recording and playback
