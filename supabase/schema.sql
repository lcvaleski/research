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

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS competitors_category_idx ON competitors(category);
CREATE INDEX IF NOT EXISTS competitors_created_at_idx ON competitors(created_at DESC);
CREATE INDEX IF NOT EXISTS research_type_idx ON research(type);
CREATE INDEX IF NOT EXISTS research_created_at_idx ON research(created_at DESC);

-- Enable Row Level Security
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE research ENABLE ROW LEVEL SECURITY;

-- Create policies that allow all operations (for simplicity)
-- In production, you'd want more restrictive policies
CREATE POLICY "Allow all operations" ON competitors
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations" ON research
  FOR ALL
  USING (true)
  WITH CHECK (true);