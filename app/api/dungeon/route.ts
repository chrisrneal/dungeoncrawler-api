import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { Dungeon, DungeonValidator, ApiResponse } from '@/lib/api';
import { SupabaseDatabase } from '@/lib/supabase';

// Storage mode from environment
const STORAGE_MODE = process.env.STORAGE_MODE || 'supabase';

// Path to dungeon data file (for file storage mode)
const DATA_FILE_PATH = join(process.cwd(), 'public', 'data', 'dungeon-data.json');

// ============================================================================
// Storage Abstraction Layer
// ============================================================================

interface StorageAdapter {
  getAllDungeons(): Promise<Dungeon[]>;
  getDungeonById(id: string): Promise<Dungeon | null>;
  createDungeon(dungeon: Dungeon): Promise<Dungeon>;
  updateDungeon(id: string, dungeon: Dungeon): Promise<Dungeon>;
  deleteDungeon(id: string): Promise<void>;
}

/**
 * File-based storage adapter (legacy)
 */
class FileStorageAdapter implements StorageAdapter {
  async getAllDungeons(): Promise<Dungeon[]> {
    try {
      const fileContents = await readFile(DATA_FILE_PATH, 'utf-8');
      const data = JSON.parse(fileContents);
      return data.dungeons || [];
    } catch (error) {
      console.error('Error loading dungeons:', error);
      return [];
    }
  }

  async getDungeonById(id: string): Promise<Dungeon | null> {
    const dungeons = await this.getAllDungeons();
    return dungeons.find(d => d.id === id) || null;
  }

  async createDungeon(dungeon: Dungeon): Promise<Dungeon> {
    const dungeons = await this.getAllDungeons();
    dungeons.push(dungeon);
    await this.saveDungeons(dungeons);
    return dungeon;
  }

  async updateDungeon(id: string, dungeon: Dungeon): Promise<Dungeon> {
    const dungeons = await this.getAllDungeons();
    const index = dungeons.findIndex(d => d.id === id);
    
    if (index === -1) {
      throw new Error('Dungeon not found');
    }
    
    dungeons[index] = dungeon;
    await this.saveDungeons(dungeons);
    return dungeon;
  }

  async deleteDungeon(id: string): Promise<void> {
    const dungeons = await this.getAllDungeons();
    const filtered = dungeons.filter(d => d.id !== id);
    
    if (filtered.length === dungeons.length) {
      throw new Error('Dungeon not found');
    }
    
    await this.saveDungeons(filtered);
  }

  private async saveDungeons(dungeons: Dungeon[]): Promise<void> {
    try {
      const data = { dungeons };
      await writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving dungeons:', error);
      throw new Error('Failed to save dungeons');
    }
  }
}

/**
 * Supabase storage adapter
 */
class SupabaseStorageAdapter implements StorageAdapter {
  private db: SupabaseDatabase;

  constructor() {
    this.db = new SupabaseDatabase();
  }

  async getAllDungeons(): Promise<Dungeon[]> {
    return await this.db.getAllDungeons();
  }

  async getDungeonById(id: string): Promise<Dungeon | null> {
    return await this.db.getDungeonById(id);
  }

  async createDungeon(dungeon: Dungeon): Promise<Dungeon> {
    return await this.db.createDungeon(dungeon);
  }

  async updateDungeon(id: string, dungeon: Dungeon): Promise<Dungeon> {
    return await this.db.updateDungeon(id, dungeon);
  }

  async deleteDungeon(id: string): Promise<void> {
    await this.db.deleteDungeon(id);
  }
}

/**
 * Get the appropriate storage adapter based on environment configuration
 */
function getStorageAdapter(): StorageAdapter {
  if (STORAGE_MODE === 'file') {
    console.log('Using file-based storage');
    return new FileStorageAdapter();
  }
  
  // Try to use Supabase, but fall back to file storage if env vars not set
  try {
    console.log('Attempting to use Supabase storage');
    return new SupabaseStorageAdapter();
  } catch (error) {
    console.warn('Supabase not configured, falling back to file storage:', error);
    console.warn('To use Supabase, set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    return new FileStorageAdapter();
  }
}

// Initialize storage adapter
let storage: StorageAdapter;
try {
  storage = getStorageAdapter();
} catch (error) {
  console.error('Failed to initialize storage adapter:', error);
  // Fallback to file storage
  storage = new FileStorageAdapter();
}

/**
 * GET /api/dungeon
 * Returns all dungeons or a specific dungeon by ID
 * Query params: 
 *   ?id=<dungeonId> for specific dungeon
 *   ?floor=<floorNumber> to get rooms for a specific floor (requires id)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dungeonId = searchParams.get('id');
    const floorNumber = searchParams.get('floor');
    
    if (dungeonId) {
      // Return specific dungeon
      const dungeon = await storage.getDungeonById(dungeonId);
      if (!dungeon) {
        return NextResponse.json<ApiResponse<null>>({ 
          success: false,
          error: 'Dungeon not found'
        }, { status: 404 });
      }
      
      // If floor number is specified, return only that floor's data
      if (floorNumber) {
        const floor = parseInt(floorNumber);
        if (dungeon.floors && dungeon.floors.length > 0) {
          const dungeonFloor = dungeon.floors.find(f => f.floorNumber === floor);
          if (!dungeonFloor) {
            return NextResponse.json<ApiResponse<null>>({ 
              success: false,
              error: `Floor ${floor} not found`
            }, { status: 404 });
          }
          return NextResponse.json<ApiResponse<any>>({ 
            success: true,
            data: dungeonFloor
          });
        } else {
          // Legacy format: return all rooms if floor is 1
          if (floor === 1) {
            return NextResponse.json<ApiResponse<any>>({ 
              success: true,
              data: {
                floorNumber: 1,
                name: 'Ground Floor',
                description: '',
                rooms: dungeon.rooms || []
              }
            });
          } else {
            return NextResponse.json<ApiResponse<null>>({ 
              success: false,
              error: 'This dungeon does not have multiple floors'
            }, { status: 404 });
          }
        }
      }
      
      return NextResponse.json<ApiResponse<Dungeon>>({ 
        success: true,
        data: dungeon
      });
    }
    
    // Return all dungeons
    const dungeons = await storage.getAllDungeons();
    return NextResponse.json<ApiResponse<Dungeon[]>>({ 
      success: true,
      data: dungeons
    });
  } catch (error) {
    console.error('GET /api/dungeon error:', error);
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
    
    // Create dungeon using storage adapter
    const createdDungeon = await storage.createDungeon(dungeon);
    
    return NextResponse.json<ApiResponse<Dungeon>>({ 
      success: true,
      data: createdDungeon
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/dungeon error:', error);
    return NextResponse.json<ApiResponse<null>>({ 
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create dungeon'
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
    
    // Update dungeon using storage adapter
    const result = await storage.updateDungeon(dungeonId, updatedDungeon);
    
    return NextResponse.json<ApiResponse<Dungeon>>({ 
      success: true,
      data: result
    });
  } catch (error) {
    console.error('PUT /api/dungeon error:', error);
    const statusCode = error instanceof Error && error.message === 'Dungeon not found' ? 404 : 400;
    return NextResponse.json<ApiResponse<null>>({ 
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update dungeon'
    }, { status: statusCode });
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
    
    // Delete dungeon using storage adapter
    await storage.deleteDungeon(dungeonId);
    
    return NextResponse.json<ApiResponse<{ id: string }>>({ 
      success: true,
      data: { id: dungeonId }
    });
  } catch (error) {
    console.error('DELETE /api/dungeon error:', error);
    const statusCode = error instanceof Error && error.message === 'Dungeon not found' ? 404 : 400;
    return NextResponse.json<ApiResponse<null>>({ 
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete dungeon'
    }, { status: statusCode });
  }
}
