'use client';

import { Room, RoomType } from '@/lib/api';

interface DungeonMapProps {
  rooms: Room[];
  onRoomClick?: (room: Room) => void;
  selectedRoomId?: string;
  gridSize?: { width: number; height: number };
}

const ROOM_TYPE_COLORS: Record<RoomType, string> = {
  entrance: '#4ade80',    // green
  boss: '#ef4444',        // red
  treasure: '#fbbf24',    // yellow
  puzzle: '#a78bfa',      // purple
  combat: '#f97316',      // orange
  rest: '#60a5fa',        // blue
  trap: '#dc2626',        // dark red
  empty: '#9ca3af'        // gray
};

const ROOM_TYPE_SYMBOLS: Record<RoomType, string> = {
  entrance: '🚪',
  boss: '👹',
  treasure: '💰',
  puzzle: '🧩',
  combat: '⚔️',
  rest: '🛏️',
  trap: '⚠️',
  empty: '·'
};

export default function DungeonMap({ rooms, onRoomClick, selectedRoomId, gridSize }: DungeonMapProps) {
  if (!rooms || rooms.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        No rooms to display. Add rooms to see the dungeon map.
      </div>
    );
  }

  // Calculate bounds
  const minX = Math.min(...rooms.map(r => r.coordinates.x));
  const maxX = Math.max(...rooms.map(r => r.coordinates.x));
  const minY = Math.min(...rooms.map(r => r.coordinates.y));
  const maxY = Math.max(...rooms.map(r => r.coordinates.y));

  const width = maxX - minX + 1;
  const height = maxY - minY + 1;

  // Cell size in pixels
  const cellSize = 80;
  const connectionWidth = 4;

  return (
    <div style={{ 
      padding: '20px',
      overflowX: 'auto',
      backgroundColor: '#1a1a1a',
      borderRadius: '8px'
    }}>
      <div style={{
        position: 'relative',
        width: `${width * cellSize}px`,
        height: `${height * cellSize}px`,
        margin: '0 auto'
      }}>
        {/* Render connections first (so they appear behind rooms) */}
        {rooms.map(room => {
          const x = (room.coordinates.x - minX) * cellSize + cellSize / 2;
          const y = (room.coordinates.y - minY) * cellSize + cellSize / 2;

          return room.connections.map((conn, idx) => {
            const targetRoom = rooms.find(r => r.id === conn.targetRoomId);
            if (!targetRoom) return null;

            const targetX = (targetRoom.coordinates.x - minX) * cellSize + cellSize / 2;
            const targetY = (targetRoom.coordinates.y - minY) * cellSize + cellSize / 2;

            // Calculate line angle and length
            const dx = targetX - x;
            const dy = targetY - y;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;

            return (
              <div
                key={`${room.id}-${conn.targetRoomId}-${idx}`}
                style={{
                  position: 'absolute',
                  left: `${x}px`,
                  top: `${y}px`,
                  width: `${length}px`,
                  height: `${connectionWidth}px`,
                  backgroundColor: conn.locked ? '#dc2626' : (conn.hidden ? '#4b5563' : '#6b7280'),
                  transformOrigin: '0 50%',
                  transform: `rotate(${angle}deg)`,
                  opacity: 0.5,
                  pointerEvents: 'none'
                }}
              />
            );
          });
        })}

        {/* Render rooms */}
        {rooms.map(room => {
          const x = (room.coordinates.x - minX) * cellSize;
          const y = (room.coordinates.y - minY) * cellSize;
          const isSelected = selectedRoomId === room.id;

          return (
            <div
              key={room.id}
              onClick={() => onRoomClick?.(room)}
              style={{
                position: 'absolute',
                left: `${x + 10}px`,
                top: `${y + 10}px`,
                width: `${cellSize - 20}px`,
                height: `${cellSize - 20}px`,
                backgroundColor: ROOM_TYPE_COLORS[room.type],
                border: isSelected ? '3px solid white' : '2px solid #374151',
                borderRadius: '8px',
                cursor: onRoomClick ? 'pointer' : 'default',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                boxShadow: isSelected ? '0 0 20px rgba(255,255,255,0.5)' : '0 2px 8px rgba(0,0,0,0.3)',
                opacity: room.visited ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.zIndex = '10';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.zIndex = '1';
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '4px' }}>
                {ROOM_TYPE_SYMBOLS[room.type]}
              </div>
              <div style={{ 
                fontSize: '10px', 
                color: '#1f2937',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '0 4px'
              }}>
                {room.type}
              </div>
              {room.monsters && room.monsters.length > 0 && (
                <div style={{ 
                  fontSize: '8px', 
                  color: '#7f1d1d',
                  fontWeight: 'bold'
                }}>
                  {room.monsters.length} 👾
                </div>
              )}
            </div>
          );
        })}

        {/* Coordinate labels */}
        {Array.from({ length: width }, (_, i) => (
          <div
            key={`x-${i}`}
            style={{
              position: 'absolute',
              left: `${i * cellSize + cellSize / 2 - 10}px`,
              top: '-25px',
              color: '#9ca3af',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            {minX + i}
          </div>
        ))}
        {Array.from({ length: height }, (_, i) => (
          <div
            key={`y-${i}`}
            style={{
              position: 'absolute',
              left: '-25px',
              top: `${i * cellSize + cellSize / 2 - 8}px`,
              color: '#9ca3af',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            {minY + i}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ 
        marginTop: '30px', 
        padding: '15px',
        backgroundColor: '#2d2d2d',
        borderRadius: '8px'
      }}>
        <div style={{ 
          color: '#e5e7eb',
          fontWeight: 'bold',
          marginBottom: '10px',
          fontSize: '14px'
        }}>
          Legend
        </div>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '8px'
        }}>
          {Object.entries(ROOM_TYPE_COLORS).map(([type, color]) => (
            <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                width: '20px',
                height: '20px',
                backgroundColor: color,
                borderRadius: '4px',
                border: '1px solid #374151'
              }} />
              <span style={{ 
                color: '#d1d5db',
                fontSize: '12px',
                textTransform: 'capitalize'
              }}>
                {ROOM_TYPE_SYMBOLS[type as RoomType]} {type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
