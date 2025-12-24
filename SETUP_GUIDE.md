# Supabase Database Setup - Quick Start Guide

This guide will help you set up Supabase for database persistence in your Dungeon Crawler API.

## 📋 Prerequisites

- A Supabase account (free tier works fine)
- Node.js installed (for running the app)
- Basic familiarity with environment variables

## 🚀 Quick Setup (5 minutes)

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click **"New Project"**
3. Fill in the details:
   - **Organization**: Create one or select existing
   - **Name**: `dungeoncrawler-api` (or your choice)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier is fine for development
4. Click **"Create new project"**
5. Wait 1-2 minutes for the project to be ready

### Step 2: Get Your API Credentials

1. In your Supabase project, click **Settings** (gear icon in sidebar)
2. Click **API** in the Settings menu
3. You'll see three important values - keep this page open:
   - **Project URL** (looks like: `https://abcxyz123.supabase.co`)
   - **anon public** key (under "Project API keys")
   - **service_role** key (under "Project API keys" - click "Reveal" to see it)

### Step 3: Run Database Migrations

1. In your Supabase project, click **SQL Editor** in the sidebar
2. Click **"New Query"**
3. Open the file `supabase/migrations/001_initial_schema.sql` from this repository
4. Copy the **entire contents** of the file
5. Paste into the SQL Editor in Supabase
6. Click **"Run"** (or press Ctrl+Enter)
7. You should see "Success. No rows returned" - this is good! ✅

**Optional**: Repeat steps 2-6 with `supabase/migrations/002_seed_data.sql` to add test data

### Step 4: Configure Environment Variables

1. In your project root, copy the example file:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` in your editor

3. Replace the placeholder values with your actual Supabase credentials from Step 2:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://abcxyz123.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
   STORAGE_MODE=supabase
   ```

4. Save the file

### Step 5: Install Dependencies

If you haven't already, install the Supabase client library:

```bash
npm install @supabase/supabase-js
```

### Step 6: Verify Setup (Optional)

Run the verification script to check your configuration:

```bash
node scripts/verify-supabase-setup.js
```

This will check that all environment variables are set correctly.

### Step 7: Start the Application

```bash
npm run dev
```

Your app should now be running with Supabase as the database backend! 🎉

## 🧪 Testing the Setup

### Test with the API

Once your server is running, test the API:

```bash
# Get all dungeons
curl http://localhost:3000/api/dungeon

# If you ran the seed data, you should see a test dungeon
```

### Test with Supabase Dashboard

1. In Supabase, go to **Table Editor**
2. You should see all the tables (dungeons, rooms, monsters, etc.)
3. Click on any table to see the data

## 📁 What Was Created?

### Files in Your Repository

```
dungeoncrawler-api/
├── .env.example                      # Template for environment variables
├── .env.local                        # Your actual config (DO NOT COMMIT!)
├── SETUP_GUIDE.md                    # This file
├── supabase/
│   ├── README.md                     # Detailed Supabase documentation
│   └── migrations/
│       ├── 001_initial_schema.sql    # Creates all database tables
│       └── 002_seed_data.sql         # Optional test data
└── scripts/
    └── verify-supabase-setup.js      # Configuration checker
```

### Tables Created in Supabase

- **dungeons** - Main dungeon data
- **dungeon_floors** - Multi-floor support
- **rooms** - Individual rooms
- **room_connections** - How rooms connect
- **monsters** - Enemy data
- **puzzles** - Puzzle configurations
- **story_events** - Narrative events
- **lore_entries** - Background lore
- **secrets** - Hidden content

## 🔒 Security Notes

### Environment Variables Safety

- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Safe to expose (public)
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Safe to expose (has limited permissions)
- ❌ `SUPABASE_SERVICE_ROLE_KEY` - **MUST KEEP SECRET** (has admin access)

### Never Do This:

- ❌ Don't commit `.env.local` to Git
- ❌ Don't share your service role key
- ❌ Don't use service role key in client-side code
- ❌ Don't hardcode credentials in your code

### Always Do This:

- ✅ Use `.env.local` for local development
- ✅ Use environment variables in production (Vercel, etc.)
- ✅ Keep service role key secret
- ✅ Use anon key for client-side operations

## 🔄 Switching Between Storage Modes

The app supports both Supabase and file-based storage:

### Use Supabase (Recommended)
```env
STORAGE_MODE=supabase
```

### Use File Storage (Legacy)
```env
STORAGE_MODE=file
```

This is useful for:
- Testing migrations before going live
- Comparing old and new data
- Rolling back if needed

## 🐛 Troubleshooting

### "Cannot connect to Supabase"
- Check your `NEXT_PUBLIC_SUPABASE_URL` is correct
- Verify your project isn't paused (free tier projects pause after inactivity)
- Check your internet connection

### "Permission denied" errors
- Make sure you ran the migrations (Step 3)
- Check that RLS policies are set up correctly
- Try using the service role key for testing (server-side only!)

### "Table does not exist"
- Run the migrations: `001_initial_schema.sql`
- Check in Table Editor that tables were created
- Make sure you ran the migration in the correct project

### Can't find API keys
- Go to Supabase Dashboard → Settings → API
- Keys are under "Project API keys"
- Click "Reveal" to see the service role key

### Verification script fails
```bash
# Make sure the script is executable
chmod +x scripts/verify-supabase-setup.js

# Run it
node scripts/verify-supabase-setup.js
```

## 📚 Next Steps

Now that Supabase is set up:

1. ✅ **Test the API**: Try creating, reading, updating, and deleting dungeons
2. ✅ **Explore the data**: Use Supabase Table Editor to view your data
3. ✅ **Customize security**: Modify RLS policies if needed (see `supabase/README.md`)
4. ✅ **Deploy**: Add environment variables to your hosting provider

## 🚀 Deploying to Production

### Vercel Deployment

1. Push your code to GitHub (make sure `.env.local` is in `.gitignore`!)
2. Connect your repo to Vercel
3. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `STORAGE_MODE=supabase`
4. Deploy!

### Other Platforms

Add the same environment variables to your platform's configuration:
- Netlify: Site settings → Environment variables
- Railway: Project → Variables
- Render: Environment → Environment Variables

## 📖 Additional Documentation

- **Detailed Supabase docs**: See `supabase/README.md`
- **Supabase official docs**: [https://supabase.com/docs](https://supabase.com/docs)
- **API Schema**: See `API_SCHEMA.md` for data structures
- **Project README**: See main `README.md`

## ❓ Need Help?

- Check `supabase/README.md` for detailed troubleshooting
- Review Supabase docs: [https://supabase.com/docs](https://supabase.com/docs)
- Check GitHub issues
- Ask in Supabase Discord: [https://discord.supabase.com](https://discord.supabase.com)

---

**That's it!** You should now have a fully functional Supabase backend for your Dungeon Crawler API. Happy coding! 🎮
