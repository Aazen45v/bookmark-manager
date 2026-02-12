# Bookmark Manager

A simple, real-time bookmark manager built with Next.js, Supabase, and Tailwind CSS.

## Features

- 🔐 Google Authentication only (no email/password)
- 📚 Add and delete bookmarks (URL + title)
- 🔒 Private bookmarks (each user sees only their own)
- ⚡ Real-time updates (changes sync across tabs instantly)
- 🚀 Deployed on Vercel

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React, Tailwind CSS
- **Backend/Auth:** Supabase (Auth, Database, Realtime)
- **Deployment:** Vercel

## Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd bookmark-manager
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase/schema.sql`
3. Enable Google Auth:
   - Go to Authentication > Providers > Google
   - Enable Google provider
   - Get your OAuth credentials from [Google Cloud Console](https://console.cloud.google.com)
4. Copy your project URL and anon key

### 3. Environment Variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new OAuth 2.0 Client ID
3. Add authorized redirect URI:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
4. Copy Client ID and Client Secret to Supabase Google provider settings

### 5. Enable Realtime

In Supabase Dashboard:
- Go to Database > Replication > Source
- Enable replication for the `bookmarks` table

### 6. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 7. Deploy to Vercel

```bash
npx vercel --prod
```

Add environment variables in Vercel dashboard with your Supabase credentials.

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main bookmark manager UI
│   ├── auth/
│   │   ├── callback/route.ts # OAuth callback handler
│   │   └── auth-code-error/page.tsx  # Auth error page
│   └── layout.tsx
├── lib/
│   ├── supabase-client.ts    # Browser client
│   └── supabase-server.ts    # Server client for middleware
├── middleware.ts             # Auth session refresh
└── components/               # (optional) reusable components
supabase/
└── schema.sql               # Database schema with RLS policies
```

## Problems Encountered & Solutions

### 1. Authentication Session Persistence

**Problem:** After Google OAuth redirect, the session wasn't being persisted properly, causing users to be logged out on page refresh.

**Solution:** Implemented Supabase SSR (Server-Side Rendering) with a custom middleware (`src/middleware.ts`) that refreshes the session on every request using `exchangeCodeForSession()` in the auth callback route.

### 2. Real-time Updates Not Working

**Problem:** Bookmark list didn't update in real-time when adding bookmarks in a different tab.

**Solution:**
1. Added Supabase channel subscription using `.channel('bookmarks_changes').on('postgres_changes', ...)`
2. Applied RLS filters (`filter: user_id=eq.${user.id}`) to only listen to the current user's bookmarks
3. Enabled replication for the bookmarks table in Supabase dashboard

### 3. Google Auth Redirect Issues

**Problem:** OAuth redirect URL didn't match between Supabase and Google Cloud Console configuration.

**Solution:** Ensured the redirect URI format matches exactly:
- Supabase expects: `https://[project-ref].supabase.co/auth/v1/callback`
- Added this exact URL in Google Cloud Console > Credentials > OAuth 2.0 Client IDs

### 4. TypeScript Errors with Supabase SSR

**Problem:** TypeScript complained about `cookies()` being used in unexpected contexts in the server client.

**Solution:** Wrapped cookie operations in try/catch blocks and properly typed the cookie options in the Supabase server client configuration.

## License

MIT
