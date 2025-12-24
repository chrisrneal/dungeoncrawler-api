/**
 * Dungeon Crawler API TypeScript Interfaces
 * Version: 1.1.0 (December 2024)
 * 
 * This file contains all TypeScript interfaces and types for the Dungeon Crawler API schema.
 */

/**
 * Difficulty level for dungeons
 */
export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard' | 'Expert';

/**
 * Cardinal directions for room connections
 */
export type Direction = 'north' | 'south' | 'east' | 'west';

/**
 * Room types in a dungeon
 */
export type RoomType = 'entrance' | 'boss' | 'treasure' | 'puzzle' | 'combat' | 'rest' | 'trap' | 'empty';

/**
 * Monster stats
 */
export interface MonsterStats {
  health: number;
  attack: number;
  defense: number;
  speed: number;
}

/**
 * Monster definition
 */
export interface Monster {
  id: string;
  name: string;
  type: string;
  stats: MonsterStats;
  level: number;
  description?: string;
  loot?: string[];
}

/**
 * Puzzle definition
 */
export interface Puzzle {
  id: string;
  type: string;
  difficulty: DifficultyLevel;
  description: string;
  solution?: string;
  reward?: string;
}

/**
 * Story event
 */
export interface StoryEvent {
  id: string;
  title: string;
  description: string;
  choices?: string[];
  consequences?: string[];
}

/**
 * Lore entry (internal model)
 */
export interface Lore {
  id: string;
  title: string;
  content: string;
  discovered?: boolean;
}

/**
 * API Lore Entry
 * Represents a lore fragment or story element from the API
 */
export interface APILoreEntry {
  title: string;
  type: 'journal' | 'inscription' | 'fragment' | 'document';
  text: string;
  category: 'history' | 'warning' | 'magic' | 'personal' | 'mundane' | 'mythology' | 'exploration';
}

/**
 * Secret definition
 */
export interface Secret {
  id: string;
  type: 'hidden_room' | 'treasure' | 'passage' | 'lore';
  description: string;
  discoveryMethod?: string;
  reward?: string;
}

/**
 * Room coordinates
 */
export interface Coordinates {
  x: number;
  y: number;
  z?: number; // Optional z-coordinate for multi-level dungeons
}

/**
 * Room connection to another room
 */
export interface RoomConnection {
  direction: Direction;
  targetRoomId: string;
  locked?: boolean;
  hidden?: boolean;
}

/**
 * Room definition
 */
export interface Room {
  id: string;
  type: RoomType;
  coordinates: Coordinates;
  description: string;
  connections: RoomConnection[];
  monsters?: Monster[];
  puzzle?: Puzzle;
  story?: StoryEvent;
  lore?: Lore[];
  secrets?: Secret[];
  visited?: boolean;
  cleared?: boolean;
}

/**
 * Dungeon floor/level definition
 */
export interface DungeonFloor {
  floorNumber: number;
  name: string;
  description: string;
  rooms: Room[];
}

/**
 * Complete dungeon definition
 */
export interface Dungeon {
  id: string;
  name: string;
  difficulty: DifficultyLevel;
  level: number; // Recommended player level
  size: {
    width: number;
    height: number;
    depth?: number; // Number of floors/levels in the dungeon
  };
  description: string;
  rooms: Room[]; // Deprecated: kept for backward compatibility
  floors?: DungeonFloor[]; // Multi-floor support
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// API Response Types
// These types represent the data format returned by the API endpoints
// ============================================================================

/**
 * API Monster Data
 * Monster information as returned by the API
 */
export interface APIMonsterData {
  name: string;
  level: number;
  maxHealth: number;
  damage: number;
  defense: number;
  agility: number;
  specialAbility?: string;
  goldValue: number;
}

/**
 * API Puzzle
 * Puzzle configuration as returned by the API
 */
export interface APIPuzzle {
  type: string;
  description: string;
  question?: string;
  answer?: string;
  rewardGold?: number;
}

/**
 * API Story Event
 * Story event configuration as returned by the API
 */
export interface APIStoryEvent {
  title: string;
  description: string;
  choices?: Array<{
    text: string;
    outcome?: {
      description: string;
      effect?: string;
    };
  }>;
}

/**
 * API Room Secret
 * Secret configuration as returned by the API
 */
export interface APIRoomSecret {
  description: string;
  rewardGold?: number;
  revealCondition?: string;
}

/**
 * API Room Data
 * Complete room information as returned by the API
 */
export interface APIRoomData {
  id: number;
  type: string;
  description: string;
  x: number;
  y: number;
  connections: Direction[];
  secret?: APIRoomSecret | null;
  loreEntry?: APILoreEntry | null;
  puzzle?: APIPuzzle | null;
  storyEvent?: APIStoryEvent | null;
  monsters?: APIMonsterData[];
  isMiniBoss: boolean;
  isTrap: boolean;
  isRewardRoom: boolean;
}

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: ValidationError[];
}

/**
 * API Endpoint Configuration
 * Defines a custom API endpoint that serves dungeon data
 */
export interface ApiEndpointConfig {
  id: string;
  name: string;
  path: string;              // e.g., "/api/custom/my-dungeon"
  dungeonId: string;         // ID of the dungeon to serve
  description?: string;
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Dungeon validation rules
 */
export class DungeonValidator {
  /**
   * Validates a complete dungeon structure
   */
  static validateDungeon(dungeon: Dungeon): ValidationResult {
    const errors: ValidationError[] = [];

    // Determine if using multi-floor or legacy single-floor structure
    const allRooms: Room[] = [];
    
    if (dungeon.floors && dungeon.floors.length > 0) {
      // Multi-floor structure
      for (const floor of dungeon.floors) {
        allRooms.push(...floor.rooms);
      }
      
      // Validate that depth matches number of floors
      if (dungeon.size.depth && dungeon.size.depth !== dungeon.floors.length) {
        errors.push({ 
          field: 'size.depth', 
          message: `Dungeon depth (${dungeon.size.depth}) should match number of floors (${dungeon.floors.length})` 
        });
      }
    } else if (dungeon.rooms && dungeon.rooms.length > 0) {
      // Legacy single-floor structure
      allRooms.push(...dungeon.rooms);
    } else {
      errors.push({ field: 'rooms', message: 'Dungeon must have at least one floor with rooms' });
      return { valid: false, errors };
    }

    // Check for at least one entrance room
    const entranceRooms = allRooms.filter(room => room.type === 'entrance');
    if (entranceRooms.length === 0) {
      errors.push({ field: 'rooms', message: 'Dungeon must have at least one entrance room' });
    }

    // Check for at least one boss room
    const bossRooms = allRooms.filter(room => room.type === 'boss');
    if (bossRooms.length === 0) {
      errors.push({ field: 'rooms', message: 'Dungeon must have at least one boss room' });
    }

    // Validate unique coordinates
    const coordinateSet = new Set<string>();
    for (const room of allRooms) {
      const coordKey = `${room.coordinates.x},${room.coordinates.y},${room.coordinates.z || 0}`;
      if (coordinateSet.has(coordKey)) {
        errors.push({ 
          field: `room.${room.id}.coordinates`, 
          message: `Duplicate coordinates found at (${room.coordinates.x}, ${room.coordinates.y}, ${room.coordinates.z || 0})` 
        });
      }
      coordinateSet.add(coordKey);
    }

    // Validate reciprocal connections
    const roomMap = new Map(allRooms.map(room => [room.id, room]));
    for (const room of allRooms) {
      for (const connection of room.connections) {
        const targetRoom = roomMap.get(connection.targetRoomId);
        if (!targetRoom) {
          errors.push({ 
            field: `room.${room.id}.connections`, 
            message: `Connection to non-existent room: ${connection.targetRoomId}` 
          });
          continue;
        }

        // Check for reciprocal connection
        const oppositeDirection = this.getOppositeDirection(connection.direction);
        const reciprocalConnection = targetRoom.connections.find(
          conn => conn.direction === oppositeDirection && conn.targetRoomId === room.id
        );
        
        if (!reciprocalConnection) {
          errors.push({ 
            field: `room.${room.id}.connections`, 
            message: `Missing reciprocal connection from room ${connection.targetRoomId} (${oppositeDirection})` 
          });
        }
      }
    }

    // Validate monster stats scaling based on dungeon level
    for (const room of allRooms) {
      if (room.monsters) {
        for (const monster of room.monsters) {
          if (monster.level < dungeon.level - 2 || monster.level > dungeon.level + 2) {
            errors.push({ 
              field: `room.${room.id}.monster.${monster.id}.level`, 
              message: `Monster level ${monster.level} is not appropriate for dungeon level ${dungeon.level}` 
            });
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Gets the opposite direction for reciprocal connections
   */
  static getOppositeDirection(direction: Direction): Direction {
    const opposites: Record<Direction, Direction> = {
      north: 'south',
      south: 'north',
      east: 'west',
      west: 'east'
    };
    return opposites[direction];
  }

  /**
   * Validates room structure
   */
  static validateRoom(room: Room, dungeonLevel: number): ValidationResult {
    const errors: ValidationError[] = [];

    if (!room.id || room.id.trim() === '') {
      errors.push({ field: 'room.id', message: 'Room ID is required' });
    }

    if (!room.description || room.description.trim() === '') {
      errors.push({ field: 'room.description', message: 'Room description is required' });
    }

    if (!room.coordinates) {
      errors.push({ field: 'room.coordinates', message: 'Room coordinates are required' });
    }

    // Validate monsters if present
    if (room.monsters) {
      for (const monster of room.monsters) {
        const monsterValidation = this.validateMonster(monster, dungeonLevel);
        errors.push(...monsterValidation.errors);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates monster structure
   */
  static validateMonster(monster: Monster, dungeonLevel: number): ValidationResult {
    const errors: ValidationError[] = [];

    if (!monster.id || monster.id.trim() === '') {
      errors.push({ field: 'monster.id', message: 'Monster ID is required' });
    }

    if (!monster.name || monster.name.trim() === '') {
      errors.push({ field: 'monster.name', message: 'Monster name is required' });
    }

    if (!monster.stats) {
      errors.push({ field: 'monster.stats', message: 'Monster stats are required' });
    } else {
      if (monster.stats.health <= 0) {
        errors.push({ field: 'monster.stats.health', message: 'Monster health must be positive' });
      }
      if (monster.stats.attack < 0) {
        errors.push({ field: 'monster.stats.attack', message: 'Monster attack cannot be negative' });
      }
      if (monster.stats.defense < 0) {
        errors.push({ field: 'monster.stats.defense', message: 'Monster defense cannot be negative' });
      }
    }

    if (monster.level < dungeonLevel - 2 || monster.level > dungeonLevel + 2) {
      errors.push({ 
        field: 'monster.level', 
        message: `Monster level should be within ±2 of dungeon level ${dungeonLevel}` 
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

/**
 * Helper functions for dungeon management
 */
export class DungeonHelpers {
  /**
   * Generates a unique ID
   */
  static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Creates a new empty dungeon
   */
  static createEmptyDungeon(name: string, difficulty: DifficultyLevel = 'Easy'): Dungeon {
    return {
      id: this.generateId(),
      name,
      difficulty,
      level: 1,
      size: { width: 10, height: 10 },
      description: '',
      rooms: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Creates a new room
   */
  static createRoom(type: RoomType, coordinates: Coordinates, description: string): Room {
    return {
      id: this.generateId(),
      type,
      coordinates,
      description,
      connections: [],
      visited: false,
      cleared: false
    };
  }

  /**
   * Adds a connection between two rooms
   */
  static addConnection(
    sourceRoom: Room, 
    targetRoom: Room, 
    direction: Direction
  ): void {
    const oppositeDirection = DungeonValidator.getOppositeDirection(direction);
    
    // Add connection from source to target
    if (!sourceRoom.connections.find(conn => conn.targetRoomId === targetRoom.id)) {
      sourceRoom.connections.push({
        direction,
        targetRoomId: targetRoom.id,
        locked: false,
        hidden: false
      });
    }
    
    // Add reciprocal connection from target to source
    if (!targetRoom.connections.find(conn => conn.targetRoomId === sourceRoom.id)) {
      targetRoom.connections.push({
        direction: oppositeDirection,
        targetRoomId: sourceRoom.id,
        locked: false,
        hidden: false
      });
    }
  }

  /**
   * Creates a new empty floor
   */
  static createEmptyFloor(floorNumber: number, name?: string): DungeonFloor {
    return {
      floorNumber,
      name: name || `Floor ${floorNumber}`,
      description: '',
      rooms: []
    };
  }

  /**
   * Creates a new multi-floor dungeon
   */
  static createMultiFloorDungeon(name: string, numFloors: number = 1, difficulty: DifficultyLevel = 'Easy'): Dungeon {
    const floors: DungeonFloor[] = [];
    for (let i = 1; i <= numFloors; i++) {
      floors.push(this.createEmptyFloor(i));
    }
    
    return {
      id: this.generateId(),
      name,
      difficulty,
      level: 1,
      size: { width: 10, height: 10, depth: numFloors },
      description: '',
      rooms: [], // Keep for backward compatibility
      floors,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Converts legacy single-floor dungeon to multi-floor format
   */
  static convertToMultiFloor(dungeon: Dungeon): Dungeon {
    if (dungeon.floors && dungeon.floors.length > 0) {
      // Already multi-floor
      return dungeon;
    }

    // Create a single floor from existing rooms
    const floor: DungeonFloor = {
      floorNumber: 1,
      name: 'Ground Floor',
      description: 'Main level',
      rooms: dungeon.rooms || []
    };

    return {
      ...dungeon,
      floors: [floor],
      size: {
        ...dungeon.size,
        depth: 1
      },
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Gets all rooms from a dungeon (handles both legacy and multi-floor)
   */
  static getAllRooms(dungeon: Dungeon): Room[] {
    if (dungeon.floors && dungeon.floors.length > 0) {
      return dungeon.floors.flatMap(floor => floor.rooms);
    }
    return dungeon.rooms || [];
  }

  /**
   * Gets rooms for a specific floor
   */
  static getFloorRooms(dungeon: Dungeon, floorNumber: number): Room[] {
    if (dungeon.floors) {
      const floor = dungeon.floors.find(f => f.floorNumber === floorNumber);
      return floor?.rooms || [];
    }
    // Legacy format: all rooms are on floor 0 or 1
    return floorNumber === 1 ? (dungeon.rooms || []) : [];
  }

  /**
   * Converts legacy dungeon format to current schema
   * Supports alternative JSON formats with different field structures
   */
  static convertLegacyFormat(legacyData: any): Dungeon[] {
    const dungeons: Dungeon[] = [];
    
    if (!legacyData.dungeons || !Array.isArray(legacyData.dungeons)) {
      return dungeons;
    }

    for (const legacyDungeon of legacyData.dungeons) {
      // Create dungeon with new schema
      const dungeon: Dungeon = {
        id: this.generateId(),
        name: `Level ${legacyDungeon.level || 1} Dungeon`,
        difficulty: 'Medium',
        level: legacyDungeon.level || 1,
        size: {
          width: legacyDungeon.size || 10,
          height: legacyDungeon.size || 10
        },
        description: `A level ${legacyDungeon.level || 1} dungeon with ${legacyDungeon.rooms?.length || 0} rooms`,
        rooms: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Convert rooms
      if (legacyDungeon.rooms && Array.isArray(legacyDungeon.rooms)) {
        const roomIdMap = new Map<number, string>(); // Map old numeric IDs to new string IDs

        // First pass: create rooms and build ID map
        for (const legacyRoom of legacyDungeon.rooms) {
          const newRoomId = this.generateId();
          roomIdMap.set(legacyRoom.id, newRoomId);

          const room: Room = {
            id: newRoomId,
            type: this.mapLegacyRoomType(legacyRoom.type),
            coordinates: {
              x: legacyRoom.x || 0,
              y: legacyRoom.y || 0
            },
            description: legacyRoom.description || '',
            connections: [],
            visited: false,
            cleared: false
          };

          // Convert monsters
          if (legacyRoom.monsters && Array.isArray(legacyRoom.monsters)) {
            room.monsters = legacyRoom.monsters.map((legacyMonster: any) => ({
              id: this.generateId(),
              name: legacyMonster.name || 'Unknown Monster',
              type: legacyMonster.specialAbility || 'enemy',
              stats: {
                health: legacyMonster.maxHealth || 50,
                attack: legacyMonster.damage || 10,
                defense: legacyMonster.defense || 5,
                speed: legacyMonster.agility || 10
              },
              level: legacyMonster.level || dungeon.level,
              description: `${legacyMonster.name || 'Unknown Monster'} - Level ${legacyMonster.level || dungeon.level}`,
              loot: legacyMonster.goldValue ? [`${legacyMonster.goldValue} gold`] : []
            }));
          }

          // Convert puzzle
          if (legacyRoom.puzzle) {
            room.puzzle = {
              id: this.generateId(),
              type: legacyRoom.puzzle.type || 'riddle',
              difficulty: 'Medium',
              description: legacyRoom.puzzle.description || legacyRoom.puzzle.question || '',
              solution: legacyRoom.puzzle.answer,
              reward: legacyRoom.puzzle.rewardGold ? `${legacyRoom.puzzle.rewardGold} gold` : undefined
            };
          }

          // Convert story event
          if (legacyRoom.storyEvent) {
            room.story = {
              id: this.generateId(),
              title: legacyRoom.storyEvent.title || 'Story Event',
              description: legacyRoom.storyEvent.description || '',
              choices: legacyRoom.storyEvent.choices?.map((c: any) => c?.text || '') || [],
              consequences: legacyRoom.storyEvent.choices?.map((c: any) => c?.outcome?.description || '') || []
            };
          }

          // Convert lore entry
          if (legacyRoom.loreEntry) {
            room.lore = [{
              id: this.generateId(),
              title: legacyRoom.loreEntry.title || 'Lore Entry',
              content: legacyRoom.loreEntry.text || '',
              discovered: false
            }];
          }

          // Convert secret
          if (legacyRoom.secret) {
            room.secrets = [{
              id: this.generateId(),
              type: 'treasure',
              description: legacyRoom.secret.description || 'A hidden treasure',
              reward: legacyRoom.secret.rewardGold ? `${legacyRoom.secret.rewardGold} gold` : undefined
            }];
          }

          dungeon.rooms.push(room);
        }

        // Second pass: create connections based on legacy connections array
        for (let i = 0; i < legacyDungeon.rooms.length; i++) {
          const legacyRoom = legacyDungeon.rooms[i];
          const room = dungeon.rooms[i];

          if (legacyRoom.connections && Array.isArray(legacyRoom.connections)) {
            for (const direction of legacyRoom.connections) {
              // Find the target room based on direction and coordinates
              const targetRoom = this.findRoomByDirection(
                dungeon.rooms,
                room.coordinates,
                direction as Direction
              );

              if (targetRoom) {
                // Add connection if it doesn't exist
                if (!room.connections.find(conn => conn.targetRoomId === targetRoom.id)) {
                  room.connections.push({
                    direction: direction as Direction,
                    targetRoomId: targetRoom.id,
                    locked: false,
                    hidden: false
                  });
                }
              }
            }
          }
        }
      }

      dungeons.push(dungeon);
    }

    return dungeons;
  }

  /**
   * Maps legacy room type to current schema
   */
  private static mapLegacyRoomType(legacyType: string): RoomType {
    const typeMap: Record<string, RoomType> = {
      'entrance': 'entrance',
      'boss': 'boss',
      'treasure': 'treasure',
      'puzzle': 'puzzle',
      'combat': 'combat',
      'rest': 'rest',
      'trap': 'trap',
      'empty': 'empty',
      'lore': 'empty',
      'story': 'empty'
    };
    return typeMap[legacyType] || 'empty';
  }

  /**
   * Finds a room by direction from given coordinates
   */
  private static findRoomByDirection(
    rooms: Room[],
    fromCoords: Coordinates,
    direction: Direction
  ): Room | undefined {
    let targetX = fromCoords.x;
    let targetY = fromCoords.y;

    switch (direction) {
      case 'north':
        targetY -= 1;
        break;
      case 'south':
        targetY += 1;
        break;
      case 'east':
        targetX += 1;
        break;
      case 'west':
        targetX -= 1;
        break;
    }

    return rooms.find(room => 
      room.coordinates.x === targetX && room.coordinates.y === targetY
    );
  }
}
