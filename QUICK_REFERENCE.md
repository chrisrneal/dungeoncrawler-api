# Supabase Setup - Quick Reference Card

## 🚀 5-Minute Setup

### Step 1: Create Supabase Project
```
1. Go to https://supabase.com
2. Sign up/login
3. Create new project
4. Wait for provisioning (~2 min)
```

### Step 2: Get Credentials
```
Dashboard → Settings → API
Copy:
- Project URL
- anon/public key
- service_role key
```

### Step 3: Run SQL Migration
```
Dashboard → SQL Editor → New Query
Paste: supabase/migrations/001_initial_schema.sql
Click: Run
```

### Step 4: Configure App
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
npm install
npm run dev
```

## 📁 Files You Need

### SQL Scripts (Run in Supabase SQL Editor)
- `supabase/migrations/001_initial_schema.sql` ← **Run this first!**
- `supabase/migrations/002_seed_data.sql` ← Optional test data

### Environment File
- `.env.example` ← Template (copy to `.env.local`)
- `.env.local` ← Your actual credentials (**DO NOT COMMIT!**)

### Documentation
- `SETUP_GUIDE.md` ← Detailed setup instructions
- `supabase/README.md` ← Complete Supabase documentation
- `SUPABASE_INTEGRATION.md` ← Integration summary

## 🔑 Environment Variables

```env
# Required for Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Storage mode
STORAGE_MODE=supabase  # or 'file' for legacy mode
```

## 🛠 Commands

```bash
# Verify Supabase setup
npm run verify-supabase

# Start development server
npm run dev

# Build for production
npm run build
```

## 📊 Database Tables Created

```
dungeons            ← Dungeon metadata
dungeon_floors      ← Multi-floor support
rooms               ← Individual rooms
room_connections    ← Room connections
monsters            ← Enemy definitions
puzzles             ← Puzzle configurations
story_events        ← Narrative events
lore_entries        ← Background lore
secrets             ← Hidden content
```

## 🔄 Storage Modes

### Use Supabase (Recommended for production)
```env
STORAGE_MODE=supabase
```

### Use File Storage (Default if Supabase not configured)
```env
STORAGE_MODE=file
```

### Automatic Fallback
If Supabase variables aren't set, app automatically uses file storage.

## ✅ Verification Checklist

- [ ] Supabase project created
- [ ] SQL migrations run successfully
- [ ] `.env.local` file created with credentials
- [ ] `npm install` completed
- [ ] `npm run verify-supabase` passes
- [ ] `npm run dev` starts successfully
- [ ] API endpoint returns data: `http://localhost:3000/api/dungeon`

## 🚨 Common Issues

### Build Error: "Missing Supabase environment variables"
**Solution**: App will fall back to file storage (this is normal)

### "Cannot connect to Supabase"
**Solution**: 
- Check URL in `.env.local`
- Verify project isn't paused
- Check internet connection

### "Permission denied"
**Solution**:
- Verify migrations ran successfully
- Check RLS policies in Supabase dashboard

### Tables not created
**Solution**: 
- Re-run `001_initial_schema.sql` in SQL Editor
- Check for error messages

## 📍 Where to Find Things

### In Supabase Dashboard
- **API Keys**: Settings → API
- **Database**: Table Editor
- **SQL Editor**: SQL Editor (sidebar)
- **Connection String**: Settings → Database

### In Your Project
- **SQL Scripts**: `supabase/migrations/`
- **Environment Template**: `.env.example`
- **Your Config**: `.env.local` (create this!)
- **Docs**: `SETUP_GUIDE.md`, `supabase/README.md`

## 🔒 Security Notes

### Safe to expose (client-side):
✅ `NEXT_PUBLIC_SUPABASE_URL`
✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Keep secret (server-side only):
❌ `SUPABASE_SERVICE_ROLE_KEY` ← Has admin access!
❌ `.env.local` file ← Never commit to Git!

## 🌐 Deployment (Vercel)

```
1. Push code to GitHub
2. Import to Vercel
3. Add environment variables in Vercel settings:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - STORAGE_MODE=supabase
4. Deploy!
```

## 📚 Help & Resources

- **Quick Start**: `SETUP_GUIDE.md`
- **Detailed Guide**: `supabase/README.md`
- **Integration Details**: `SUPABASE_INTEGRATION.md`
- **Supabase Docs**: https://supabase.com/docs
- **API Reference**: `API_SCHEMA.md`

## 🎯 Testing Your Setup

### 1. Check Environment
```bash
npm run verify-supabase
```

### 2. Start Server
```bash
npm run dev
```

### 3. Test API
```bash
# Get all dungeons
curl http://localhost:3000/api/dungeon

# Or open in browser:
# http://localhost:3000/api/dungeon
```

### 4. Check Supabase Dashboard
```
Go to: Table Editor
Should see: All 9 tables with data (if you ran seed script)
```

## 💡 Pro Tips

1. **Run seed data** for instant testing: `002_seed_data.sql`
2. **Use Table Editor** in Supabase to view/edit data visually
3. **Check logs** in terminal for storage mode confirmation
4. **Keep backup** of `dungeon-data.json` before switching modes
5. **Test locally first** before deploying to production

## 🆘 Emergency Fallback

If Supabase isn't working:
```env
STORAGE_MODE=file
```
App will work normally with JSON file storage.

---

**Need more help?** See `SETUP_GUIDE.md` or `supabase/README.md`

**Ready to start?** Follow the 5-Minute Setup at the top! ⬆️
