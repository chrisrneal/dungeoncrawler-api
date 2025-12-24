# Dungeon Crawler API

A Next.js application for managing dungeon crawler games, providing both a comprehensive CRUD interface and RESTful API endpoints for dungeon schema management.

## Features

- 🚀 Built with Next.js 16 and TypeScript
- 🎨 Full-featured CRUD interface for dungeon management
- 📡 RESTful API endpoints with validation
- 🔒 Type-safe with comprehensive TypeScript interfaces
- ✅ Schema validation with detailed error reporting
- 📥 Import/Export dungeons in JSON format
- 🗺️ Support for rooms, monsters, puzzles, story events, lore, and secrets
- ☁️ Ready for Vercel deployment

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

```
dungeoncrawler-api/
├── app/
│   ├── about/           # About page
│   │   └── page.tsx
│   ├── api/             # API routes
│   │   ├── hello/
│   │   │   └── route.ts # GET /api/hello
│   │   └── dungeon/
│   │       └── route.ts # Full CRUD API for dungeons
│   ├── dungeons/        # Dungeon management UI
│   │   └── page.tsx     # CRUD interface
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page
│   └── globals.css      # Global styles
├── lib/
│   └── api.ts           # TypeScript interfaces and validation
├── public/
│   └── data/
│       └── dungeon-data.json  # Example dungeon data
├── API_SCHEMA.md        # Complete API documentation
├── next.config.ts       # Next.js configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Project dependencies
```

## Using the CRUD Interface

### Access the Dungeon Manager

Navigate to [http://localhost:3000/dungeons](http://localhost:3000/dungeons) to access the full CRUD interface.

### Create a Dungeon

1. Click "Create New Dungeon"
2. Fill in basic information (name, difficulty, level, size, description)
3. Add rooms with the "Add Room" button
4. For each room:
   - Set type (entrance, boss, treasure, puzzle, combat, rest, trap, empty)
   - Define coordinates
   - Add monsters with stats
   - Configure puzzles, story events, lore, and secrets
5. Click "Save Dungeon" to persist changes

### Validation Rules

The system enforces these validation rules:
- ✅ At least one entrance room required
- ✅ At least one boss room required
- ✅ Unique coordinates for each room
- ✅ Reciprocal connections between rooms
- ✅ Monster levels within ±2 of dungeon level
- ✅ Valid connections to existing rooms

### Import/Export

- **Export**: Click "Export" on any dungeon to download as JSON
- **Import**: Click "Import Dungeon" and select a JSON file matching the schema

## API Endpoints

### GET /api/dungeon

Returns all dungeons or a specific dungeon by ID.

**Query Parameters:**
- `id` (optional): Dungeon ID for single dungeon retrieval

**Response (all dungeons):**
```json
{
  "success": true,
  "data": [
    {
      "id": "dungeon-001",
      "name": "The Dark Cavern",
      "difficulty": "Easy",
      "level": 1,
      "size": { "width": 5, "height": 5 },
      "description": "A beginner-friendly dungeon",
      "rooms": [...]
    }
  ]
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

Creates a new dungeon with validation.

**Request Body:**
Complete dungeon object (see API_SCHEMA.md)

**Success Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Validation Error Response:**
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
Same format as POST

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

## Schema Documentation

For complete API schema documentation including all data structures, validation rules, and usage examples, see [API_SCHEMA.md](API_SCHEMA.md).

### Key Data Structures

- **Dungeon**: Top-level entity with rooms and metadata
- **Room**: Individual room with type, coordinates, connections
- **Monster**: Enemy with stats and loot
- **Puzzle**: Challenge with difficulty and solution
- **Story Event**: Narrative moment with choices
- **Lore**: Background information
- **Secret**: Hidden content or rewards

## TypeScript Interfaces

All TypeScript interfaces are defined in `lib/api.ts`:

```typescript
import { Dungeon, Room, Monster, DungeonValidator, DungeonHelpers } from '@/lib/api';

// Create a new dungeon
const dungeon = DungeonHelpers.createEmptyDungeon('My Dungeon');

// Validate
const validation = DungeonValidator.validateDungeon(dungeon);
```

## Pages

- **/** - Home page with navigation
- **/dungeons** - Full CRUD interface for dungeon management
- **/about** - Information about the application and available APIs

## Technology Stack

- **Framework:** Next.js 16.1.1
- **Runtime:** React 19
- **Language:** TypeScript 5.9
- **Styling:** CSS-in-JS (styled-jsx)
- **Deployment:** Vercel-ready

## Development

The application uses:
- App Router for routing
- Server and Client Components
- TypeScript for type safety
- API Routes for backend functionality
- File-based data persistence (JSON)

## Example Dungeons

See `public/data/dungeon-data.json` for example dungeon configurations including:
- The Dark Cavern (Easy, Level 1)
- Shadow Fortress (Medium, Level 5)

## License

ISC
