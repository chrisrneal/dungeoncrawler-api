import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { ApiEndpointConfig, ApiResponse } from '@/lib/api';

// Path to endpoint config file
const CONFIG_FILE_PATH = join(process.cwd(), 'public', 'data', 'endpoint-config.json');

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

// Helper to save endpoint configurations
async function saveEndpoints(endpoints: ApiEndpointConfig[]): Promise<void> {
  try {
    const data = { endpoints };
    await writeFile(CONFIG_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving endpoints:', error);
    throw new Error('Failed to save endpoints');
  }
}

/**
 * GET /api/endpoints
 * Returns all endpoint configurations or a specific one by ID
 * Query params: ?id=<endpointId> for specific endpoint
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const endpointId = searchParams.get('id');
    
    const endpoints = await loadEndpoints();
    
    if (endpointId) {
      // Return specific endpoint
      const endpoint = endpoints.find(e => e.id === endpointId);
      if (!endpoint) {
        return NextResponse.json<ApiResponse<null>>({ 
          success: false,
          error: 'Endpoint configuration not found'
        }, { status: 404 });
      }
      return NextResponse.json<ApiResponse<ApiEndpointConfig>>({ 
        success: true,
        data: endpoint
      });
    }
    
    // Return all endpoints
    return NextResponse.json<ApiResponse<ApiEndpointConfig[]>>({ 
      success: true,
      data: endpoints
    });
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>({ 
      success: false,
      error: 'Failed to load endpoint configurations'
    }, { status: 500 });
  }
}

/**
 * POST /api/endpoints
 * Creates a new endpoint configuration
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const endpoint: ApiEndpointConfig = {
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Basic validation
    if (!endpoint.id || !endpoint.name || !endpoint.path || !endpoint.dungeonId) {
      return NextResponse.json<ApiResponse<null>>({ 
        success: false,
        error: 'Missing required fields: id, name, path, and dungeonId are required'
      }, { status: 400 });
    }
    
    // Validate path format
    if (!endpoint.path.startsWith('/api/')) {
      return NextResponse.json<ApiResponse<null>>({ 
        success: false,
        error: 'Path must start with /api/'
      }, { status: 400 });
    }
    
    // Load existing endpoints and check for duplicates
    const endpoints = await loadEndpoints();
    if (endpoints.find(e => e.id === endpoint.id)) {
      return NextResponse.json<ApiResponse<null>>({ 
        success: false,
        error: 'Endpoint with this ID already exists'
      }, { status: 400 });
    }
    
    if (endpoints.find(e => e.path === endpoint.path)) {
      return NextResponse.json<ApiResponse<null>>({ 
        success: false,
        error: 'Endpoint with this path already exists'
      }, { status: 400 });
    }
    
    endpoints.push(endpoint);
    await saveEndpoints(endpoints);
    
    return NextResponse.json<ApiResponse<ApiEndpointConfig>>({ 
      success: true,
      data: endpoint
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>({ 
      success: false,
      error: 'Failed to create endpoint configuration'
    }, { status: 400 });
  }
}

/**
 * PUT /api/endpoints
 * Updates an existing endpoint configuration
 * Query params: ?id=<endpointId>
 */
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const endpointId = searchParams.get('id');
    
    if (!endpointId) {
      return NextResponse.json<ApiResponse<null>>({ 
        success: false,
        error: 'Endpoint ID is required'
      }, { status: 400 });
    }
    
    const body = await request.json();
    const updatedEndpoint: ApiEndpointConfig = {
      ...body,
      id: endpointId,
      updatedAt: new Date().toISOString()
    };
    
    // Basic validation
    if (!updatedEndpoint.name || !updatedEndpoint.path || !updatedEndpoint.dungeonId) {
      return NextResponse.json<ApiResponse<null>>({ 
        success: false,
        error: 'Missing required fields: name, path, and dungeonId are required'
      }, { status: 400 });
    }
    
    // Validate path format
    if (!updatedEndpoint.path.startsWith('/api/')) {
      return NextResponse.json<ApiResponse<null>>({ 
        success: false,
        error: 'Path must start with /api/'
      }, { status: 400 });
    }
    
    // Load endpoints and update
    const endpoints = await loadEndpoints();
    const index = endpoints.findIndex(e => e.id === endpointId);
    
    if (index === -1) {
      return NextResponse.json<ApiResponse<null>>({ 
        success: false,
        error: 'Endpoint configuration not found'
      }, { status: 404 });
    }
    
    // Check for path conflicts with other endpoints
    const pathConflict = endpoints.find(e => e.path === updatedEndpoint.path && e.id !== endpointId);
    if (pathConflict) {
      return NextResponse.json<ApiResponse<null>>({ 
        success: false,
        error: 'Another endpoint with this path already exists'
      }, { status: 400 });
    }
    
    endpoints[index] = updatedEndpoint;
    await saveEndpoints(endpoints);
    
    return NextResponse.json<ApiResponse<ApiEndpointConfig>>({ 
      success: true,
      data: updatedEndpoint
    });
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>({ 
      success: false,
      error: 'Failed to update endpoint configuration'
    }, { status: 400 });
  }
}

/**
 * DELETE /api/endpoints
 * Deletes an endpoint configuration
 * Query params: ?id=<endpointId>
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const endpointId = searchParams.get('id');
    
    if (!endpointId) {
      return NextResponse.json<ApiResponse<null>>({ 
        success: false,
        error: 'Endpoint ID is required'
      }, { status: 400 });
    }
    
    // Load endpoints and filter out the one to delete
    const endpoints = await loadEndpoints();
    const filtered = endpoints.filter(e => e.id !== endpointId);
    
    if (filtered.length === endpoints.length) {
      return NextResponse.json<ApiResponse<null>>({ 
        success: false,
        error: 'Endpoint configuration not found'
      }, { status: 404 });
    }
    
    await saveEndpoints(filtered);
    
    return NextResponse.json<ApiResponse<{ id: string }>>({ 
      success: true,
      data: { id: endpointId }
    });
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>({ 
      success: false,
      error: 'Failed to delete endpoint configuration'
    }, { status: 400 });
  }
}
