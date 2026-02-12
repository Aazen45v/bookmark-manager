# 🔖 Bookmark Manager

A simple, real-time bookmark manager built with Next.js, Supabase, and Tailwind CSS.

![Bookmark Manager Demo](https://via.placeholder.com/800x400?text=Bookmark+Manager+Demo+Screenshot)

## ✨ Features

- 🔐 **Google Authentication only** — No email/password required
- 📚 **Add & Delete bookmarks** — Store URLs with custom titles
- 🔒 **Private by default** — Each user sees only their own bookmarks
- ⚡ **Real-time sync** — Changes appear instantly across all tabs
- 🎨 **Clean UI** — Built with Tailwind CSS

## 🚀 Live Demo

**[https://bookmark-manager-inky.vercel.app](https://bookmark-manager-inky.vercel.app)**

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 15** | React framework with App Router |
| **Supabase** | Auth, Database, Realtime subscriptions |
| **Tailwind CSS** | Styling |
| **Vercel** | Deployment |

## 📸 Demo Screenshots

### Page
![ Sign InSign In](https://via.placeholder.com/800x500?text=Sign+In+with+Google)

### Dashboard with Bookmarks
![Dashboard](https://via.placeholder.com/800x500?text=Bookmark+Dashboard)

### Real-time Sync Demo
![Real-time Demo](https://via.placeholder.com/800x500?text=Real-time+Sync+Demo)

*(Add your own screenshots by replacing these placeholders)*

## ⚡ Real-time Demonstration

To see real-time sync in action:

1. Open the app in **two different browser tabs**
2. Sign in with the **same Google account** in both tabs
3. Add a bookmark in Tab A
4. Watch it **appear instantly** in Tab B without refreshing
5. Delete a bookmark in Tab B
6. Watch it **disappear** from Tab A

![Real-time Sync](https://via.placeholder.com/800x300?text=Real-time+Sync+Animation)

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

### 6. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 7. Deploy to Vercel

```bash
npx vercel --prod
```

Add environment variables in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🐛 Problems Encountered & Solutions

### 1. Authentication Session Persistence

**Problem:** After Google OAuth redirect, sessions weren't persisting properly.

**Solution:** Implemented Supabase SSR with custom middleware that refreshes sessions using `exchangeCodeForSession()` in the auth callback route.

### 2. Real-time Updates Not Working

**Problem:** Bookmarks didn't sync across tabs.

**Solution:** 
- Added Supabase channel subscription with `postgres_changes` event listener
- Applied RLS filters (`user_id=eq.${user.id}`) for security
- Enabled table replication in Supabase dashboard

### 3. Next.js 15+ cookies() API Changes

**Problem:** TypeScript errors with `cookies()` being async.

**Solution:** 
- Added `await` before `cookies()` calls
- Updated `createClient()` to be async in `supabase-server.ts`

### 4. OAuth Redirect URL Mismatch

**Problem:** Google Auth redirect URI didn't match.

**Solution:** 
- Used exact format: `https://[project-ref].supabase.co/auth/v1/callback`
- Added this exact URL in Google Cloud Console credentials

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
