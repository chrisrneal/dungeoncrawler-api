import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { Dungeon, DungeonValidator, ApiResponse } from '@/lib/api';

// Path to dungeon data file
const DATA_FILE_PATH = join(process.cwd(), 'public', 'data', 'dungeon-data.json');

// Helper to load dungeons from file
async function loadDungeons(): Promise<Dungeon[]> {
  try {
    const fileContents = await readFile(DATA_FILE_PATH, 'utf-8');
    const data = JSON.parse(fileContents);
    return data.dungeons || [];
  } catch (error) {
    console.error('Error loading dungeons:', error);
    return [];
  }
}

// Helper to save dungeons to file
async function saveDungeons(dungeons: Dungeon[]): Promise<void> {
  try {
    const data = { dungeons };
    await writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving dungeons:', error);
    throw new Error('Failed to save dungeons');
  }
}

/**
 * GET /api/dungeon
 * Returns all dungeons or a specific dungeon by ID
 * Query params: ?id=<dungeonId> for specific dungeon
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dungeonId = searchParams.get('id');
    
    const dungeons = await loadDungeons();
    
    if (dungeonId) {
      // Return specific dungeon
      const dungeon = dungeons.find(d => d.id === dungeonId);
      if (!dungeon) {
        return NextResponse.json<ApiResponse<null>>({ 
          success: false,
          error: 'Dungeon not found'
        }, { status: 404 });
      }
      return NextResponse.json<ApiResponse<Dungeon>>({ 
        success: true,
        data: dungeon
      });
    }
    
    // Return all dungeons
    return NextResponse.json<ApiResponse<Dungeon[]>>({ 
      success: true,
      data: dungeons
    });
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>({ 
      success: false,
      error: 'Failed to load dungeons'
    }, { status: 500 });
  }
}

/**
 * POST /api/dungeon
 * Creates a new dungeon with validation
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dungeon: Dungeon = {
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Validate dungeon
    const validation = DungeonValidator.validateDungeon(dungeon);
    if (!validation.valid) {
      return NextResponse.json<ApiResponse<null>>({ 
        success: false,
        error: 'Validation failed',
        errors: validation.errors
      }, { status: 400 });
    }
    
    // Load existing dungeons and add new one
    const dungeons = await loadDungeons();
    dungeons.push(dungeon);
    await saveDungeons(dungeons);
    
    return NextResponse.json<ApiResponse<Dungeon>>({ 
      success: true,
      data: dungeon
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>({ 
      success: false,
      error: 'Failed to create dungeon'
    }, { status: 400 });
  }
}

/**
 * PUT /api/dungeon
 * Updates an existing dungeon
 * Query params: ?id=<dungeonId>
 */
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dungeonId = searchParams.get('id');
    
    if (!dungeonId) {
      return NextResponse.json<ApiResponse<null>>({ 
        success: false,
        error: 'Dungeon ID is required'
      }, { status: 400 });
    }
    
    const body = await request.json();
    const updatedDungeon: Dungeon = {
      ...body,
      id: dungeonId,
      updatedAt: new Date().toISOString()
    };
    
    // Validate dungeon
    const validation = DungeonValidator.validateDungeon(updatedDungeon);
    if (!validation.valid) {
      return NextResponse.json<ApiResponse<null>>({ 
        success: false,
        error: 'Validation failed',
        errors: validation.errors
      }, { status: 400 });
    }
    
    // Load dungeons and update
    const dungeons = await loadDungeons();
    const index = dungeons.findIndex(d => d.id === dungeonId);
    
    if (index === -1) {
      return NextResponse.json<ApiResponse<null>>({ 
        success: false,
        error: 'Dungeon not found'
      }, { status: 404 });
    }
    
    dungeons[index] = updatedDungeon;
    await saveDungeons(dungeons);
    
    return NextResponse.json<ApiResponse<Dungeon>>({ 
      success: true,
      data: updatedDungeon
    });
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>({ 
      success: false,
      error: 'Failed to update dungeon'
    }, { status: 400 });
  }
}

/**
 * DELETE /api/dungeon
 * Deletes a dungeon
 * Query params: ?id=<dungeonId>
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dungeonId = searchParams.get('id');
    
    if (!dungeonId) {
      return NextResponse.json<ApiResponse<null>>({ 
        success: false,
        error: 'Dungeon ID is required'
      }, { status: 400 });
    }
    
    // Load dungeons and filter out the one to delete
    const dungeons = await loadDungeons();
    const filtered = dungeons.filter(d => d.id !== dungeonId);
    
    if (filtered.length === dungeons.length) {
      return NextResponse.json<ApiResponse<null>>({ 
        success: false,
        error: 'Dungeon not found'
      }, { status: 404 });
    }
    
    await saveDungeons(filtered);
    
    return NextResponse.json<ApiResponse<{ id: string }>>({ 
      success: true,
      data: { id: dungeonId }
    });
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>({ 
      success: false,
      error: 'Failed to delete dungeon'
    }, { status: 400 });
  }
}
