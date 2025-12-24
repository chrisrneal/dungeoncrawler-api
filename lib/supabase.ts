/**
 * Supabase Database Client and Utilities
 * 
 * This module provides database access functions for the Dungeon Crawler API.
 * It handles all Supabase interactions and data transformations.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  Dungeon, 
  Room, 
  Monster, 
  Puzzle, 
  StoryEvent, 
  Lore, 
  Secret, 
  RoomConnection,
  DungeonFloor 
} from './api';

// Database row types (snake_case from database)
interface DungeonRow {
  id: string;
  name: string;
  difficulty: string;
  level: number;
  size_width: number;
  size_height: number;
  size_depth: number | null;
  description: string;
  created_at: string;
  updated_at: string;
}

interface RoomRow {
  id: string;
  dungeon_id: string;
  floor_id: string | null;
  type: string;
  coord_x: number;
  coord_y: number;
  coord_z: number;
  description: string;
  visited: boolean;
  cleared: boolean;
  created_at: string;
  updated_at: string;
}

interface MonsterRow {
  id: string;
  room_id: string;
  name: string;
  type: string;
  level: number;
  health: number;
  attack: number;
  defense: number;
  speed: number;
  description: string | null;
  loot: string[] | null;
  created_at: string;
  updated_at: string;
}

interface PuzzleRow {
  id: string;
  room_id: string;
  type: string;
  difficulty: string;
  description: string;
  solution: string | null;
  reward: string | null;
  created_at: string;
  updated_at: string;
}

interface StoryEventRow {
  id: string;
  room_id: string;
  title: string;
  description: string;
  choices: string[] | null;
  consequences: string[] | null;
  created_at: string;
  updated_at: string;
}

interface LoreEntryRow {
  id: string;
  room_id: string;
  title: string;
  content: string;
  discovered: boolean;
  created_at: string;
  updated_at: string;
}

interface SecretRow {
  id: string;
  room_id: string;
  type: string;
  description: string;
  discovery_method: string | null;
  reward: string | null;
  created_at: string;
  updated_at: string;
}

interface RoomConnectionRow {
  id: string;
  source_room_id: string;
  target_room_id: string;
  direction: string;
  locked: boolean;
  hidden: boolean;
  created_at: string;
}

interface FloorRow {
  id: string;
  dungeon_id: string;
  floor_number: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Creates and returns a Supabase client
 * Uses service role key for server-side operations
 */
export function getSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

/**
 * Database access layer
 */
export class SupabaseDatabase {
  private client: SupabaseClient;

  constructor() {
    this.client = getSupabaseClient();
  }

  /**
   * Get all dungeons
   */
  async getAllDungeons(): Promise<Dungeon[]> {
    const { data, error } = await this.client
      .from('dungeons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching dungeons:', error);
      throw new Error(`Failed to fetch dungeons: ${error.message}`);
    }

    // Load full dungeon data for each dungeon
    const dungeons = await Promise.all(
      (data as DungeonRow[]).map(row => this.getDungeonById(row.id))
    );

    return dungeons.filter((d): d is Dungeon => d !== null);
  }

  /**
   * Get a single dungeon by ID with all related data
   */
  async getDungeonById(dungeonId: string): Promise<Dungeon | null> {
    // Fetch dungeon
    const { data: dungeonData, error: dungeonError } = await this.client
      .from('dungeons')
      .select('*')
      .eq('id', dungeonId)
      .single();

    if (dungeonError || !dungeonData) {
      return null;
    }

    const dungeonRow = dungeonData as DungeonRow;

    // Check if this dungeon uses multi-floor structure
    const { data: floorsData } = await this.client
      .from('dungeon_floors')
      .select('*')
      .eq('dungeon_id', dungeonId)
      .order('floor_number', { ascending: true });

    let floors: DungeonFloor[] | undefined;
    let rooms: Room[];

    if (floorsData && floorsData.length > 0) {
      // Multi-floor dungeon
      floors = await Promise.all(
        (floorsData as FloorRow[]).map(async (floorRow) => {
          const floorRooms = await this.getRoomsByFloorId(floorRow.id);
          return {
            floorNumber: floorRow.floor_number,
            name: floorRow.name,
            description: floorRow.description || '',
            rooms: floorRooms
          };
        })
      );
      // For backward compatibility, also populate the rooms array with all rooms
      rooms = floors.flatMap(f => f.rooms);
    } else {
      // Legacy single-floor dungeon
      rooms = await this.getRoomsByDungeonId(dungeonId);
      floors = undefined;
    }

    return {
      id: dungeonRow.id,
      name: dungeonRow.name,
      difficulty: dungeonRow.difficulty as any,
      level: dungeonRow.level,
      size: {
        width: dungeonRow.size_width,
        height: dungeonRow.size_height,
        depth: dungeonRow.size_depth || undefined
      },
      description: dungeonRow.description,
      rooms,
      floors,
      createdAt: dungeonRow.created_at,
      updatedAt: dungeonRow.updated_at
    };
  }

  /**
   * Get all rooms for a dungeon
   */
  private async getRoomsByDungeonId(dungeonId: string): Promise<Room[]> {
    const { data: roomsData, error } = await this.client
      .from('rooms')
      .select('*')
      .eq('dungeon_id', dungeonId)
      .order('coord_y', { ascending: true })
      .order('coord_x', { ascending: true });

    if (error || !roomsData) {
      return [];
    }

    return Promise.all(
      (roomsData as RoomRow[]).map(row => this.buildRoomFromRow(row))
    );
  }

  /**
   * Get all rooms for a specific floor
   */
  private async getRoomsByFloorId(floorId: string): Promise<Room[]> {
    const { data: roomsData, error } = await this.client
      .from('rooms')
      .select('*')
      .eq('floor_id', floorId)
      .order('coord_y', { ascending: true })
      .order('coord_x', { ascending: true });

    if (error || !roomsData) {
      return [];
    }

    return Promise.all(
      (roomsData as RoomRow[]).map(row => this.buildRoomFromRow(row))
    );
  }

  /**
   * Build a complete Room object from a room row with all related data
   */
  private async buildRoomFromRow(roomRow: RoomRow): Promise<Room> {
    const [monsters, puzzle, story, lore, secrets, connections] = await Promise.all([
      this.getMonstersByRoomId(roomRow.id),
      this.getPuzzleByRoomId(roomRow.id),
      this.getStoryEventByRoomId(roomRow.id),
      this.getLoreEntriesByRoomId(roomRow.id),
      this.getSecretsByRoomId(roomRow.id),
      this.getConnectionsByRoomId(roomRow.id)
    ]);

    return {
      id: roomRow.id,
      type: roomRow.type as any,
      coordinates: {
        x: roomRow.coord_x,
        y: roomRow.coord_y,
        z: roomRow.coord_z || undefined
      },
      description: roomRow.description,
      connections,
      monsters: monsters.length > 0 ? monsters : undefined,
      puzzle: puzzle || undefined,
      story: story || undefined,
      lore: lore.length > 0 ? lore : undefined,
      secrets: secrets.length > 0 ? secrets : undefined,
      visited: roomRow.visited,
      cleared: roomRow.cleared
    };
  }

  /**
   * Get monsters for a room
   */
  private async getMonstersByRoomId(roomId: string): Promise<Monster[]> {
    const { data, error } = await this.client
      .from('monsters')
      .select('*')
      .eq('room_id', roomId);

    if (error || !data) return [];

    return (data as MonsterRow[]).map(row => ({
      id: row.id,
      name: row.name,
      type: row.type,
      stats: {
        health: row.health,
        attack: row.attack,
        defense: row.defense,
        speed: row.speed
      },
      level: row.level,
      description: row.description || undefined,
      loot: row.loot || undefined
    }));
  }

  /**
   * Get puzzle for a room (max one per room)
   */
  private async getPuzzleByRoomId(roomId: string): Promise<Puzzle | null> {
    const { data, error } = await this.client
      .from('puzzles')
      .select('*')
      .eq('room_id', roomId)
      .single();

    if (error || !data) return null;

    const row = data as PuzzleRow;
    return {
      id: row.id,
      type: row.type,
      difficulty: row.difficulty as any,
      description: row.description,
      solution: row.solution || undefined,
      reward: row.reward || undefined
    };
  }

  /**
   * Get story event for a room (max one per room)
   */
  private async getStoryEventByRoomId(roomId: string): Promise<StoryEvent | null> {
    const { data, error } = await this.client
      .from('story_events')
      .select('*')
      .eq('room_id', roomId)
      .single();

    if (error || !data) return null;

    const row = data as StoryEventRow;
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      choices: row.choices || undefined,
      consequences: row.consequences || undefined
    };
  }

  /**
   * Get lore entries for a room
   */
  private async getLoreEntriesByRoomId(roomId: string): Promise<Lore[]> {
    const { data, error } = await this.client
      .from('lore_entries')
      .select('*')
      .eq('room_id', roomId);

    if (error || !data) return [];

    return (data as LoreEntryRow[]).map(row => ({
      id: row.id,
      title: row.title,
      content: row.content,
      discovered: row.discovered
    }));
  }

  /**
   * Get secrets for a room
   */
  private async getSecretsByRoomId(roomId: string): Promise<Secret[]> {
    const { data, error } = await this.client
      .from('secrets')
      .select('*')
      .eq('room_id', roomId);

    if (error || !data) return [];

    return (data as SecretRow[]).map(row => ({
      id: row.id,
      type: row.type as any,
      description: row.description,
      discoveryMethod: row.discovery_method || undefined,
      reward: row.reward || undefined
    }));
  }

  /**
   * Get connections for a room
   */
  private async getConnectionsByRoomId(roomId: string): Promise<RoomConnection[]> {
    const { data, error } = await this.client
      .from('room_connections')
      .select('*')
      .eq('source_room_id', roomId);

    if (error || !data) return [];

    return (data as RoomConnectionRow[]).map(row => ({
      direction: row.direction as any,
      targetRoomId: row.target_room_id,
      locked: row.locked,
      hidden: row.hidden
    }));
  }

  /**
   * Create a new dungeon
   */
  async createDungeon(dungeon: Dungeon): Promise<Dungeon> {
    // Start a transaction by inserting dungeon first
    const { data: dungeonData, error: dungeonError } = await this.client
      .from('dungeons')
      .insert({
        id: dungeon.id,
        name: dungeon.name,
        difficulty: dungeon.difficulty,
        level: dungeon.level,
        size_width: dungeon.size.width,
        size_height: dungeon.size.height,
        size_depth: dungeon.size.depth || null,
        description: dungeon.description
      })
      .select()
      .single();

    if (dungeonError) {
      throw new Error(`Failed to create dungeon: ${dungeonError.message}`);
    }

    // Insert floors if present
    if (dungeon.floors && dungeon.floors.length > 0) {
      const floorInserts = dungeon.floors.map(floor => ({
        dungeon_id: dungeon.id,
        floor_number: floor.floorNumber,
        name: floor.name,
        description: floor.description || null
      }));

      const { data: floorsData, error: floorsError } = await this.client
        .from('dungeon_floors')
        .insert(floorInserts)
        .select();

      if (floorsError) {
        // Rollback by deleting the dungeon
        await this.client.from('dungeons').delete().eq('id', dungeon.id);
        throw new Error(`Failed to create floors: ${floorsError.message}`);
      }

      // Map floor numbers to their IDs
      const floorIdMap = new Map(
        (floorsData as FloorRow[]).map(f => [f.floor_number, f.id])
      );

      // Insert rooms for each floor
      for (const floor of dungeon.floors) {
        const floorId = floorIdMap.get(floor.floorNumber);
        if (floorId) {
          await this.insertRoomsForDungeon(dungeon.id, floor.rooms, floorId);
        }
      }
    } else {
      // Legacy single-floor format
      await this.insertRoomsForDungeon(dungeon.id, dungeon.rooms);
    }

    // Return the created dungeon with all data
    const createdDungeon = await this.getDungeonById(dungeon.id);
    if (!createdDungeon) {
      throw new Error('Failed to retrieve created dungeon');
    }

    return createdDungeon;
  }

  /**
   * Insert rooms and related data for a dungeon
   */
  private async insertRoomsForDungeon(
    dungeonId: string, 
    rooms: Room[], 
    floorId?: string
  ): Promise<void> {
    if (rooms.length === 0) return;

    // Insert rooms
    const roomInserts = rooms.map(room => ({
      id: room.id,
      dungeon_id: dungeonId,
      floor_id: floorId || null,
      type: room.type,
      coord_x: room.coordinates.x,
      coord_y: room.coordinates.y,
      coord_z: room.coordinates.z || 0,
      description: room.description,
      visited: room.visited || false,
      cleared: room.cleared || false
    }));

    const { error: roomsError } = await this.client
      .from('rooms')
      .insert(roomInserts);

    if (roomsError) {
      throw new Error(`Failed to insert rooms: ${roomsError.message}`);
    }

    // Insert related data for each room
    for (const room of rooms) {
      await Promise.all([
        this.insertMonstersForRoom(room.id, room.monsters || []),
        this.insertPuzzleForRoom(room.id, room.puzzle),
        this.insertStoryEventForRoom(room.id, room.story),
        this.insertLoreEntriesForRoom(room.id, room.lore || []),
        this.insertSecretsForRoom(room.id, room.secrets || []),
        this.insertConnectionsForRoom(room.id, room.connections)
      ]);
    }
  }

  /**
   * Insert monsters for a room
   */
  private async insertMonstersForRoom(roomId: string, monsters: Monster[]): Promise<void> {
    if (monsters.length === 0) return;

    const inserts = monsters.map(monster => ({
      id: monster.id,
      room_id: roomId,
      name: monster.name,
      type: monster.type,
      level: monster.level,
      health: monster.stats.health,
      attack: monster.stats.attack,
      defense: monster.stats.defense,
      speed: monster.stats.speed,
      description: monster.description || null,
      loot: monster.loot || null
    }));

    await this.client.from('monsters').insert(inserts);
  }

  /**
   * Insert puzzle for a room
   */
  private async insertPuzzleForRoom(roomId: string, puzzle?: Puzzle): Promise<void> {
    if (!puzzle) return;

    await this.client.from('puzzles').insert({
      id: puzzle.id,
      room_id: roomId,
      type: puzzle.type,
      difficulty: puzzle.difficulty,
      description: puzzle.description,
      solution: puzzle.solution || null,
      reward: puzzle.reward || null
    });
  }

  /**
   * Insert story event for a room
   */
  private async insertStoryEventForRoom(roomId: string, story?: StoryEvent): Promise<void> {
    if (!story) return;

    await this.client.from('story_events').insert({
      id: story.id,
      room_id: roomId,
      title: story.title,
      description: story.description,
      choices: story.choices || null,
      consequences: story.consequences || null
    });
  }

  /**
   * Insert lore entries for a room
   */
  private async insertLoreEntriesForRoom(roomId: string, loreEntries: Lore[]): Promise<void> {
    if (loreEntries.length === 0) return;

    const inserts = loreEntries.map(lore => ({
      id: lore.id,
      room_id: roomId,
      title: lore.title,
      content: lore.content,
      discovered: lore.discovered || false
    }));

    await this.client.from('lore_entries').insert(inserts);
  }

  /**
   * Insert secrets for a room
   */
  private async insertSecretsForRoom(roomId: string, secrets: Secret[]): Promise<void> {
    if (secrets.length === 0) return;

    const inserts = secrets.map(secret => ({
      id: secret.id,
      room_id: roomId,
      type: secret.type,
      description: secret.description,
      discovery_method: secret.discoveryMethod || null,
      reward: secret.reward || null
    }));

    await this.client.from('secrets').insert(inserts);
  }

  /**
   * Insert connections for a room
   */
  private async insertConnectionsForRoom(roomId: string, connections: RoomConnection[]): Promise<void> {
    if (connections.length === 0) return;

    const inserts = connections.map(conn => ({
      source_room_id: roomId,
      target_room_id: conn.targetRoomId,
      direction: conn.direction,
      locked: conn.locked || false,
      hidden: conn.hidden || false
    }));

    await this.client.from('room_connections').insert(inserts);
  }

  /**
   * Update an existing dungeon
   */
  async updateDungeon(dungeonId: string, dungeon: Dungeon): Promise<Dungeon> {
    // Delete existing dungeon (cascade will delete all related data)
    await this.deleteDungeon(dungeonId);

    // Re-create with new data
    return await this.createDungeon(dungeon);
  }

  /**
   * Delete a dungeon
   */
  async deleteDungeon(dungeonId: string): Promise<void> {
    const { error } = await this.client
      .from('dungeons')
      .delete()
      .eq('id', dungeonId);

    if (error) {
      throw new Error(`Failed to delete dungeon: ${error.message}`);
    }
  }
}
