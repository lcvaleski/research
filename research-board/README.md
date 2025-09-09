# Research Board

A brutally simple research board for startup founders to save links and thoughts.

## Setup

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new project
2. Once created, go to Settings → API
3. Copy your Project URL and anon/public key

### 2. Set up the Database

Run this SQL in your Supabase SQL editor:

```sql
-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('link', 'thought')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  url TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS posts_type_idx ON posts(type);
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON posts(created_at DESC);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Allow all operations (for simplicity)
CREATE POLICY "Allow all operations" ON posts
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

### 3. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`
2. Add your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Install and Run

```bash
npm install
npm run dev
```

### 5. Deploy to Vercel

1. Push to GitHub
2. Import to Vercel
3. Add environment variables in Vercel project settings
4. Deploy

## Features

- Add links with notes
- Add general thoughts
- Optional categories for organization
- Delete posts
- Brutally simple, no authentication (add if needed)
