# 🔖 Bookmark Manager

A modern, real-time bookmark manager built with Next.js 15, Supabase, and Tailwind CSS.

![Bookmark Manager Demo](docs/demo-screenshot.png)

## ✨ Features

- 🔐 **Google Authentication only** — Secure, passwordless login
- 📚 **Add & Delete bookmarks** — Store URLs with custom titles
- 🔒 **Private by default** — Row Level Security (RLS) ensures data isolation
- ⚡ **Real-time sync** — Changes appear instantly across all devices/tabs
- 🎨 **Modern UI** — Beautiful gradient design with responsive layout
- 🚀 **Production ready** — Deployed on Vercel with automatic deployments

## 🚀 Live Demo

**[https://bookmark-manager-inky.vercel.app](https://bookmark-manager-inky.vercel.app)**

## 🔗 Project Links

| Service | URL |
|---------|-----|
| **Production App** | https://bookmark-manager-inky.vercel.app |
| **GitHub Repository** | https://github.com/Aazen45v/bookmark-manager |
| **Supabase Project** | https://supabase.com/dashboard/project/tnqahabqivagmnoiyskk |

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15 | React framework with App Router, SSR support |
| **React** | 19 | UI library |
| **Supabase** | Latest | Auth, Database, Realtime subscriptions |
| **Tailwind CSS** | Latest | Utility-first styling |
| **Vercel** | Latest | Deployment and CI/CD |

## 📸 Demo Screenshots

### Login Page
![Login Page](docs/login-page.png)
*Professional gradient design with Google Sign-In*

### Dashboard
![Dashboard](docs/dashboard.png)
*Clean, modern interface with real-time sync*

### Add Bookmark
![Add Bookmark](docs/add-bookmark.png)
*Simple and intuitive bookmark creation*

*(Add your own screenshots to the `docs/` folder)*

## 🎨 UI/UX Highlights

- **Gradient backgrounds** — Modern indigo-to-purple color scheme
- **Responsive design** — Works perfectly on mobile, tablet, and desktop
- **Loading states** — Smooth spinners and transitions
- **Interactive feedback** — Hover effects, shadows, and animations
- **Accessible** — Semantic HTML and keyboard navigation support

Test the app with your Google account. All data is private and isolated per user.

## ⚡ Real-time Demonstration

To see real-time sync in action:

1. Open the app in **two different browser tabs** or devices
2. Sign in with the **same Google account** in both
3. Add a bookmark in Tab A
4. Watch it **appear instantly** in Tab B without refreshing
5. Delete a bookmark in Tab B
6. Watch it **disappear** from Tab A

This is powered by **Supabase Realtime** subscriptions with PostgreSQL replication.

## 🏗️ Project Structure

```
bookmark-manager/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main app (auth + bookmarks UI)
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css            # Global styles
│   │   └── auth/
│   │       ├── callback/
│   │       │   └── route.ts       # OAuth callback handler
│   │       └── auth-code-error/
│   │           └── page.tsx        # Auth error page
│   ├── lib/
│   │   ├── supabase-client.ts     # Browser client
│   │   └── supabase-server.ts     # Server client for SSR
│   ├── middleware.ts               # Session refresh middleware
│   └── components/                # (optional) reusable components
├── supabase/
│   └── schema.sql                 # Database schema + RLS policies
├── public/                        # Static assets
├── .env.local.example             # Environment variables template
├── README.md                      # This file
├── next.config.ts                 # Next.js configuration
├── tailwind.config.ts             # Tailwind CSS configuration
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- A [Supabase](https://supabase.com) account
- A [Google Cloud](https://console.cloud.google.com) account (for OAuth)

### 1. Clone the Repository

```bash
git clone https://github.com/Aazen45v/bookmark-manager.git
cd bookmark-manager
npm install
```

### 2. Supabase Setup

#### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Click **"New Project"**
3. Enter:
   - **Name:** `bookmark-manager`
   - **Password:** Generate and save a strong password
4. Wait for project creation (~1 minute)

#### Run Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Copy and run the contents of `supabase/schema.sql`:

```sql
-- Create bookmarks table with Row Level Security (RLS)
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Policies for user data isolation
CREATE POLICY "Users can view own bookmarks" ON bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks" ON bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks" ON bookmarks
  FOR DELETE USING (auth.uid() = user_id);
```

#### Enable Google Auth

1. Go to **Authentication** → **Providers** → **Google**
2. Toggle **Enable Google** to ON

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable the **Google+ API** or **People API**
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
5. Configure:
   - **Application type:** Web application
   - **Name:** `bookmark-manager`
   - **Authorized redirect URI:**
     ```
     https://[YOUR_SUPABASE_PROJECT_REF].supabase.co/auth/v1/callback
     ```
6. Copy **Client ID** and **Client Secret**
7. Paste them in Supabase **Authentication** → **Google** settings

### 4. Enable Realtime

1. In Supabase Dashboard, go to **Database** → **Replication**
2. Enable replication for the `bookmarks` table

### 5. Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

> **Important:** For production deployment on Vercel, add these variables in your Vercel project settings under Environment Variables.

### 6. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 7. Deploy to Vercel

The easiest way to deploy is with [Vercel](https://vercel.com):

```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel --prod
```

During deployment, add these environment variables in Vercel dashboard:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | https://tnqahabqivagmnoiyskk.supabase.co |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |

#### Production URL
**App:** https://bookmark-manager-inky.vercel.app  
**Repo:** https://github.com/Aazen45v/bookmark-manager  
**Supabase Project ID:** tnqahabqivagmnoiyskk

## 🐛 Troubleshooting & Solutions

### 1. Authentication Redirect Loop

**Problem:** After Google login, app redirects to localhost instead of production URL.

**Solution:**
1. Go to Supabase Dashboard → **Settings** → **Site URL**
2. Add your production URL: `https://bookmark-manager-inky.vercel.app`
3. Go to Google Cloud Console → **Credentials** → Your OAuth Client
4. Add authorized redirect URI:
   ```
   https://bookmark-manager-inky.vercel.app/auth/callback
   ```
5. Redeploy to Vercel

### 2. Authentication Session Persistence

**Problem:** User gets logged out on page refresh.

**Solution:** Implemented Supabase SSR with custom middleware that refreshes sessions using `exchangeCodeForSession()` in the auth callback route (`src/app/auth/callback/route.ts`).

### 3. Real-time Updates Not Working

**Problem:** Bookmarks don't sync across tabs.

**Solution:**
- Added Supabase channel subscription with `postgres_changes` event listener
- Applied RLS filters (`user_id=eq.${user.id}`) for security and targeting
- Enabled table replication in Supabase Dashboard: **Database** → **Replication** → Enable `bookmarks` table

### 4. Next.js 15+ cookies() API Changes

**Problem:** TypeScript errors - `Property 'get' does not exist on type 'Promise<ReadonlyRequestCookies>'`

**Solution:**
- Added `await` before `cookies()` calls in `src/lib/supabase-server.ts`
- Updated `createClient()` to be an async function

### 5. OAuth Redirect URL Mismatch

**Problem:** Google Auth fails with redirect URI error.

**Solution:**
- Supabase expects: `https://[project-ref].supabase.co/auth/v1/callback`
- Google Cloud Console needs the exact same URL in authorized redirect URIs

### 6. Build Errors on Vercel

**Problem:** Build fails with missing environment variables.

**Solution:** Ensure all environment variables are added in Vercel project settings:
- Go to Vercel Dashboard → Project → **Settings** → **Environment Variables**
- Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Select all environments (Production, Preview, Development)

## 📝 API Reference

### Database Schema

```sql
Table: bookmarks
- id: UUID (PRIMARY KEY)
- user_id: UUID (REFERENCES auth.users)
- url: TEXT (NOT NULL)
- title: TEXT (NOT NULL)
- created_at: TIMESTAMP WITH TIME ZONE
```

### RLS Policies

| Operation | Policy |
|-----------|--------|
| SELECT | User can only view own bookmarks |
| INSERT | User can only insert their own bookmarks |
| DELETE | User can only delete their own bookmarks |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this for your own projects!

## 👨‍💻 Author

**Mohammad Aazen**
- GitHub: [@Aazen45v](https://github.com/Aazen45v)
- LinkedIn: [aazen](https://www.linkedin.com/in/aazen/)
- Email: mohdaazen@gmail.com

---

Built with ❤️ for the Abstrabit Fullstack Interview Challenge
