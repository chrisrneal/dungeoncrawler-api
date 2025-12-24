# Supabase Integration Summary

This document provides a quick summary of the Supabase integration for the Dungeon Crawler API.

## What Was Implemented

### 1. Database Schema (`supabase/migrations/`)

Created complete SQL migration scripts that define:
- **9 database tables** with proper relationships and constraints
- **Indexes** for optimized query performance
- **Row Level Security (RLS)** policies for access control
- **Triggers** for automatic timestamp management
- **Sample seed data** for testing

### 2. Environment Configuration

- **`.env.example`** - Template with all required Supabase variables
- **Updated `.gitignore`** - Ensures environment files are never committed
- **`STORAGE_MODE`** variable - Toggle between `file` and `supabase` storage

### 3. Database Client Library (`lib/supabase.ts`)

Complete database access layer with:
- Supabase client initialization
- Full CRUD operations (Create, Read, Update, Delete)
- Support for multi-floor dungeons
- Automatic data transformation between database and API formats
- Optimized queries with proper joins

### 4. API Route Updates (`app/api/dungeon/route.ts`)

- **Storage Adapter Pattern** - Abstraction layer for storage backends
- **File Storage Adapter** - Maintains backward compatibility with JSON files
- **Supabase Storage Adapter** - New database-backed storage
- **Graceful Fallback** - Falls back to file storage if Supabase not configured
- **Environment-based Selection** - Uses `STORAGE_MODE` to choose storage

### 5. Documentation

- **`SETUP_GUIDE.md`** - Quick start guide (5-minute setup)
- **`supabase/README.md`** - Comprehensive documentation
- **`scripts/verify-supabase-setup.js`** - Configuration verification tool

## How to Use

### Option 1: Quick Start with Supabase

1. **Create Supabase Project** at https://supabase.com
2. **Run SQL Migrations** in Supabase SQL Editor:
   - Copy and run `supabase/migrations/001_initial_schema.sql`
3. **Configure Environment**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```
4. **Start Application**:
   ```bash
   npm install
   npm run dev
   ```

### Option 2: Continue Using File Storage

No changes needed! The application defaults to file storage if Supabase is not configured.

To explicitly use file storage:
```env
STORAGE_MODE=file
```

### Option 3: Gradual Migration

1. Keep using file storage initially
2. Set up Supabase database
3. Test with `STORAGE_MODE=supabase`
4. Migrate data when ready
5. Switch permanently to Supabase

## Key Features

### Storage Mode Toggle

The API automatically detects and uses the appropriate storage backend:

```env
STORAGE_MODE=supabase  # Use Supabase database
STORAGE_MODE=file      # Use JSON file storage (default if Supabase not configured)
```

### Graceful Degradation

If Supabase environment variables are not set:
- Application automatically falls back to file storage
- Logs a warning message
- Continues to function normally

### Data Compatibility

Both storage modes:
- Use the same API interface
- Support the same data structures
- Validate data the same way
- Return identical response formats

## Environment Variables

Required for Supabase mode:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
STORAGE_MODE=supabase
```

## Security

### Row Level Security (RLS)

All tables have RLS enabled with default policies:
- **Public read access** - Anyone can view dungeons
- **Authenticated write access** - Only authenticated users can modify
- **Service role bypass** - Admin operations use service role key

### API Key Security

- **Anon Key** (`NEXT_PUBLIC_*`) - Safe for client-side use
- **Service Role Key** - Server-side only, never expose to client

## Database Schema Overview

### Core Tables
- `dungeons` - Dungeon metadata
- `dungeon_floors` - Multi-floor support
- `rooms` - Individual rooms
- `room_connections` - Room connections

### Content Tables
- `monsters` - Enemy definitions
- `puzzles` - Puzzle configurations
- `story_events` - Narrative events
- `lore_entries` - Background lore
- `secrets` - Hidden content

All tables use:
- UUID primary keys
- Automatic timestamps (`created_at`, `updated_at`)
- Cascade deletion (deleting a dungeon removes all related data)
- Check constraints for data validation

## Verification

Test your setup:

```bash
npm run verify-supabase
```

This checks:
- `.env.local` file exists
- All required variables are set
- Supabase client library is installed
- Migration files are present

## Deployment

### Vercel

1. Push code to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel project settings
4. Deploy

### Other Platforms

Add the same environment variables to your platform's configuration.

## Migration Path

### From File Storage to Supabase

1. **Backup** your `dungeon-data.json`
2. **Set up** Supabase and run migrations
3. **Test** with `STORAGE_MODE=supabase`
4. **Migrate** data (manually or create a migration script)
5. **Verify** data integrity
6. **Deploy** with Supabase configuration

### Data Migration Script (Future Enhancement)

A data migration utility could be created to:
- Read from `dungeon-data.json`
- Transform to database format
- Insert into Supabase
- Verify completeness

## Troubleshooting

### Build fails with Supabase error
- **Cause**: Missing environment variables during build
- **Solution**: The app now gracefully falls back to file storage

### Can't connect to Supabase
- Check your `NEXT_PUBLIC_SUPABASE_URL` is correct
- Verify project isn't paused (free tier projects pause after inactivity)
- Check internet connection

### Data not persisting
- Check `STORAGE_MODE` is set correctly
- Verify Supabase credentials are correct
- Check Supabase dashboard for data

### Permission denied errors
- Check RLS policies in Supabase
- Verify you're using the correct API key
- Use service role key for admin operations

## Files Modified/Created

### New Files
- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/002_seed_data.sql`
- `supabase/README.md`
- `SETUP_GUIDE.md`
- `SUPABASE_INTEGRATION.md` (this file)
- `lib/supabase.ts`
- `scripts/verify-supabase-setup.js`
- `.env.example`

### Modified Files
- `app/api/dungeon/route.ts` - Added storage adapter pattern
- `.gitignore` - Added environment file patterns
- `package.json` - Added @supabase/supabase-js and verify script

## Next Steps

1. **Test the API** with both storage modes
2. **Create migration script** for existing data (if needed)
3. **Add authentication** for user-specific dungeons (optional)
4. **Optimize queries** based on usage patterns
5. **Add caching layer** for improved performance (optional)

## Resources

- **Supabase Docs**: https://supabase.com/docs
- **Setup Guide**: See `SETUP_GUIDE.md`
- **Detailed Docs**: See `supabase/README.md`
- **API Schema**: See `API_SCHEMA.md`

## Support

For issues or questions:
1. Check `supabase/README.md` troubleshooting section
2. Review Supabase documentation
3. Run `npm run verify-supabase` for diagnostics
4. Open a GitHub issue

---

**Summary**: The Dungeon Crawler API now supports both file-based storage (legacy) and Supabase database storage. The implementation is backward compatible, with graceful fallback, and can be toggled via environment variables. All necessary SQL scripts, documentation, and utilities are provided for easy setup.
