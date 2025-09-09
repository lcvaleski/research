# Startup Research Board

A brutally simple research board for startup founders to track competitors and save research links/thoughts.

## Setup

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new project
2. Once created, go to Settings → API
3. Copy your Project URL and anon/public key

### 2. Set up the Database

Run this SQL in your Supabase SQL editor (copy the entire script from `/supabase/schema.sql` or use this):

```sql
-- Create competitors table
CREATE TABLE IF NOT EXISTS competitors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create research links and thoughts table
CREATE TABLE IF NOT EXISTS research (
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
CREATE INDEX IF NOT EXISTS competitors_category_idx ON competitors(category);
CREATE INDEX IF NOT EXISTS competitors_created_at_idx ON competitors(created_at DESC);
CREATE INDEX IF NOT EXISTS research_type_idx ON research(type);
CREATE INDEX IF NOT EXISTS research_created_at_idx ON research(created_at DESC);

-- Enable RLS
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE research ENABLE ROW LEVEL SECURITY;

-- Allow all operations (for simplicity)
CREATE POLICY "Allow all operations" ON competitors
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations" ON research
  FOR ALL USING (true) WITH CHECK (true);
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

### Competitors Tab
- Track competitor companies with name and website
- Categorize competitors (Direct, Indirect, Potential, Adjacent Market, etc.)
- Add notes about each competitor
- Filter by category
- Grid view for easy scanning

### Research & Thoughts Tab
- Save research links with notes
- Add general thoughts and ideas
- Optional categorization
- Chronological feed view

Brutally simple, no authentication (add if needed)
