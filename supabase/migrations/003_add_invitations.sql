CREATE TABLE IF NOT EXISTS invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS invitations_created_at_idx ON invitations(created_at);

ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations" ON invitations
  FOR ALL
  USING (true)
  WITH CHECK (true);