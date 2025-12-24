# Dungeon Crawler API Schema Documentation

**Version**: 1.1.0 (December 2024)

## Overview

This document describes the complete data schema for the Dungeon Crawler API, including all entities, their relationships, validation rules, and usage patterns.

## Table of Contents

1. [Data Structures](#data-structures)
2. [Type Definitions](#type-definitions)
3. [Validation Rules](#validation-rules)
4. [API Endpoints](#api-endpoints)
5. [Import/Export Format](#importexport-format)

---

## Data Structures

### Dungeon

The top-level entity representing a complete dungeon configuration.

```typescript
interface Dungeon {
  id: string;                    // Unique identifier
  name: string;                  // Display name
  difficulty: DifficultyLevel;   // Difficulty rating
  level: number;                 // Recommended player level
  size: {                        // Dungeon dimensions
    width: number;
    height: number;
    depth?: number;              // Optional for multi-level dungeons
  };
  description: string;           // Narrative description
  rooms: Room[];                 // Array of all rooms
  createdAt?: string;            // ISO 8601 timestamp
  updatedAt?: string;            // ISO 8601 timestamp
}
```

### Room

Individual room within a dungeon.

```typescript
interface Room {
  id: string;                    // Unique identifier
  type: RoomType;                // Room classification
  coordinates: Coordinates;      // Position in dungeon
  description: string;           // Room description
  connections: RoomConnection[]; // Exits to other rooms
  monsters?: Monster[];          // Optional monster encounters
  puzzle?: Puzzle;               // Optional puzzle
  story?: StoryEvent;            // Optional story event
  lore?: Lore[];                // Optional lore entries
  secrets?: Secret[];            // Optional secrets
  visited?: boolean;             // Player exploration state
  cleared?: boolean;             // Completion state
}
```

### Monster

Enemy or creature definition.

```typescript
interface Monster {
  id: string;                    // Unique identifier
  name: string;                  // Display name
  type: string;                  // Monster category (e.g., "undead", "beast")
  stats: MonsterStats;           // Combat statistics
  level: number;                 // Monster level
  description?: string;          // Flavor text
  loot?: string[];              // Potential rewards
}

interface MonsterStats {
  health: number;                // Hit points
  attack: number;                // Attack power
  defense: number;               // Defense rating
  speed: number;                 // Initiative/turn order
}
```

### Puzzle

Challenge or riddle within a room.

```typescript
interface Puzzle {
  id: string;                    // Unique identifier
  type: string;                  // Puzzle category
  difficulty: DifficultyLevel;   // Challenge rating
  description: string;           // Puzzle details
  solution?: string;             // Answer or method
  reward?: string;               // Completion reward
}
```

### Story Event

Narrative moment or choice point.

```typescript
interface StoryEvent {
  id: string;                    // Unique identifier
  title: string;                 // Event title
  description: string;           // Event narrative
  choices?: string[];            // Player options
  consequences?: string[];       // Outcome descriptions
}
```

### Lore

Background information or world-building.

```typescript
interface Lore {
  id: string;                    // Unique identifier
  title: string;                 // Lore entry title
  content: string;               // Full text
  discovered?: boolean;          // Discovery state
}
```

### Secret

Hidden content or reward.

```typescript
interface Secret {
  id: string;                    // Unique identifier
  type: 'hidden_room' | 'treasure' | 'passage' | 'lore';
  description: string;           // Secret details
  discoveryMethod?: string;      // How to find
  reward?: string;               // What is gained
}
```

### Coordinates

Position within the dungeon grid.

```typescript
interface Coordinates {
  x: number;                     // Horizontal position
  y: number;                     // Vertical position
  z?: number;                    // Optional depth level
}
```

### Room Connection

Link between rooms.

```typescript
interface RoomConnection {
  direction: Direction;          // Cardinal direction
  targetRoomId: string;         // Connected room ID
  locked?: boolean;              // Access restriction
  hidden?: boolean;              // Visibility state
}
```

---

## Type Definitions

### DifficultyLevel

```typescript
type DifficultyLevel = 'Easy' | 'Medium' | 'Hard' | 'Expert';
```

### Direction

```typescript
type Direction = 'north' | 'south' | 'east' | 'west';
```

### RoomType

```typescript
type RoomType = 'entrance' | 'boss' | 'treasure' | 'puzzle' | 'combat' | 'rest' | 'trap' | 'empty';
```

---

## Validation Rules

### Required Fields

#### Dungeon
- `id`, `name`, `difficulty`, `level`, `size`, `description`, `rooms`

#### Room
- `id`, `type`, `coordinates`, `description`, `connections`

#### Monster
- `id`, `name`, `type`, `stats`, `level`

### Structural Rules

1. **At least one entrance room**: Every dungeon must have at least one room with `type: 'entrance'`

2. **At least one boss room**: Every dungeon must have at least one room with `type: 'boss'`

3. **Unique coordinates**: No two rooms in a dungeon can share the same `(x, y, z)` coordinates

4. **Reciprocal connections**: If room A has a connection to room B in direction D, room B must have a connection to room A in the opposite direction
   - north ↔ south
   - east ↔ west

5. **Valid connections**: All `targetRoomId` values in connections must reference existing rooms in the dungeon

6. **Monster level scaling**: Monster levels should be within ±2 levels of the dungeon level
   - For a level 5 dungeon, monsters should be level 3-7

### Data Constraints

- Monster health must be > 0
- Monster attack, defense, and speed must be ≥ 0
- Dungeon dimensions (width, height, depth) must be ≥ 1
- Dungeon level must be ≥ 1

---

## API Endpoints

### GET /api/dungeon

Returns all dungeons or a specific dungeon.

**Query Parameters:**
- `id` (optional): Specific dungeon ID

**Response (all dungeons):**
```json
{
  "success": true,
  "data": [...]
}
```

**Response (single dungeon):**
```json
{
  "success": true,
  "data": { ... }
}
```

### POST /api/dungeon

Creates a new dungeon.

**Request Body:**
```json
{
  "id": "dungeon-001",
  "name": "The Dark Cavern",
  "difficulty": "Easy",
  "level": 1,
  "size": { "width": 10, "height": 10 },
  "description": "A beginner dungeon",
  "rooms": [...]
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Validation Errors:**
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": [
    {
      "field": "rooms",
      "message": "Dungeon must have at least one entrance room"
    }
  ]
}
```

### PUT /api/dungeon

Updates an existing dungeon.

**Query Parameters:**
- `id` (required): Dungeon ID to update

**Request Body:**
Complete updated dungeon object

**Response:**
Same as POST

### DELETE /api/dungeon

Deletes a dungeon.

**Query Parameters:**
- `id` (required): Dungeon ID to delete

**Response:**
```json
{
  "success": true,
  "data": { "id": "dungeon-001" }
}
```

---

## Import/Export Format

Dungeons can be imported and exported in JSON format compatible with `/public/data/dungeon-data.json`.

### Export Format

```json
{
  "dungeons": [
    {
      "id": "dungeon-001",
      "name": "The Dark Cavern",
      "difficulty": "Easy",
      "level": 1,
      "size": { "width": 5, "height": 5 },
      "description": "A beginner-friendly dungeon",
      "rooms": [
        {
          "id": "room-001",
          "type": "entrance",
          "coordinates": { "x": 0, "y": 0 },
          "description": "The entrance",
          "connections": [
            {
              "direction": "north",
              "targetRoomId": "room-002",
              "locked": false,
              "hidden": false
            }
          ],
          "visited": false,
          "cleared": true
        }
      ],
      "createdAt": "2024-12-01T00:00:00.000Z",
      "updatedAt": "2024-12-24T00:00:00.000Z"
    }
  ]
}
```

### Import Process

1. Select "Import Dungeon" from the UI
2. Choose a JSON file matching the export format
3. The system will:
   - Parse the JSON
   - Generate new IDs for imported dungeons
   - Open the dungeon in edit mode for review
   - Allow saving after validation

---

## TypeScript Implementation

All interfaces and validation logic are implemented in `/lib/api.ts`:

- Type definitions
- `DungeonValidator` class with validation methods
- `DungeonHelpers` class with utility functions
- `ApiResponse` wrapper type for API responses

### Usage Example

```typescript
import { Dungeon, DungeonValidator, DungeonHelpers } from '@/lib/api';

// Create a new dungeon
const dungeon = DungeonHelpers.createEmptyDungeon('My Dungeon');

// Add rooms
const entrance = DungeonHelpers.createRoom('entrance', { x: 0, y: 0 }, 'Entry hall');
const boss = DungeonHelpers.createRoom('boss', { x: 0, y: 1 }, 'Boss chamber');
dungeon.rooms.push(entrance, boss);

// Connect rooms
DungeonHelpers.addConnection(entrance, boss, 'north');

// Validate
const validation = DungeonValidator.validateDungeon(dungeon);
if (!validation.valid) {
  console.error(validation.errors);
}
```

---

## Version History

- **1.1.0** (December 2024): Initial documented release
  - Complete CRUD interface
  - Comprehensive validation
  - Import/export functionality
  - TypeScript type safety

---

## Support

For issues or questions, please refer to the [README.md](README.md) or open an issue on the project repository.
