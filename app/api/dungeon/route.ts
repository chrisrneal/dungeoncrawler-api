import { NextResponse } from 'next/server';

// Sample dungeon data
const dungeons = [
  {
    id: 1,
    name: 'The Dark Cavern',
    difficulty: 'Easy',
    levels: 5,
    description: 'A beginner-friendly dungeon with basic monsters'
  },
  {
    id: 2,
    name: 'Shadow Fortress',
    difficulty: 'Medium',
    levels: 10,
    description: 'A challenging fortress filled with shadow creatures'
  },
  {
    id: 3,
    name: 'Dragon\'s Lair',
    difficulty: 'Hard',
    levels: 15,
    description: 'The ultimate challenge - face the ancient dragon'
  }
];

export async function GET() {
  return NextResponse.json({ 
    dungeons,
    count: dungeons.length
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newDungeon = {
      id: dungeons.length + 1,
      ...body
    };
    
    return NextResponse.json({ 
      success: true,
      dungeon: newDungeon,
      message: 'Dungeon created successfully'
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ 
      success: false,
      message: 'Failed to create dungeon'
    }, { status: 400 });
  }
}
