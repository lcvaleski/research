-- Create categories table for custom competitor categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tags table for tagging thoughts
CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#10B981',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create junction table for research-tags many-to-many relationship
CREATE TABLE IF NOT EXISTS research_tags (
  research_id UUID REFERENCES research(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (research_id, tag_id)
);

-- Modify competitors table to reference categories
ALTER TABLE competitors ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id);

-- Migrate existing category data to new categories table
INSERT INTO categories (name) 
SELECT DISTINCT category FROM competitors 
WHERE category IS NOT NULL
ON CONFLICT (name) DO NOTHING;

-- Update competitors to use category_id
UPDATE competitors c
SET category_id = cat.id
FROM categories cat
WHERE c.category = cat.name;

-- After migration, we'll drop the old category column (commented out for safety)
-- ALTER TABLE competitors DROP COLUMN category;

-- Create indexes
CREATE INDEX IF NOT EXISTS categories_name_idx ON categories(name);
CREATE INDEX IF NOT EXISTS tags_name_idx ON tags(name);
CREATE INDEX IF NOT EXISTS research_tags_research_idx ON research_tags(research_id);
CREATE INDEX IF NOT EXISTS research_tags_tag_idx ON research_tags(tag_id);
CREATE INDEX IF NOT EXISTS competitors_category_id_idx ON competitors(category_id);

-- Enable RLS for new tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for new tables
CREATE POLICY "Allow all operations" ON categories
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations" ON tags
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations" ON research_tags
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert default categories if none exist
INSERT INTO categories (name, description, color) VALUES
  ('Direct Competitor', 'Companies directly competing in the same market', '#EF4444'),
  ('Indirect Competitor', 'Companies offering alternative solutions', '#F59E0B'),
  ('Potential Competitor', 'Companies that might enter our market', '#8B5CF6'),
  ('Adjacent Market', 'Companies in related markets', '#3B82F6'),
  ('Enterprise', 'Enterprise-focused companies', '#6B7280'),
  ('SMB', 'Small and medium business focused', '#10B981'),
  ('Consumer', 'Consumer-focused companies', '#EC4899')
ON CONFLICT (name) DO NOTHING;