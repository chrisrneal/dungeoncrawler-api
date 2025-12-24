# Dungeon Crawler API Schema Documentation

**Version**: 1.1.0 (December 2024)

## Overview

This document describes the complete data schema for the Dungeon Crawler API, including all entities, their relationships, validation rules, and usage patterns.

## Table of Contents

1. [Data Structures](#data-structures)
2. [API Response Types](#api-response-types)
   - [APIRoomData](#apiroomdata)
   - [APIMonsterData](#apimonsterdata)
   - [APIPuzzle](#apipuzzle)
   - [APIStoryEvent](#apistoryevent)
   - [APIRoomSecret](#apiroomsecret)
   - [APILoreEntry](#apiloreentry)
3. [Type Definitions](#type-definitions)
4. [Validation Rules](#validation-rules)
5. [API Endpoints](#api-endpoints)
6. [Import/Export Format](#importexport-format)

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

## API Response Types

This section describes the data structures returned by the API endpoints. These types represent the actual JSON format sent over HTTP and may differ from the internal domain model.

### APIRoomData

Represents complete room information as returned by the API.

```typescript
interface APIRoomData {
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
```

**Fields**:
- `id` (number): Unique room identifier
- `type` (string): Room type classification
- `description` (string): Room description text
- `x` (number): X coordinate on dungeon grid
- `y` (number): Y coordinate on dungeon grid
- `connections` (array): Available exits from this room
- `secret` (object, optional): Hidden secret that can be found by searching
- `loreEntry` (object, optional): Lore content for lore rooms (see [APILoreEntry](#apiloreentry))
- `puzzle` (object, optional): Puzzle configuration for puzzle rooms
- `storyEvent` (object, optional): Story event for story rooms
- `monsters` (array, optional): Monsters present in combat/boss rooms
- `isMiniBoss` (boolean): Whether this room contains a mini-boss
- `isTrap` (boolean): Whether this room contains a trap
- `isRewardRoom` (boolean): Whether this room contains special rewards

---

### APIMonsterData

Represents monster information as returned by the API.

```typescript
interface APIMonsterData {
  name: string;
  level: number;
  maxHealth: number;
  damage: number;
  defense: number;
  agility: number;
  specialAbility?: string;
  goldValue: number;
}
```

**Fields**:
- `name` (string): Monster name
- `level` (number): Monster level
- `maxHealth` (number): Maximum hit points
- `damage` (number): Attack damage value
- `defense` (number): Defense rating
- `agility` (number): Speed/initiative value
- `specialAbility` (string, optional): Special ability description
- `goldValue` (number): Gold dropped on defeat

---

### APIPuzzle

Represents puzzle configuration as returned by the API.

```typescript
interface APIPuzzle {
  type: string;
  description: string;
  question?: string;
  answer?: string;
  rewardGold?: number;
}
```

**Fields**:
- `type` (string): Puzzle type (e.g., "riddle", "logic", "pattern")
- `description` (string): Puzzle description or context
- `question` (string, optional): The puzzle question
- `answer` (string, optional): The puzzle solution
- `rewardGold` (number, optional): Gold reward for solving

---

### APIStoryEvent

Represents story event configuration as returned by the API.

```typescript
interface APIStoryEvent {
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
```

**Fields**:
- `title` (string): Story event title
- `description` (string): Event narrative description
- `choices` (array, optional): Available player choices
  - `text` (string): Choice text
  - `outcome` (object, optional): Result of this choice
    - `description` (string): Outcome description
    - `effect` (string, optional): Game effect of the choice

---

### APIRoomSecret

Represents secret configuration as returned by the API.

```typescript
interface APIRoomSecret {
  description: string;
  rewardGold?: number;
  revealCondition?: string;
}
```

**Fields**:
- `description` (string): Secret description
- `rewardGold` (number, optional): Gold reward for finding the secret
- `revealCondition` (string, optional): Condition for revealing the secret

---

### APILoreEntry

Represents a lore fragment or story element from the API.

```typescript
interface APILoreEntry {
  title: string;
  type: 'journal' | 'inscription' | 'fragment' | 'document';
  text: string;
  category: 'history' | 'warning' | 'magic' | 'personal' | 'mundane' | 'mythology' | 'exploration';
}
```

**Fields**:
- `title` (string): Lore entry title
- `type` (string): Type of lore document
  - `'journal'`: Personal journal entries from adventurers or inhabitants
  - `'inscription'`: Stone carvings or wall inscriptions
  - `'fragment'`: Torn pages or partial documents
  - `'document'`: Complete official documents or reports
- `text` (string): Full lore text (can include newlines for formatting)
- `category` (string): Lore category for classification
  - `'history'`: Historical events and past kingdoms
  - `'warning'`: Cautionary messages and dangers
  - `'magic'`: Magical knowledge and rituals
  - `'personal'`: Personal stories and letters
  - `'mundane'`: Everyday documents and manifests
  - `'mythology'`: Legends and divine lore
  - `'exploration'`: Maps, clues, and exploration notes

**Example**:
```json
{
  "title": "Ancient Warning",
  "type": "inscription",
  "text": "Turn back, ye who enter here...",
  "category": "warning"
}
```

**Usage in Room Data**:
Lore entries are included in lore rooms via the `loreEntry` field of `APIRoomData`:
```json
{
  "id": 6,
  "type": "lore",
  "description": "Dusty tomes and scattered parchments cover an ancient desk.",
  "x": 2,
  "y": -1,
  "connections": ["north", "south"],
  "loreEntry": {
    "title": "The Fall of the Silver Kingdom",
    "type": "journal",
    "text": "Day 42: The kingdom fell...",
    "category": "history"
  },
  "isMiniBoss": false,
  "isTrap": false,
  "isRewardRoom": false
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
