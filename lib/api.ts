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
 * Lore entry
 */
export interface Lore {
  id: string;
  title: string;
  content: string;
  discovered?: boolean;
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
 * Complete dungeon definition
 */
export interface Dungeon {
  id: string;
  name: string;
  difficulty: DifficultyLevel;
  level: number;
  size: {
    width: number;
    height: number;
    depth?: number; // Optional depth for multi-level dungeons
  };
  description: string;
  rooms: Room[];
  createdAt?: string;
  updatedAt?: string;
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
 * Dungeon validation rules
 */
export class DungeonValidator {
  /**
   * Validates a complete dungeon structure
   */
  static validateDungeon(dungeon: Dungeon): ValidationResult {
    const errors: ValidationError[] = [];

    // Check for at least one entrance room
    const entranceRooms = dungeon.rooms.filter(room => room.type === 'entrance');
    if (entranceRooms.length === 0) {
      errors.push({ field: 'rooms', message: 'Dungeon must have at least one entrance room' });
    }

    // Check for at least one boss room
    const bossRooms = dungeon.rooms.filter(room => room.type === 'boss');
    if (bossRooms.length === 0) {
      errors.push({ field: 'rooms', message: 'Dungeon must have at least one boss room' });
    }

    // Validate unique coordinates
    const coordinateSet = new Set<string>();
    for (const room of dungeon.rooms) {
      const coordKey = `${room.coordinates.x},${room.coordinates.y},${room.coordinates.z || 0}`;
      if (coordinateSet.has(coordKey)) {
        errors.push({ 
          field: `room.${room.id}.coordinates`, 
          message: `Duplicate coordinates found at (${room.coordinates.x}, ${room.coordinates.y})` 
        });
      }
      coordinateSet.add(coordKey);
    }

    // Validate reciprocal connections
    const roomMap = new Map(dungeon.rooms.map(room => [room.id, room]));
    for (const room of dungeon.rooms) {
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
    for (const room of dungeon.rooms) {
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
}
