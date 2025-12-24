import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { Dungeon, ApiEndpointConfig, ApiResponse } from '@/lib/api';

// Path to data files
const DUNGEON_DATA_PATH = join(process.cwd(), 'public', 'data', 'dungeon-data.json');
const CONFIG_FILE_PATH = join(process.cwd(), 'public', 'data', 'endpoint-config.json');

// Helper to load dungeons
async function loadDungeons(): Promise<Dungeon[]> {
  try {
    const fileContents = await readFile(DUNGEON_DATA_PATH, 'utf-8');
    const data = JSON.parse(fileContents);
    return data.dungeons || [];
  } catch (error) {
    console.error('Error loading dungeons:', error);
    return [];
  }
}

// Helper to load endpoint configurations
async function loadEndpoints(): Promise<ApiEndpointConfig[]> {
  try {
    const fileContents = await readFile(CONFIG_FILE_PATH, 'utf-8');
    const data = JSON.parse(fileContents);
    return data.endpoints || [];
  } catch (error) {
    console.error('Error loading endpoints:', error);
    return [];
  }
}

/**
 * GET /api/custom/[...path]
 * Serves dungeon data based on configured custom endpoints
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  try {
    // Await params as required by Next.js 15+
    const resolvedParams = await params;
    const pathSegments = resolvedParams.path || [];
    const fullPath = `/api/custom/${pathSegments.join('/')}`;
    
    // Load endpoint configurations
    const endpoints = await loadEndpoints();
    
    // Find matching endpoint configuration
    const endpointConfig = endpoints.find(e => e.path === fullPath && e.enabled);
    
    if (!endpointConfig) {
      return NextResponse.json<ApiResponse<null>>({ 
        success: false,
        error: 'Endpoint not found or not enabled'
      }, { status: 404 });
    }
    
    // Load dungeons
    const dungeons = await loadDungeons();
    
    // Find the dungeon associated with this endpoint
    const dungeon = dungeons.find(d => d.id === endpointConfig.dungeonId);
    
    if (!dungeon) {
      return NextResponse.json<ApiResponse<null>>({ 
        success: false,
        error: 'Dungeon not found for this endpoint'
      }, { status: 404 });
    }
    
    // Return the dungeon data
    return NextResponse.json<ApiResponse<Dungeon>>({ 
      success: true,
      data: dungeon
    });
  } catch (error) {
    console.error('Error serving custom endpoint:', error);
    return NextResponse.json<ApiResponse<null>>({ 
      success: false,
      error: 'Failed to serve endpoint'
    }, { status: 500 });
  }
}
