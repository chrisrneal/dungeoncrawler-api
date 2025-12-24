-- Seed Data Migration Script
-- Version: 1.0.0
--
-- This script helps migrate existing dungeon data from the JSON file format
-- to the Supabase database schema.
-- 
-- INSTRUCTIONS:
-- 1. This is a template - you'll need to generate INSERT statements from your
--    existing dungeon-data.json file
-- 2. You can use the migration helper script (see below) or manually create inserts
-- 3. Run this after running 001_initial_schema.sql
--
-- For automated migration, see the Node.js script: scripts/migrate-to-supabase.ts

-- Example seed data for testing purposes
-- You can replace this with your actual dungeon data

-- Insert example dungeon
INSERT INTO dungeons (id, name, difficulty, level, size_width, size_height, description)
VALUES 
    ('00000000-0000-0000-0000-000000000001'::uuid, 'Example Test Dungeon', 'Easy', 1, 5, 5, 'A test dungeon for development');

-- Insert example rooms
INSERT INTO rooms (id, dungeon_id, type, coord_x, coord_y, coord_z, description, visited, cleared)
VALUES 
    ('10000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'entrance', 0, 0, 0, 'The entrance to the test dungeon', false, true),
    ('10000000-0000-0000-0000-000000000002'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'combat', 0, 1, 0, 'A combat room', false, false),
    ('10000000-0000-0000-0000-000000000003'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'boss', 0, 2, 0, 'The boss room', false, false);

-- Insert example room connections
INSERT INTO room_connections (source_room_id, target_room_id, direction, locked, hidden)
VALUES 
    ('10000000-0000-0000-0000-000000000001'::uuid, '10000000-0000-0000-0000-000000000002'::uuid, 'north', false, false),
    ('10000000-0000-0000-0000-000000000002'::uuid, '10000000-0000-0000-0000-000000000001'::uuid, 'south', false, false),
    ('10000000-0000-0000-0000-000000000002'::uuid, '10000000-0000-0000-0000-000000000003'::uuid, 'north', false, false),
    ('10000000-0000-0000-0000-000000000003'::uuid, '10000000-0000-0000-0000-000000000002'::uuid, 'south', false, false);

-- Insert example monster
INSERT INTO monsters (room_id, name, type, level, health, attack, defense, speed, description, loot)
VALUES 
    ('10000000-0000-0000-0000-000000000002'::uuid, 'Test Goblin', 'humanoid', 1, 25, 8, 3, 12, 'A weak goblin for testing', '["rusty sword", "5 gold"]'::jsonb);

-- Note: For production use, you should generate proper INSERT statements from your
-- existing dungeon-data.json file. See scripts/migrate-to-supabase.ts for an
-- automated migration tool.
