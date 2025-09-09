-- Make the category column nullable to allow transition to category_id
-- This is a temporary change to support both old and new schema
ALTER TABLE competitors ALTER COLUMN category DROP NOT NULL;

-- Ensure all competitors have either a category string or category_id
UPDATE competitors 
SET category = 'Direct Competitor' 
WHERE category IS NULL 
  AND category_id IS NULL;