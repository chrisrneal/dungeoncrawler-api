'use client';

import { useState, useEffect } from 'react';
import { Dungeon, Room, Monster, DungeonHelpers, Direction, RoomType, DifficultyLevel, DungeonFloor } from '@/lib/api';
import DungeonMap from '@/app/components/DungeonMap';

export default function DungeonsPage() {
  const [dungeons, setDungeons] = useState<Dungeon[]>([]);
  const [selectedDungeon, setSelectedDungeon] = useState<Dungeon | null>(null);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [view, setView] = useState<'list' | 'edit' | 'room'>('list');
  const [currentFloor, setCurrentFloor] = useState<number>(1);
  const [showMap, setShowMap] = useState<boolean>(true);

  // Load dungeons on component mount
  useEffect(() => {
    loadDungeons();
  }, []);

  const loadDungeons = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dungeon');
      const result = await response.json();
      if (result.success) {
        setDungeons(result.data || []);
      } else {
        setError(result.error || 'Failed to load dungeons');
      }
    } catch (err) {
      setError('Failed to load dungeons');
    } finally {
      setLoading(false);
    }
  };

  const createNewDungeon = () => {
    const newDungeon = DungeonHelpers.createEmptyDungeon('New Dungeon');
    setSelectedDungeon(newDungeon);
    setView('edit');
  };

  const saveDungeon = async () => {
    if (!selectedDungeon) return;

    try {
      setLoading(true);
      setValidationErrors([]);
      
      const isNew = !dungeons.find(d => d.id === selectedDungeon.id);
      const method = isNew ? 'POST' : 'PUT';
      const url = isNew ? '/api/dungeon' : `/api/dungeon?id=${selectedDungeon.id}`;
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedDungeon)
      });
      
      const result = await response.json();
      
      if (result.success) {
        await loadDungeons();
        setSelectedDungeon(null);
        setView('list');
        setError('');
      } else {
        if (result.errors) {
          setValidationErrors(result.errors.map((e: any) => `${e.field}: ${e.message}`));
        } else {
          setError(result.error || 'Failed to save dungeon');
        }
      }
    } catch (err) {
      setError('Failed to save dungeon');
    } finally {
      setLoading(false);
    }
  };

  const deleteDungeon = async (dungeonId: string) => {
    if (!confirm('Are you sure you want to delete this dungeon?')) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/dungeon?id=${dungeonId}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        await loadDungeons();
        setError('');
      } else {
        setError(result.error || 'Failed to delete dungeon');
      }
    } catch (err) {
      setError('Failed to delete dungeon');
    } finally {
      setLoading(false);
    }
  };

  const exportDungeon = (dungeon: Dungeon) => {
    const dataStr = JSON.stringify({ dungeons: [dungeon] }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${dungeon.name.replace(/\s+/g, '_')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importDungeon = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        // Try to detect and convert legacy format
        let importedDungeons: Dungeon[] = [];
        
        // Check if it's legacy format (has numeric room IDs and different structure)
        if (data.dungeons && Array.isArray(data.dungeons)) {
          const firstDungeon = data.dungeons[0];
          const firstRoom = firstDungeon?.rooms?.[0];
          
          // Detect legacy format by checking for numeric room ID and x/y coordinates
          if (firstRoom && typeof firstRoom.id === 'number' && 
              'x' in firstRoom && 'y' in firstRoom) {
            // Convert legacy format
            importedDungeons = DungeonHelpers.convertLegacyFormat(data);
            if (importedDungeons.length > 0) {
              setError('');
              setSelectedDungeon(importedDungeons[0]);
              setView('edit');
              return;
            }
          } else {
            // Current format
            importedDungeons = data.dungeons;
          }
        } else if (data.id || data.name) {
          // Single dungeon
          importedDungeons = [data];
        }
        
        if (importedDungeons.length > 0) {
          // Process first dungeon only - open it for editing
          // Note: If file contains multiple dungeons, only the first one is loaded
          const dungeon = importedDungeons[0];
          if (!dungeon.id || typeof dungeon.id === 'number') {
            dungeon.id = DungeonHelpers.generateId();
          }
          setSelectedDungeon(dungeon);
          setView('edit');
          setError('');
          
          // Notify user if multiple dungeons were in the file
          if (importedDungeons.length > 1) {
            console.warn(`File contained ${importedDungeons.length} dungeons. Only the first one was imported.`);
          }
        } else {
          setError('No valid dungeons found in file.');
        }
      } catch (err) {
        setError('Failed to import dungeon. Invalid JSON format.');
      }
    };
    input.click();
  };

  const addRoom = () => {
    if (!selectedDungeon) return;
    
    // Find a free coordinate position
    const currentRooms = getCurrentFloorRooms();
    let x = 0, y = 0;
    let found = false;
    
    // Try to find an unoccupied coordinate
    for (let tryY = 0; tryY < selectedDungeon.size.height && !found; tryY++) {
      for (let tryX = 0; tryX < selectedDungeon.size.width && !found; tryX++) {
        const occupied = currentRooms.some(r => 
          r.coordinates.x === tryX && r.coordinates.y === tryY
        );
        if (!occupied) {
          x = tryX;
          y = tryY;
          found = true;
        }
      }
    }
    
    const newRoom = DungeonHelpers.createRoom('empty', { x, y, z: currentFloor }, '');
    setEditingRoom(newRoom);
    setView('room');
  };

  const saveRoom = () => {
    if (!editingRoom || !selectedDungeon) return;
    
    // Ensure room has z-coordinate matching current floor
    if (!editingRoom.coordinates.z) {
      editingRoom.coordinates.z = currentFloor;
    }
    
    // Handle multi-floor or legacy structure
    if (selectedDungeon.floors && selectedDungeon.floors.length > 0) {
      // Multi-floor structure
      const floor = selectedDungeon.floors.find(f => f.floorNumber === currentFloor);
      if (floor) {
        const existingIndex = floor.rooms.findIndex(r => r.id === editingRoom.id);
        if (existingIndex >= 0) {
          floor.rooms[existingIndex] = editingRoom;
        } else {
          floor.rooms.push(editingRoom);
        }
      }
    } else {
      // Legacy structure
      const existingIndex = selectedDungeon.rooms.findIndex(r => r.id === editingRoom.id);
      if (existingIndex >= 0) {
        selectedDungeon.rooms[existingIndex] = editingRoom;
      } else {
        selectedDungeon.rooms.push(editingRoom);
      }
    }
    
    setSelectedDungeon({ ...selectedDungeon });
    setEditingRoom(null);
    setView('edit');
  };

  const deleteRoom = (roomId: string) => {
    if (!selectedDungeon) return;
    if (!confirm('Are you sure you want to delete this room?')) return;
    
    // Handle multi-floor or legacy structure
    if (selectedDungeon.floors && selectedDungeon.floors.length > 0) {
      const floor = selectedDungeon.floors.find(f => f.floorNumber === currentFloor);
      if (floor) {
        floor.rooms = floor.rooms.filter(r => r.id !== roomId);
      }
    } else {
      selectedDungeon.rooms = selectedDungeon.rooms.filter(r => r.id !== roomId);
    }
    
    setSelectedDungeon({ ...selectedDungeon });
  };

  const addFloor = () => {
    if (!selectedDungeon) return;
    
    // Convert to multi-floor if needed
    if (!selectedDungeon.floors || selectedDungeon.floors.length === 0) {
      selectedDungeon.floors = [{
        floorNumber: 1,
        name: 'Ground Floor',
        description: 'Main level',
        rooms: selectedDungeon.rooms || []
      }];
    }
    
    const newFloorNumber = selectedDungeon.floors.length + 1;
    const newFloor = DungeonHelpers.createEmptyFloor(newFloorNumber);
    selectedDungeon.floors.push(newFloor);
    selectedDungeon.size.depth = selectedDungeon.floors.length;
    
    setSelectedDungeon({ ...selectedDungeon });
    setCurrentFloor(newFloorNumber);
  };

  const deleteFloor = (floorNumber: number) => {
    if (!selectedDungeon || !selectedDungeon.floors || selectedDungeon.floors.length === 0) return;
    if (selectedDungeon.floors.length <= 1) {
      alert('Cannot delete the last floor');
      return;
    }
    if (!confirm(`Are you sure you want to delete floor ${floorNumber}?`)) return;
    
    selectedDungeon.floors = selectedDungeon.floors.filter(f => f.floorNumber !== floorNumber);
    selectedDungeon.size.depth = selectedDungeon.floors.length;
    
    // Adjust current floor if necessary
    if (currentFloor === floorNumber) {
      setCurrentFloor(1);
    }
    
    setSelectedDungeon({ ...selectedDungeon });
  };

  const getCurrentFloorRooms = (): Room[] => {
    if (!selectedDungeon) return [];
    
    if (selectedDungeon.floors && selectedDungeon.floors.length > 0) {
      const floor = selectedDungeon.floors.find(f => f.floorNumber === currentFloor);
      return floor?.rooms || [];
    }
    
    // Legacy: return all rooms
    return selectedDungeon.rooms || [];
  };

  // Render dungeon list view
  const renderList = () => (
    <div>
      <div className="header">
        <h1>Dungeon Management</h1>
        <div className="actions">
          <button onClick={createNewDungeon} className="btn-primary">
            Create New Dungeon
          </button>
          <button onClick={importDungeon} className="btn-secondary">
            Import Dungeon
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {loading ? (
        <div className="loading">Loading dungeons...</div>
      ) : (
        <div className="dungeon-grid">
          {dungeons.map(dungeon => (
            <div key={dungeon.id} className="dungeon-card">
              <h3>{dungeon.name}</h3>
              <p className="description">{dungeon.description}</p>
              <div className="meta">
                <span className={`badge ${dungeon.difficulty.toLowerCase()}`}>
                  {dungeon.difficulty}
                </span>
                <span>Level {dungeon.level}</span>
                <span>{DungeonHelpers.getAllRooms(dungeon).length} rooms</span>
                {dungeon.floors && dungeon.floors.length > 0 && (
                  <span>{dungeon.floors.length} floors</span>
                )}
              </div>
              <div className="card-actions">
                <button 
                  onClick={() => { setSelectedDungeon(dungeon); setView('edit'); }}
                  className="btn-small"
                >
                  Edit
                </button>
                <button 
                  onClick={() => exportDungeon(dungeon)}
                  className="btn-small"
                >
                  Export
                </button>
                <button 
                  onClick={() => deleteDungeon(dungeon.id)}
                  className="btn-small btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {dungeons.length === 0 && (
            <div className="empty-state">
              <p>No dungeons found. Create one to get started!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Render dungeon edit view
  const renderEdit = () => {
    if (!selectedDungeon) return null;

    return (
      <div>
        <div className="header">
          <h1>Edit Dungeon</h1>
          <div className="actions">
            <button onClick={() => setView('list')} className="btn-secondary">
              Cancel
            </button>
            <button onClick={saveDungeon} className="btn-primary">
              Save Dungeon
            </button>
          </div>
        </div>

        {error && <div className="error">{error}</div>}
        {validationErrors.length > 0 && (
          <div className="error">
            <strong>Validation Errors:</strong>
            <ul>
              {validationErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="form-section">
          <h2>Basic Information</h2>
          <div className="form-grid">
            <div className="form-field">
              <label>Name</label>
              <input
                type="text"
                value={selectedDungeon.name}
                onChange={e => setSelectedDungeon({ ...selectedDungeon, name: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label>Difficulty</label>
              <select
                value={selectedDungeon.difficulty}
                onChange={e => setSelectedDungeon({ ...selectedDungeon, difficulty: e.target.value as DifficultyLevel })}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
            <div className="form-field">
              <label>Level</label>
              <input
                type="number"
                value={selectedDungeon.level}
                onChange={e => setSelectedDungeon({ ...selectedDungeon, level: parseInt(e.target.value) || 1 })}
                min="1"
              />
            </div>
            <div className="form-field">
              <label>Width</label>
              <input
                type="number"
                value={selectedDungeon.size.width}
                onChange={e => setSelectedDungeon({ 
                  ...selectedDungeon, 
                  size: { ...selectedDungeon.size, width: parseInt(e.target.value) || 10 }
                })}
                min="1"
              />
            </div>
            <div className="form-field">
              <label>Height</label>
              <input
                type="number"
                value={selectedDungeon.size.height}
                onChange={e => setSelectedDungeon({ 
                  ...selectedDungeon, 
                  size: { ...selectedDungeon.size, height: parseInt(e.target.value) || 10 }
                })}
                min="1"
              />
            </div>
          </div>
          <div className="form-field">
            <label>Description</label>
            <textarea
              value={selectedDungeon.description}
              onChange={e => setSelectedDungeon({ ...selectedDungeon, description: e.target.value })}
              rows={4}
            />
          </div>
        </div>

        {/* Floor Management Section */}
        <div className="form-section">
          <div className="section-header">
            <h2>Floors</h2>
            <button onClick={addFloor} className="btn-small btn-primary">
              Add Floor
            </button>
          </div>
          
          {selectedDungeon.floors && selectedDungeon.floors.length > 0 ? (
            <div>
              <div className="floor-tabs">
                {selectedDungeon.floors.map(floor => (
                  <button
                    key={floor.floorNumber}
                    onClick={() => setCurrentFloor(floor.floorNumber)}
                    className={`floor-tab ${currentFloor === floor.floorNumber ? 'active' : ''}`}
                  >
                    Floor {floor.floorNumber}: {floor.name}
                    {selectedDungeon.floors!.length > 1 && (
                      <span 
                        onClick={(e) => { e.stopPropagation(); deleteFloor(floor.floorNumber); }}
                        className="delete-tab"
                        title="Delete floor"
                      >
                        ×
                      </span>
                    )}
                  </button>
                ))}
              </div>
              
              {selectedDungeon.floors.find(f => f.floorNumber === currentFloor) && (
                <div className="floor-info">
                  <div className="form-field">
                    <label>Floor Name</label>
                    <input
                      type="text"
                      value={selectedDungeon.floors.find(f => f.floorNumber === currentFloor)?.name || ''}
                      onChange={e => {
                        const floor = selectedDungeon.floors!.find(f => f.floorNumber === currentFloor);
                        if (floor) {
                          floor.name = e.target.value;
                          setSelectedDungeon({ ...selectedDungeon });
                        }
                      }}
                    />
                  </div>
                  <div className="form-field">
                    <label>Floor Description</label>
                    <textarea
                      value={selectedDungeon.floors.find(f => f.floorNumber === currentFloor)?.description || ''}
                      onChange={e => {
                        const floor = selectedDungeon.floors!.find(f => f.floorNumber === currentFloor);
                        if (floor) {
                          floor.description = e.target.value;
                          setSelectedDungeon({ ...selectedDungeon });
                        }
                      }}
                      rows={2}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="info-box">
              <p>This dungeon uses legacy single-floor format. Click "Add Floor" to enable multi-floor support.</p>
            </div>
          )}
        </div>

        {/* Map Visualization */}
        <div className="form-section">
          <div className="section-header">
            <h2>Dungeon Map</h2>
            <button onClick={() => setShowMap(!showMap)} className="btn-small btn-secondary">
              {showMap ? 'Hide Map' : 'Show Map'}
            </button>
          </div>
          
          {showMap && (
            <DungeonMap
              rooms={getCurrentFloorRooms()}
              onRoomClick={(room) => { setEditingRoom(room); setView('room'); }}
              selectedRoomId={editingRoom?.id}
              gridSize={selectedDungeon.size}
            />
          )}
        </div>

        <div className="form-section">
          <div className="section-header">
            <h2>Rooms ({getCurrentFloorRooms().length})</h2>
            <button onClick={addRoom} className="btn-small btn-primary">
              Add Room
            </button>
          </div>

          <div className="room-list">
            {getCurrentFloorRooms().map(room => (
              <div key={room.id} className="room-card">
                <div className="room-info">
                  <h4>
                    <span className={`badge ${room.type}`}>{room.type}</span>
                    Room at ({room.coordinates.x}, {room.coordinates.y})
                  </h4>
                  <p>{room.description}</p>
                  <div className="room-meta">
                    <span>{room.connections.length} connections</span>
                    {room.monsters && <span>{room.monsters.length} monsters</span>}
                    {room.puzzle && <span>Has puzzle</span>}
                    {room.secrets && <span>{room.secrets.length} secrets</span>}
                  </div>
                </div>
                <div className="room-actions">
                  <button 
                    onClick={() => { setEditingRoom(room); setView('room'); }}
                    className="btn-small"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => deleteRoom(room.id)}
                    className="btn-small btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {selectedDungeon.rooms.length === 0 && (
              <div className="empty-state">
                <p>No rooms yet. Add an entrance room and a boss room to get started!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render room edit view
  const renderRoomEdit = () => {
    if (!editingRoom || !selectedDungeon) return null;

    const addMonster = () => {
      const newMonster: Monster = {
        id: DungeonHelpers.generateId(),
        name: 'New Monster',
        type: 'enemy',
        stats: { health: 50, attack: 10, defense: 5, speed: 10 },
        level: selectedDungeon.level
      };
      setEditingRoom({
        ...editingRoom,
        monsters: [...(editingRoom.monsters || []), newMonster]
      });
    };

    const deleteMonster = (monsterId: string) => {
      setEditingRoom({
        ...editingRoom,
        monsters: (editingRoom.monsters || []).filter(m => m.id !== monsterId)
      });
    };

    const updateMonster = (monsterId: string, updates: Partial<Monster>) => {
      setEditingRoom({
        ...editingRoom,
        monsters: (editingRoom.monsters || []).map(m => 
          m.id === monsterId ? { ...m, ...updates } : m
        )
      });
    };

    return (
      <div>
        <div className="header">
          <h1>Edit Room</h1>
          <div className="actions">
            <button onClick={() => { setEditingRoom(null); setView('edit'); }} className="btn-secondary">
              Cancel
            </button>
            <button onClick={saveRoom} className="btn-primary">
              Save Room
            </button>
          </div>
        </div>

        <div className="form-section">
          <h2>Room Details</h2>
          <div className="form-grid">
            <div className="form-field">
              <label>Type</label>
              <select
                value={editingRoom.type}
                onChange={e => setEditingRoom({ ...editingRoom, type: e.target.value as RoomType })}
              >
                <option value="entrance">Entrance</option>
                <option value="boss">Boss</option>
                <option value="treasure">Treasure</option>
                <option value="puzzle">Puzzle</option>
                <option value="combat">Combat</option>
                <option value="rest">Rest</option>
                <option value="trap">Trap</option>
                <option value="empty">Empty</option>
              </select>
            </div>
            <div className="form-field">
              <label>X Coordinate</label>
              <input
                type="number"
                value={editingRoom.coordinates.x}
                onChange={e => setEditingRoom({
                  ...editingRoom,
                  coordinates: { ...editingRoom.coordinates, x: parseInt(e.target.value) || 0 }
                })}
              />
            </div>
            <div className="form-field">
              <label>Y Coordinate</label>
              <input
                type="number"
                value={editingRoom.coordinates.y}
                onChange={e => setEditingRoom({
                  ...editingRoom,
                  coordinates: { ...editingRoom.coordinates, y: parseInt(e.target.value) || 0 }
                })}
              />
            </div>
          </div>
          <div className="form-field">
            <label>Description</label>
            <textarea
              value={editingRoom.description}
              onChange={e => setEditingRoom({ ...editingRoom, description: e.target.value })}
              rows={3}
            />
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h2>Monsters</h2>
            <button onClick={addMonster} className="btn-small btn-primary">
              Add Monster
            </button>
          </div>
          {(editingRoom.monsters || []).map(monster => (
            <div key={monster.id} className="monster-card">
              <div className="form-grid">
                <div className="form-field">
                  <label>Name</label>
                  <input
                    type="text"
                    value={monster.name}
                    onChange={e => updateMonster(monster.id, { name: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Type</label>
                  <input
                    type="text"
                    value={monster.type}
                    onChange={e => updateMonster(monster.id, { type: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Level</label>
                  <input
                    type="number"
                    value={monster.level}
                    onChange={e => updateMonster(monster.id, { level: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="form-field">
                  <label>Health</label>
                  <input
                    type="number"
                    value={monster.stats.health}
                    onChange={e => updateMonster(monster.id, { 
                      stats: { ...monster.stats, health: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
                <div className="form-field">
                  <label>Attack</label>
                  <input
                    type="number"
                    value={monster.stats.attack}
                    onChange={e => updateMonster(monster.id, { 
                      stats: { ...monster.stats, attack: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
                <div className="form-field">
                  <label>Defense</label>
                  <input
                    type="number"
                    value={monster.stats.defense}
                    onChange={e => updateMonster(monster.id, { 
                      stats: { ...monster.stats, defense: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
              </div>
              <button 
                onClick={() => deleteMonster(monster.id)}
                className="btn-small btn-danger"
                style={{ marginTop: '10px' }}
              >
                Remove Monster
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container">
      {view === 'list' && renderList()}
      {view === 'edit' && renderEdit()}
      {view === 'room' && renderRoomEdit()}

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          background: #1a1a1a;
          min-height: 100vh;
          color: #ffffff;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .header h1 {
          margin: 0;
          font-size: 2rem;
        }

        .actions {
          display: flex;
          gap: 1rem;
        }

        .btn-primary, .btn-secondary, .btn-small {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #0070f3;
          color: white;
        }

        .btn-primary:hover {
          background: #0051cc;
        }

        .btn-secondary {
          background: #4a5568;
          color: white;
        }

        .btn-secondary:hover {
          background: #2d3748;
        }

        .btn-small {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          background: #4a5568;
          color: white;
        }

        .btn-small:hover {
          background: #2d3748;
        }

        .btn-danger {
          background: #e53e3e;
        }

        .btn-danger:hover {
          background: #c53030;
        }

        .error {
          background: #fed7d7;
          border: 1px solid #fc8181;
          color: #c53030;
          padding: 1rem;
          border-radius: 5px;
          margin-bottom: 1rem;
        }

        .error ul {
          margin: 0.5rem 0 0 1.5rem;
        }

        .loading {
          text-align: center;
          padding: 2rem;
          color: #888;
        }

        .dungeon-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .dungeon-card, .room-card, .monster-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid #4a5568;
          border-radius: 10px;
          padding: 1.5rem;
        }

        .dungeon-card h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.5rem;
        }

        .description {
          color: #cccccc;
          margin-bottom: 1rem;
        }

        .meta {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .badge {
          padding: 0.25rem 0.75rem;
          border-radius: 15px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .badge.easy { background: #48bb78; color: white; }
        .badge.medium { background: #ed8936; color: white; }
        .badge.hard { background: #e53e3e; color: white; }
        .badge.expert { background: #9f7aea; color: white; }
        .badge.entrance { background: #48bb78; color: white; }
        .badge.boss { background: #e53e3e; color: white; }
        .badge.treasure { background: #ecc94b; color: black; }
        .badge.puzzle { background: #9f7aea; color: white; }
        .badge.combat { background: #ed8936; color: white; }
        .badge.rest { background: #4299e1; color: white; }
        .badge.trap { background: #c53030; color: white; }
        .badge.empty { background: #718096; color: white; }

        .card-actions {
          display: flex;
          gap: 0.5rem;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #888;
          grid-column: 1 / -1;
        }

        .form-section {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid #4a5568;
          border-radius: 10px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .form-section h2 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .section-header h2 {
          margin: 0;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .form-field {
          display: flex;
          flex-direction: column;
        }

        .form-field label {
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #cccccc;
        }

        .form-field input,
        .form-field select,
        .form-field textarea {
          padding: 0.75rem;
          border: 1px solid #4a5568;
          border-radius: 5px;
          background: #2d3748;
          color: white;
          font-size: 1rem;
        }

        .form-field input:focus,
        .form-field select:focus,
        .form-field textarea:focus {
          outline: none;
          border-color: #0070f3;
        }

        .room-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .room-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .room-info h4 {
          margin: 0 0 0.5rem 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .room-info p {
          margin: 0 0 0.5rem 0;
          color: #cccccc;
        }

        .room-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.875rem;
          color: #888;
        }

        .room-actions {
          display: flex;
          gap: 0.5rem;
        }

        .monster-card {
          margin-bottom: 1rem;
        }

        .floor-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .floor-tab {
          padding: 0.5rem 1rem;
          background: #2d3748;
          border: 2px solid #4a5568;
          border-radius: 4px;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .floor-tab:hover {
          background: #4a5568;
        }

        .floor-tab.active {
          background: #0070f3;
          border-color: #0070f3;
        }

        .delete-tab {
          margin-left: 0.5rem;
          padding: 0 0.3rem;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
          font-size: 1.2rem;
          line-height: 1;
        }

        .delete-tab:hover {
          background: rgba(255, 0, 0, 0.5);
        }

        .floor-info {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 1rem;
        }

        .info-box {
          padding: 1rem;
          background: #2d3748;
          border-left: 4px solid #0070f3;
          border-radius: 4px;
          color: #cbd5e0;
        }

        .info-box p {
          margin: 0;
        }
      `}</style>
    </div>
  );
}
