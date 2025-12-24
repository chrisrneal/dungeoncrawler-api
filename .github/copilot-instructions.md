# GitHub Copilot Instructions for Dungeon Crawler API

> **Note for Users**: Yes, if you have a client application that consumes this API, you can provide access to that repository! This will help AI assistants understand the full context of how the API is being used and make better recommendations for coordinated changes across both repositories. See the "Working with Multiple Repositories" section below for guidance on multi-repo development.

## Project Overview

This is a **Next.js 16** application that provides both a web-based CRUD interface and RESTful API for managing dungeon crawler game data. The application is built with TypeScript and follows modern React patterns with the Next.js App Router.

### Purpose
- Serve as the backend API for dungeon crawler game management
- Provide a comprehensive web interface for creating and managing dungeons
- Validate dungeon schemas according to game rules
- Support import/export of dungeon configurations

### Technology Stack
- **Framework**: Next.js 16.1.1 with App Router
- **Language**: TypeScript 5.9
- **Runtime**: React 19
- **Styling**: CSS-in-JS (styled-jsx)
- **Deployment**: Vercel-ready

## Repository Structure

```
dungeoncrawler-api/
├── app/                          # Next.js App Router directory
│   ├── api/                      # API routes
│   │   ├── hello/                # Sample endpoint
│   │   │   └── route.ts          # GET /api/hello
│   │   └── dungeon/              # Dungeon CRUD API
│   │       └── route.ts          # Full CRUD operations
│   ├── dungeons/                 # Dungeon management UI
│   │   └── page.tsx              # CRUD interface page
│   ├── about/                    # About page
│   │   └── page.tsx
│   ├── layout.tsx                # Root layout component
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── lib/                          # Shared utilities and types
│   └── api.ts                    # TypeScript interfaces, validators, helpers
├── public/                       # Static assets
│   └── data/
│       └── dungeon-data.json     # Sample dungeon data
├── API_SCHEMA.md                 # Complete API documentation
├── README.md                     # Project documentation
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
└── next.config.ts                # Next.js configuration
```

## Core Architecture

### API Routes (`app/api/dungeon/route.ts`)
- **GET**: Retrieve all dungeons or a specific dungeon by ID
- **POST**: Create a new dungeon with validation
- **PUT**: Update an existing dungeon
- **DELETE**: Delete a dungeon by ID

All API responses follow this structure:
```typescript
{
  success: boolean;
  data?: any;
  error?: string;
  errors?: Array<{ field: string; message: string }>;
}
```

### Data Layer (`lib/api.ts`)
Contains three main exports:
1. **Type Definitions**: All TypeScript interfaces (Dungeon, Room, Monster, etc.)
2. **DungeonValidator**: Class with validation methods
3. **DungeonHelpers**: Utility functions for creating and manipulating dungeon data

### UI Layer (`app/dungeons/page.tsx`)
- Client-side React component with full CRUD functionality
- Form-based interface for creating/editing dungeons
- Import/export capabilities
- Real-time validation feedback

## Key Data Structures

### Dungeon
Top-level entity with metadata and rooms array:
```typescript
interface Dungeon {
  id: string;
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  level: number;
  size: { width: number; height: number; depth?: number };
  description: string;
  rooms: Room[];
  createdAt?: string;
  updatedAt?: string;
}
```

### Room
Individual room within a dungeon:
```typescript
interface Room {
  id: string;
  type: 'entrance' | 'boss' | 'treasure' | 'puzzle' | 'combat' | 'rest' | 'trap' | 'empty';
  coordinates: { x: number; y: number; z?: number };
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
```

### Other Entities
- **Monster**: Enemy with stats (health, attack, defense, speed) and level
- **Puzzle**: Challenge with difficulty and solution
- **StoryEvent**: Narrative moment with choices and consequences
- **Lore**: Background information entries
- **Secret**: Hidden content (hidden_room, treasure, passage, lore)

## Critical Validation Rules

The `DungeonValidator` class enforces these rules:

1. **Required Entrance**: At least one room with `type: 'entrance'`
2. **Required Boss**: At least one room with `type: 'boss'`
3. **Unique Coordinates**: No two rooms can have the same (x, y, z) coordinates
4. **Reciprocal Connections**: If room A connects to room B going north, room B must connect to room A going south
5. **Valid Connections**: All `targetRoomId` values must reference existing rooms
6. **Monster Level Scaling**: Monster levels should be within ±2 of dungeon level
7. **Positive Health**: Monster health must be > 0
8. **Non-negative Stats**: Monster attack, defense, speed must be ≥ 0
9. **Valid Dimensions**: Dungeon width, height, depth must be ≥ 1
10. **Minimum Level**: Dungeon level must be ≥ 1

## Development Workflow

### Commands
```bash
npm run dev      # Start development server (port 3000)
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

### Adding New Features

#### When adding API endpoints:
1. Create route handler in `app/api/[endpoint]/route.ts`
2. Export named functions for HTTP methods (GET, POST, PUT, DELETE)
3. Use `NextRequest` and `NextResponse` from `next/server`
4. Validate input using appropriate validators from `lib/api.ts`
5. Return responses in the standard format

#### When adding validation rules:
1. Add validation method to `DungeonValidator` class in `lib/api.ts`
2. Return validation errors as `Array<{ field: string; message: string }>`
3. Update `validateDungeon()` method to include the new validation
4. Document the rule in `API_SCHEMA.md`

#### When adding data structures:
1. Define TypeScript interface in `lib/api.ts`
2. Add corresponding type guards if needed
3. Update validation logic in `DungeonValidator`
4. Add helper methods to `DungeonHelpers` if appropriate
5. Document in `API_SCHEMA.md`

### File Storage
Currently uses in-memory storage with JSON file persistence to `public/data/dungeon-data.json`. When adding database support:
- Keep existing interfaces unchanged
- Create a new data access layer
- Implement the same validation rules
- Maintain backward compatibility for import/export

## Code Style and Patterns

### TypeScript
- Always use explicit types, avoid `any`
- Prefer interfaces over types for objects
- Use type unions for enums (e.g., `'Easy' | 'Medium' | 'Hard'`)
- Export types from `lib/api.ts` for reuse

### React Components
- Use functional components with hooks
- Prefer `'use client'` directive for interactive components
- Keep server components in `app/` routes when possible
- Use proper TypeScript typing for props

### API Routes
- Always validate input before processing
- Return consistent response format
- Handle errors gracefully with appropriate HTTP status codes
- Use proper HTTP methods semantically

### Naming Conventions
- Files: kebab-case (e.g., `dungeon-data.json`)
- Components: PascalCase (e.g., `DungeonManager`)
- Functions/variables: camelCase (e.g., `validateDungeon`)
- Types/Interfaces: PascalCase (e.g., `Dungeon`, `Room`)
- API routes: lowercase (e.g., `/api/dungeon`)

## Common Tasks

### Creating a New Dungeon Programmatically
```typescript
import { DungeonHelpers, DungeonValidator } from '@/lib/api';

const dungeon = DungeonHelpers.createEmptyDungeon('My Dungeon');
const entrance = DungeonHelpers.createRoom('entrance', { x: 0, y: 0 }, 'Entry');
const boss = DungeonHelpers.createRoom('boss', { x: 0, y: 1 }, 'Boss Room');

dungeon.rooms.push(entrance, boss);
DungeonHelpers.addConnection(entrance, boss, 'north');

const validation = DungeonValidator.validateDungeon(dungeon);
if (validation.valid) {
  // Save dungeon
}
```

### Adding a New Room Type
1. Update `RoomType` in `lib/api.ts`
2. Update UI dropdown in `app/dungeons/page.tsx`
3. Add any special validation rules for the new type
4. Document in `API_SCHEMA.md`

### Testing Validation
```typescript
// Test in browser console or Node.js
const testDungeon = { /* dungeon data */ };
const result = DungeonValidator.validateDungeon(testDungeon);
console.log(result);
```

## Integration with Client Applications

This API is designed to be consumed by front-end game applications. When working with a client application:

### Expected Usage Pattern
1. Client fetches dungeons via `GET /api/dungeon`
2. Player explores dungeon (tracked in client state)
3. Client updates dungeon state via `PUT /api/dungeon?id={dungeonId}`
4. Client creates new dungeons via `POST /api/dungeon`

### CORS Considerations
When deploying, ensure proper CORS headers are configured in `next.config.ts` if the client app is on a different domain.

### Client State vs Server State
- **Server**: Stores dungeon configuration (rooms, connections, monsters)
- **Client**: Manages player state (visited rooms, cleared status, inventory)

### Example Client Integration
```typescript
// In client application
const response = await fetch('https://api-domain.com/api/dungeon');
const { success, data } = await response.json();
if (success) {
  const dungeons = data;
  // Load dungeon into game engine
}
```

## Working with Multiple Repositories

If you have access to both this API repository and a client application repository:

### Shared Schema
- The TypeScript interfaces in `lib/api.ts` can be copied to the client
- Consider publishing as an npm package for shared types
- Keep validation logic on the server side

### Development Workflow
1. Make schema changes in this repository first
2. Update `API_SCHEMA.md` documentation
3. Test API changes with Postman or similar
4. Update client application to use new schema
5. Test end-to-end integration

### Versioning
- API changes should be backward compatible when possible
- Consider API versioning (e.g., `/api/v2/dungeon`) for breaking changes
- Document changes in both repositories

## Testing Considerations

### Manual Testing
- Use the web UI at `/dungeons` to test CRUD operations
- Test validation by intentionally creating invalid dungeons
- Verify import/export functionality
- Check API responses with browser DevTools

### API Testing
Use curl or Postman:
```bash
# Get all dungeons
curl http://localhost:3000/api/dungeon

# Get specific dungeon
curl http://localhost:3000/api/dungeon?id=dungeon-001

# Create dungeon
curl -X POST http://localhost:3000/api/dungeon \
  -H "Content-Type: application/json" \
  -d @dungeon.json

# Update dungeon
curl -X PUT http://localhost:3000/api/dungeon?id=dungeon-001 \
  -H "Content-Type: application/json" \
  -d @dungeon.json

# Delete dungeon
curl -X DELETE http://localhost:3000/api/dungeon?id=dungeon-001
```

### Future Testing Infrastructure
When adding tests:
- Use Jest for unit tests
- Use React Testing Library for component tests
- Use Playwright or Cypress for E2E tests
- Test validation logic thoroughly
- Mock API responses in component tests

## Deployment

### Vercel Deployment
This app is optimized for Vercel:
1. Connect GitHub repository to Vercel
2. Vercel auto-detects Next.js configuration
3. Environment variables (if needed) go in Vercel dashboard
4. Automatic deployments on push to main branch

### Environment Variables
Currently none required, but consider adding:
- `DATABASE_URL`: When migrating from file-based storage
- `API_SECRET_KEY`: For API authentication
- `CORS_ORIGIN`: For client app domain

## Performance Considerations

- Dungeon data is loaded in memory; consider pagination for large datasets
- Room connections create potential for complex graph traversal
- Validation runs on every POST/PUT; cache results when appropriate
- Client-side state management should be efficient for large dungeons

## Security Notes

- No authentication currently implemented
- All data is publicly accessible
- Consider adding:
  - API keys for client authentication
  - Rate limiting for API endpoints
  - Input sanitization (currently relies on TypeScript validation)
  - User accounts and permissions

## Troubleshooting

### Common Issues

**"Module not found" errors**
- Run `npm install` to ensure dependencies are installed
- Check TypeScript path aliases in `tsconfig.json`

**Validation failing unexpectedly**
- Check `DungeonValidator` error messages
- Verify reciprocal room connections
- Ensure unique coordinates
- Verify at least one entrance and one boss room

**Build errors**
- Run `npm run lint` to check for TypeScript errors
- Ensure all imports are correct
- Check for unused variables or imports

**API returning 500 errors**
- Check server console for error messages
- Verify JSON payload structure
- Test with a known-good dungeon from `public/data/dungeon-data.json`

## Documentation References

- **API_SCHEMA.md**: Complete data structure and validation documentation
- **README.md**: Setup instructions and feature overview
- **Next.js Docs**: https://nextjs.org/docs
- **TypeScript Docs**: https://www.typescriptlang.org/docs
- **React Docs**: https://react.dev

## Best Practices for AI Assistants

When working with this codebase:

1. **Always validate changes**: Run `DungeonValidator.validateDungeon()` after modifying dungeon structures
2. **Maintain type safety**: Use proper TypeScript types, don't use `any`
3. **Follow validation rules**: Adhere to the 10 critical validation rules
4. **Update documentation**: Keep `API_SCHEMA.md` in sync with code changes
5. **Test thoroughly**: Use the web UI to verify changes work end-to-end
6. **Preserve patterns**: Match existing code style and patterns
7. **Consider backwards compatibility**: Don't break existing API contracts
8. **Think about the game**: Changes should make sense for dungeon crawler gameplay

## Questions to Ask Users

When users request changes, consider asking:

- "Do you want this change to apply to the API, the UI, or both?"
- "Should this be validated server-side, client-side, or both?"
- "How should this interact with the client game application?"
- "Do you need this documented in API_SCHEMA.md?"
- "Should this change be backwards compatible?"
- "Do you have access to the client repository for testing integration?"

## Multi-Repository Development

If the user provides access to the client application repository:

1. **Understand the client architecture**: Review how it uses this API
2. **Coordinate changes**: Update API and client together for breaking changes
3. **Test integration**: Verify changes work in both repositories
4. **Share types**: Consider creating shared TypeScript definitions
5. **Document integration**: Update docs in both repositories
6. **Version carefully**: Tag releases in both repos for coordinated deploys

Remember: This API serves the client application. Always consider the impact on the game experience when making changes.
