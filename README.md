# Dungeon Crawler API

A Next.js application for managing dungeon crawler games, providing both a comprehensive CRUD interface and RESTful API endpoints for dungeon schema management.

## Features

- 🚀 Built with Next.js 16 and TypeScript
- 🎨 Full-featured CRUD interface for dungeon management
- 📡 RESTful API endpoints with validation
- 🔧 Custom API endpoint configuration system
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
│   │   ├── dungeon/
│   │   │   └── route.ts # Full CRUD API for dungeons
│   │   ├── endpoints/
│   │   │   └── route.ts # Endpoint configuration API
│   │   └── custom/
│   │       └── [[...path]]/
│   │           └── route.ts # Dynamic custom endpoints
│   ├── api-endpoints/   # API endpoint configuration UI
│   │   └── page.tsx
│   ├── dungeons/        # Dungeon management UI
│   │   └── page.tsx     # CRUD interface
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page
│   └── globals.css      # Global styles
├── lib/
│   └── api.ts           # TypeScript interfaces and validation
├── public/
│   └── data/
│       ├── dungeon-data.json     # Example dungeon data
│       └── endpoint-config.json  # Endpoint configurations
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

## Custom API Endpoints

### Configure Custom Endpoints

Navigate to [http://localhost:3000/api-endpoints](http://localhost:3000/api-endpoints) to configure custom API endpoints.

### Features

- **Create Custom Endpoints**: Define custom API paths (e.g., `/api/custom/my-dungeon`)
- **Assign Dungeons**: Select which dungeon data to serve from each endpoint
- **Enable/Disable**: Toggle endpoints on/off without deleting them
- **Test Endpoints**: Built-in testing with JSON response viewer
- **Manage Configurations**: Full CRUD operations for endpoint configurations

### How to Use

1. Click "Create New Endpoint"
2. Enter a name for your endpoint (e.g., "Dark Cavern API")
3. Specify the API path (must start with `/api/custom/`)
4. Select which dungeon to serve from this endpoint
5. Optionally add a description
6. Click "Create" to save

Once created, you can:
- **Test** the endpoint directly in the UI to see the JSON response
- **Access** the endpoint via HTTP GET requests (e.g., `curl http://localhost:3000/api/custom/dark-cavern`)
- **Edit** endpoint configuration
- **Delete** endpoints you no longer need

### Example

Create an endpoint at `/api/custom/dark-cavern` that serves "The Dark Cavern" dungeon:

```bash
# Access the custom endpoint
curl http://localhost:3000/api/custom/dark-cavern

# Response
{
  "success": true,
  "data": {
    "id": "dungeon-001",
    "name": "The Dark Cavern",
    "difficulty": "Easy",
    "level": 1,
    ...
  }
}
```

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

## Endpoint Configuration API

### GET /api/endpoints

Returns all endpoint configurations or a specific one by ID.

**Query Parameters:**
- `id` (optional): Endpoint ID for single endpoint retrieval

### POST /api/endpoints

Creates a new endpoint configuration.

**Request Body:**
```json
{
  "id": "endpoint-001",
  "name": "Dark Cavern API",
  "path": "/api/custom/dark-cavern",
  "dungeonId": "dungeon-001",
  "description": "Custom endpoint for The Dark Cavern",
  "enabled": true
}
```

### PUT /api/endpoints

Updates an existing endpoint configuration.

**Query Parameters:**
- `id` (required): Endpoint ID to update

### DELETE /api/endpoints

Deletes an endpoint configuration.

**Query Parameters:**
- `id` (required): Endpoint ID to delete

### GET /api/custom/[...path]

Dynamic route that serves dungeon data based on configured endpoints.

**Example:**
```bash
GET /api/custom/dark-cavern
# Returns the dungeon assigned to this path
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
- **ApiEndpointConfig**: Custom endpoint configuration with path and dungeon mapping

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
- **/api-endpoints** - API endpoint configuration manager
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

## GitHub Copilot Instructions

For AI assistants working with this codebase, comprehensive instructions are available in [`.github/copilot-instructions.md`](.github/copilot-instructions.md). This includes:
- Project architecture and structure
- API patterns and validation rules
- Development workflow and best practices
- Integration guidelines for client applications
- Common tasks and troubleshooting

## License

ISC
