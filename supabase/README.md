# Supabase Database Setup Guide

This directory contains SQL migration scripts and configuration for setting up the Dungeon Crawler API database in Supabase.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Database Schema](#database-schema)
- [Migration Scripts](#migration-scripts)
- [Environment Configuration](#environment-configuration)
- [Running Migrations](#running-migrations)
- [Security & Access Control](#security--access-control)
- [Troubleshooting](#troubleshooting)

## Prerequisites

1. **Supabase Account**: Create a free account at [https://supabase.com](https://supabase.com)
2. **Supabase Project**: Create a new project in your Supabase dashboard
3. **Project Credentials**: You'll need:
   - Project URL
   - Anon/Public Key
   - Service Role Key (for admin operations)

## Quick Start

### 1. Set Up Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create an account
2. Click "New Project"
3. Choose an organization and fill in project details:
   - **Name**: dungeoncrawler-api (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Select the closest region to your users
4. Wait for the project to finish provisioning (usually 1-2 minutes)

### 2. Get Your API Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. You'll find three important values:
   - **Project URL**: Something like `https://xyzabc123.supabase.co`
   - **anon/public key**: A long JWT token (safe for client-side use)
   - **service_role key**: Another JWT token (keep this secret!)

### 3. Run Database Migrations

You have two options for running migrations:

#### Option A: Using Supabase SQL Editor (Recommended for beginners)

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Open `migrations/001_initial_schema.sql` from this repository
4. Copy the entire contents and paste into the SQL Editor
5. Click "Run" or press `Ctrl+Enter` to execute
6. You should see "Success. No rows returned" message
7. Optionally, repeat for `migrations/002_seed_data.sql` to add test data

#### Option B: Using Supabase CLI (Recommended for advanced users)

1. Install the Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. Run migrations:
   ```bash
   supabase db push
   ```

### 4. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xyzabc123.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   STORAGE_MODE=supabase
   ```

3. **Important**: Never commit `.env.local` to version control!

### 5. Install Dependencies and Start

If you haven't already installed the Supabase client:

```bash
npm install @supabase/supabase-js
npm run dev
```

## Database Schema

The database consists of 9 main tables:

### Core Tables

1. **dungeons** - Top-level dungeon definitions
   - Stores dungeon metadata (name, difficulty, level, size, description)
   - Primary key: `id` (UUID)

2. **dungeon_floors** - Multi-floor support (optional)
   - Links to dungeons, supports multi-level dungeons
   - Primary key: `id` (UUID)
   - Foreign key: `dungeon_id` → dungeons(id)

3. **rooms** - Individual rooms within dungeons
   - Stores room data (type, coordinates, description, status)
   - Primary key: `id` (UUID)
   - Foreign keys: `dungeon_id` → dungeons(id), `floor_id` → dungeon_floors(id)

4. **room_connections** - Directional connections between rooms
   - Defines how rooms connect (north, south, east, west)
   - Primary key: `id` (UUID)
   - Foreign keys: `source_room_id`, `target_room_id` → rooms(id)

### Content Tables

5. **monsters** - Enemy definitions within rooms
   - Stores monster stats (health, attack, defense, speed)
   - Primary key: `id` (UUID)
   - Foreign key: `room_id` → rooms(id)

6. **puzzles** - Puzzle configurations (one per room)
   - Primary key: `id` (UUID)
   - Foreign key: `room_id` → rooms(id)

7. **story_events** - Narrative story events (one per room)
   - Stores story choices and consequences as JSONB
   - Primary key: `id` (UUID)
   - Foreign key: `room_id` → rooms(id)

8. **lore_entries** - Lore fragments and background information
   - Primary key: `id` (UUID)
   - Foreign key: `room_id` → rooms(id)

9. **secrets** - Hidden content and secrets
   - Primary key: `id` (UUID)
   - Foreign key: `room_id` → rooms(id)

### Key Features

- **UUIDs**: All tables use UUID primary keys for better distribution and security
- **Timestamps**: Automatic `created_at` and `updated_at` tracking
- **Cascade Deletes**: Deleting a dungeon automatically deletes all related data
- **Constraints**: Data validation at the database level (difficulty levels, positive stats, etc.)
- **Indexes**: Optimized for common query patterns
- **Row Level Security**: Fine-grained access control (see Security section)

## Migration Scripts

### 001_initial_schema.sql

Creates the complete database schema including:
- All 9 tables with proper relationships
- Indexes for query optimization
- Triggers for automatic timestamp updates
- Row Level Security policies
- Check constraints for data validation

**When to run**: First time setup, or when setting up a new environment

### 002_seed_data.sql

Provides example test data:
- One sample dungeon with 3 rooms
- Room connections
- One test monster

**When to run**: 
- Optional, for development/testing
- Not recommended for production
- You may want to modify this to migrate your existing data

## Environment Configuration

### Required Environment Variables

```env
# Public variables (safe for client-side)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Server-only variables (keep secret!)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Application config
STORAGE_MODE=supabase  # or 'file' for legacy mode
```

### Variable Explanations

- **NEXT_PUBLIC_SUPABASE_URL**: Your Supabase project URL
  - Found in: Settings → API → Project URL
  - Safe to expose to browser

- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Public API key
  - Found in: Settings → API → Project API keys → anon/public
  - Safe to expose to browser
  - Respects Row Level Security policies

- **SUPABASE_SERVICE_ROLE_KEY**: Admin API key
  - Found in: Settings → API → Project API keys → service_role
  - **MUST be kept secret** - has full database access
  - Only use server-side (API routes, server components)
  - Never expose to client-side code

- **STORAGE_MODE**: Controls data persistence layer
  - `supabase`: Use Supabase database (default)
  - `file`: Use legacy JSON file storage
  - Useful for gradual migration or testing

## Running Migrations

### Method 1: Supabase Dashboard (Easiest)

1. Log into your Supabase project
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents of `001_initial_schema.sql`
5. Paste into the editor
6. Click **Run** or press `Ctrl/Cmd + Enter`
7. Wait for "Success. No rows returned" message
8. Repeat for other migration files if needed

**Pros**: No CLI needed, visual feedback, easy to troubleshoot
**Cons**: Manual process, need to copy-paste

### Method 2: Supabase CLI (Advanced)

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Initialize Supabase in your project (if not already done):
   ```bash
   supabase init
   ```

3. Link to your remote project:
   ```bash
   supabase link --project-ref your-project-ref
   ```
   Find your project ref in: Settings → General → Reference ID

4. Push migrations:
   ```bash
   supabase db push
   ```

**Pros**: Automated, version controlled, repeatable
**Cons**: Requires CLI setup, more complex for beginners

### Method 3: Database Connection (Direct)

If you prefer using a PostgreSQL client:

1. Get your database connection string from: Settings → Database → Connection string → URI
2. Use tools like `psql`, pgAdmin, or DBeaver
3. Connect and run the SQL files directly

## Security & Access Control

### Row Level Security (RLS)

All tables have RLS enabled with the following default policies:

**Read Access (SELECT)**:
- ✅ Public read access for all data
- Anyone can view dungeons, rooms, monsters, etc.

**Write Access (INSERT, UPDATE, DELETE)**:
- ✅ Authenticated users can create/modify/delete
- ✅ Service role key has full access
- ❌ Anonymous users cannot modify data

### Customizing Security

To modify security policies:

1. Go to **Authentication** → **Policies** in Supabase dashboard
2. Select the table you want to modify
3. Edit or create new policies

Example: Make dungeons user-specific:
```sql
-- Only allow users to see their own dungeons
DROP POLICY IF EXISTS "Allow public read access to dungeons" ON dungeons;

CREATE POLICY "Users can view their own dungeons"
  ON dungeons FOR SELECT
  USING (auth.uid() = user_id);

-- Note: You'd need to add a user_id column to the dungeons table first
```

### API Key Security

**Anon Key** (NEXT_PUBLIC_SUPABASE_ANON_KEY):
- ✅ Safe to expose in browser/client code
- ✅ Respects RLS policies
- ✅ Limited to authenticated user's permissions
- Use for: Client-side queries, authentication

**Service Role Key** (SUPABASE_SERVICE_ROLE_KEY):
- ❌ NEVER expose to browser/client
- ❌ NEVER commit to version control
- ✅ Bypasses all RLS policies
- ✅ Full admin access
- Use for: Server-side operations, migrations, admin tasks

## Troubleshooting

### "relation does not exist" error

**Problem**: Tables haven't been created yet
**Solution**: Run the `001_initial_schema.sql` migration

### "permission denied" error

**Problem**: RLS policies preventing access
**Solutions**:
1. Make sure you're using the correct API key
2. Check if RLS policies allow your operation
3. Use service role key for admin operations

### "duplicate key value violates unique constraint"

**Problem**: Trying to insert data with duplicate IDs or unique values
**Solutions**:
1. Let the database generate UUIDs automatically
2. Check for existing data before inserting
3. Use `ON CONFLICT` clauses in your queries

### Connection timeouts

**Problem**: Database not responding
**Solutions**:
1. Check your internet connection
2. Verify project URL is correct
3. Check Supabase service status
4. Verify your project isn't paused (free tier projects pause after inactivity)

### Wrong credentials

**Problem**: Invalid API keys
**Solutions**:
1. Double-check keys in Supabase dashboard (Settings → API)
2. Make sure you copied the full key (they're very long!)
3. Check for extra spaces or line breaks
4. Regenerate keys if needed (Settings → API → Reset)

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli/introduction)

## Migration from File-Based Storage

If you're migrating from the existing JSON file storage:

1. Keep your existing `dungeon-data.json` as backup
2. Set `STORAGE_MODE=file` in `.env.local` to keep using file storage
3. Run migrations to set up Supabase
4. Create a migration script (see `scripts/migrate-to-supabase.ts` - to be created)
5. Test with `STORAGE_MODE=supabase`
6. Once verified, you can remove the JSON file or keep it as backup

## Next Steps

After setting up the database:

1. ✅ Verify tables exist: Check **Table Editor** in Supabase dashboard
2. ✅ Test queries: Use **SQL Editor** to run test queries
3. ✅ Update application code: Modify API routes to use Supabase client
4. ✅ Test API endpoints: Use Postman or curl to verify CRUD operations
5. ✅ Deploy: Add environment variables to your hosting provider (Vercel, etc.)

For questions or issues, refer to the main project README or open an issue on GitHub.
