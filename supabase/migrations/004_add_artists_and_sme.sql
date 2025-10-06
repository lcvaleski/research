-- Create artists table
CREATE TABLE artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  profile_url TEXT NOT NULL,
  specialty TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create SME (Subject Matter Experts) table
CREATE TABLE sme (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  profile_url TEXT NOT NULL,
  expertise TEXT,
  organization TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS for artists
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;

-- Enable RLS for sme
ALTER TABLE sme ENABLE ROW LEVEL SECURITY;

-- Create policies for artists
CREATE POLICY "Artists are viewable by everyone" ON artists
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert artists" ON artists
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update artists" ON artists
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete artists" ON artists
  FOR DELETE USING (true);

-- Create policies for sme
CREATE POLICY "SME are viewable by everyone" ON sme
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert sme" ON sme
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update sme" ON sme
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete sme" ON sme
  FOR DELETE USING (true);