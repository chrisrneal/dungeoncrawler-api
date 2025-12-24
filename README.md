# Dungeon Crawler API

A Next.js application for managing dungeon crawler games, providing both web pages and RESTful API endpoints.

## Features

- 🚀 Built with Next.js 16 and TypeScript
- 🎨 Server-side rendering and client components
- 📡 RESTful API endpoints
- 🔒 Type-safe with TypeScript
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
│   │       └── route.ts # GET/POST /api/dungeon
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page
│   └── globals.css      # Global styles
├── next.config.ts       # Next.js configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Project dependencies
```

## API Endpoints

### GET /api/hello

Returns a greeting message with timestamp.

**Response:**
```json
{
  "message": "Hello from Dungeon Crawler API!",
  "timestamp": "2025-12-24T02:57:44.029Z"
}
```

### GET /api/dungeon

Returns a list of available dungeons.

**Response:**
```json
{
  "dungeons": [
    {
      "id": 1,
      "name": "The Dark Cavern",
      "difficulty": "Easy",
      "levels": 5,
      "description": "A beginner-friendly dungeon with basic monsters"
    }
  ],
  "count": 3
}
```

### POST /api/dungeon

Creates a new dungeon entry.

**Request Body:**
```json
{
  "name": "New Dungeon",
  "difficulty": "Medium",
  "levels": 7,
  "description": "A mysterious dungeon"
}
```

**Response:**
```json
{
  "success": true,
  "dungeon": {
    "id": 4,
    "name": "New Dungeon",
    "difficulty": "Medium",
    "levels": 7,
    "description": "A mysterious dungeon"
  },
  "message": "Dungeon created successfully"
}
```

## Deploying to Vercel

This application is optimized for deployment on Vercel with zero configuration needed.

### Deploy with Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy via GitHub Integration

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com/new)
3. Vercel will automatically detect Next.js and configure the build settings
4. Click "Deploy"

Your application will be live with automatic HTTPS, global CDN, and continuous deployment on every push.

## Pages

- **/** - Home page with navigation
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

## License

ISC
