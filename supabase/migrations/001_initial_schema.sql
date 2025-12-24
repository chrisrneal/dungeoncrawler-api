-- Dungeon Crawler API Database Schema
-- Version: 1.0.0
-- 
-- This migration creates the initial database schema for the Dungeon Crawler API.
-- It supports both single-floor (legacy) and multi-floor dungeon structures.

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Dungeons table
-- Stores top-level dungeon configuration and metadata
CREATE TABLE dungeons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard', 'Expert')),
    level INTEGER NOT NULL CHECK (level >= 1),
    size_width INTEGER NOT NULL CHECK (size_width >= 1),
    size_height INTEGER NOT NULL CHECK (size_height >= 1),
    size_depth INTEGER CHECK (size_depth IS NULL OR size_depth >= 1),
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Dungeon floors table
-- Supports multi-floor dungeon structures (optional, for new dungeons)
CREATE TABLE dungeon_floors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dungeon_id UUID NOT NULL REFERENCES dungeons(id) ON DELETE CASCADE,
    floor_number INTEGER NOT NULL CHECK (floor_number >= 1),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(dungeon_id, floor_number)
);

-- Rooms table
-- Stores individual rooms within a dungeon
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dungeon_id UUID NOT NULL REFERENCES dungeons(id) ON DELETE CASCADE,
    floor_id UUID REFERENCES dungeon_floors(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('entrance', 'boss', 'treasure', 'puzzle', 'combat', 'rest', 'trap', 'empty')),
    coord_x INTEGER NOT NULL,
    coord_y INTEGER NOT NULL,
    coord_z INTEGER DEFAULT 0,
    description TEXT NOT NULL,
    visited BOOLEAN DEFAULT FALSE,
    cleared BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(dungeon_id, coord_x, coord_y, coord_z)
);

-- Room connections table
-- Stores directional connections between rooms
CREATE TABLE room_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    target_room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    direction TEXT NOT NULL CHECK (direction IN ('north', 'south', 'east', 'west')),
    locked BOOLEAN DEFAULT FALSE,
    hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(source_room_id, direction)
);

-- Monsters table
-- Stores monster definitions within rooms
CREATE TABLE monsters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    level INTEGER NOT NULL CHECK (level >= 1),
    health INTEGER NOT NULL CHECK (health > 0),
    attack INTEGER NOT NULL CHECK (attack >= 0),
    defense INTEGER NOT NULL CHECK (defense >= 0),
    speed INTEGER NOT NULL CHECK (speed >= 0),
    description TEXT,
    loot JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Puzzles table
-- Stores puzzle definitions within rooms
CREATE TABLE puzzles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard', 'Expert')),
    description TEXT NOT NULL,
    solution TEXT,
    reward TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(room_id)
);

-- Story events table
-- Stores narrative story events within rooms
CREATE TABLE story_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    choices JSONB DEFAULT '[]'::jsonb,
    consequences JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(room_id)
);

-- Lore entries table
-- Stores lore fragments and background information
CREATE TABLE lore_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    discovered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Secrets table
-- Stores hidden content and secrets within rooms
CREATE TABLE secrets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('hidden_room', 'treasure', 'passage', 'lore')),
    description TEXT NOT NULL,
    discovery_method TEXT,
    reward TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Dungeons indexes
CREATE INDEX idx_dungeons_difficulty ON dungeons(difficulty);
CREATE INDEX idx_dungeons_level ON dungeons(level);
CREATE INDEX idx_dungeons_created_at ON dungeons(created_at DESC);

-- Floors indexes
CREATE INDEX idx_floors_dungeon_id ON dungeon_floors(dungeon_id);
CREATE INDEX idx_floors_floor_number ON dungeon_floors(floor_number);

-- Rooms indexes
CREATE INDEX idx_rooms_dungeon_id ON rooms(dungeon_id);
CREATE INDEX idx_rooms_floor_id ON rooms(floor_id);
CREATE INDEX idx_rooms_type ON rooms(type);
CREATE INDEX idx_rooms_coordinates ON rooms(coord_x, coord_y, coord_z);

-- Room connections indexes
CREATE INDEX idx_connections_source_room ON room_connections(source_room_id);
CREATE INDEX idx_connections_target_room ON room_connections(target_room_id);

-- Monsters indexes
CREATE INDEX idx_monsters_room_id ON monsters(room_id);
CREATE INDEX idx_monsters_level ON monsters(level);

-- Puzzles indexes
CREATE INDEX idx_puzzles_room_id ON puzzles(room_id);

-- Story events indexes
CREATE INDEX idx_story_events_room_id ON story_events(room_id);

-- Lore entries indexes
CREATE INDEX idx_lore_room_id ON lore_entries(room_id);

-- Secrets indexes
CREATE INDEX idx_secrets_room_id ON secrets(room_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Triggers to automatically update updated_at column
CREATE TRIGGER update_dungeons_updated_at
    BEFORE UPDATE ON dungeons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dungeon_floors_updated_at
    BEFORE UPDATE ON dungeon_floors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at
    BEFORE UPDATE ON rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monsters_updated_at
    BEFORE UPDATE ON monsters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_puzzles_updated_at
    BEFORE UPDATE ON puzzles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_story_events_updated_at
    BEFORE UPDATE ON story_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lore_entries_updated_at
    BEFORE UPDATE ON lore_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_secrets_updated_at
    BEFORE UPDATE ON secrets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE dungeons ENABLE ROW LEVEL SECURITY;
ALTER TABLE dungeon_floors ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE monsters ENABLE ROW LEVEL SECURITY;
ALTER TABLE puzzles ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE lore_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE secrets ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (customize based on your security requirements)
-- These policies allow anyone to read data but require authentication for write operations

-- Dungeons policies
CREATE POLICY "Allow public read access to dungeons"
    ON dungeons FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated users to insert dungeons"
    ON dungeons FOR INSERT
    WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow authenticated users to update dungeons"
    ON dungeons FOR UPDATE
    USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow authenticated users to delete dungeons"
    ON dungeons FOR DELETE
    USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Floors policies
CREATE POLICY "Allow public read access to floors"
    ON dungeon_floors FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated users to manage floors"
    ON dungeon_floors FOR ALL
    USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Rooms policies
CREATE POLICY "Allow public read access to rooms"
    ON rooms FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated users to manage rooms"
    ON rooms FOR ALL
    USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Room connections policies
CREATE POLICY "Allow public read access to room connections"
    ON room_connections FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated users to manage room connections"
    ON room_connections FOR ALL
    USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Monsters policies
CREATE POLICY "Allow public read access to monsters"
    ON monsters FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated users to manage monsters"
    ON monsters FOR ALL
    USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Puzzles policies
CREATE POLICY "Allow public read access to puzzles"
    ON puzzles FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated users to manage puzzles"
    ON puzzles FOR ALL
    USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Story events policies
CREATE POLICY "Allow public read access to story events"
    ON story_events FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated users to manage story events"
    ON story_events FOR ALL
    USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Lore entries policies
CREATE POLICY "Allow public read access to lore entries"
    ON lore_entries FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated users to manage lore entries"
    ON lore_entries FOR ALL
    USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Secrets policies
CREATE POLICY "Allow public read access to secrets"
    ON secrets FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated users to manage secrets"
    ON secrets FOR ALL
    USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE dungeons IS 'Top-level dungeon definitions with metadata';
COMMENT ON TABLE dungeon_floors IS 'Multi-floor support for dungeons (optional)';
COMMENT ON TABLE rooms IS 'Individual rooms within dungeons';
COMMENT ON TABLE room_connections IS 'Directional connections between rooms';
COMMENT ON TABLE monsters IS 'Monster definitions within rooms';
COMMENT ON TABLE puzzles IS 'Puzzle configurations within rooms';
COMMENT ON TABLE story_events IS 'Story events and narrative moments';
COMMENT ON TABLE lore_entries IS 'Lore fragments and background information';
COMMENT ON TABLE secrets IS 'Hidden content and secrets within rooms';
