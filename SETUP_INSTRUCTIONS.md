# Setup Instructions for New Features

## Database Migration

To apply the new database schema for custom categories and tags, run the following SQL in your Supabase SQL Editor:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the migration from `supabase/migrations/001_add_categories_and_tags.sql`

## Features Added

### 1. Custom Categories for Competitors
- Users can now create custom categories with names, descriptions, and colors
- Categories are managed through a dedicated UI component
- Each competitor must be assigned to a category
- Categories can be deleted (competitors will need to be reassigned)

### 2. Tagging System for Thoughts
- Tags can be created on-the-fly when adding thoughts
- Tags are automatically assigned random colors
- Multiple tags can be added to each thought
- Tags are displayed with the thought entries

## How to Use

### Managing Categories
1. Click "Manage Categories" button on the Competitors tab
2. Click "Add Category" to create a new category
3. Enter name, description (optional), and choose a color
4. Categories appear in the dropdown when adding competitors

### Using Tags
1. Go to the Research & Thoughts tab
2. Select "Thought" as the type
3. In the Tags field, start typing to search existing tags
4. Press Enter to create a new tag if it doesn't exist
5. Click on suggested tags to add them
6. Remove tags by clicking the × button

## Environment Variables

Make sure your `.env.local` file contains:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Note on Migration

The migration script:
- Creates new tables for categories and tags
- Preserves existing data by migrating current category strings to the new table
- Adds foreign key relationships
- Sets up indexes for performance
- Enables Row Level Security (RLS)

After running the migration, existing competitors will automatically be linked to their categories.