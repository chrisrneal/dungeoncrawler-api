'use client';

import { useState, useEffect } from 'react';
import { Dungeon, ApiEndpointConfig } from '@/lib/api';

export default function ApiEndpointsPage() {
  const [endpoints, setEndpoints] = useState<ApiEndpointConfig[]>([]);
  const [dungeons, setDungeons] = useState<Dungeon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState<ApiEndpointConfig | null>(null);
  const [testResults, setTestResults] = useState<{ [key: string]: any }>({});

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    path: '',
    dungeonId: '',
    description: '',
    enabled: true
  });

  // Load endpoints and dungeons on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load endpoints
      const endpointsRes = await fetch('/api/endpoints');
      const endpointsData = await endpointsRes.json();
      
      if (endpointsData.success) {
        setEndpoints(endpointsData.data || []);
      } else {
        throw new Error(endpointsData.error || 'Failed to load endpoints');
      }

      // Load dungeons
      const dungeonsRes = await fetch('/api/dungeon');
      const dungeonsData = await dungeonsRes.json();
      
      if (dungeonsData.success) {
        setDungeons(dungeonsData.data || []);
      } else {
        throw new Error(dungeonsData.error || 'Failed to load dungeons');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const generateId = () => {
    return `endpoint-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingEndpoint(null);
    setFormData({
      name: '',
      path: '/api/custom/',
      dungeonId: dungeons[0]?.id || '',
      description: '',
      enabled: true
    });
  };

  const handleEdit = (endpoint: ApiEndpointConfig) => {
    setIsCreating(false);
    setEditingEndpoint(endpoint);
    setFormData({
      name: endpoint.name,
      path: endpoint.path,
      dungeonId: endpoint.dungeonId,
      description: endpoint.description || '',
      enabled: endpoint.enabled
    });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingEndpoint(null);
    setFormData({
      name: '',
      path: '',
      dungeonId: '',
      description: '',
      enabled: true
    });
  };

  const handleSave = async () => {
    try {
      setError(null);

      const endpoint: ApiEndpointConfig = {
        id: editingEndpoint?.id || generateId(),
        name: formData.name,
        path: formData.path,
        dungeonId: formData.dungeonId,
        description: formData.description,
        enabled: formData.enabled
      };

      let response;
      if (editingEndpoint) {
        // Update existing endpoint
        response = await fetch(`/api/endpoints?id=${editingEndpoint.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(endpoint)
        });
      } else {
        // Create new endpoint
        response = await fetch('/api/endpoints', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(endpoint)
        });
      }

      const data = await response.json();
      
      if (data.success) {
        await loadData();
        handleCancel();
      } else {
        throw new Error(data.error || 'Failed to save endpoint');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save endpoint');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this endpoint configuration?')) {
      return;
    }

    try {
      setError(null);
      const response = await fetch(`/api/endpoints?id=${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        await loadData();
      } else {
        throw new Error(data.error || 'Failed to delete endpoint');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete endpoint');
    }
  };

  const handleTest = async (endpoint: ApiEndpointConfig) => {
    try {
      setTestResults({ ...testResults, [endpoint.id]: { loading: true } });
      
      const response = await fetch(endpoint.path);
      const data = await response.json();
      
      setTestResults({
        ...testResults,
        [endpoint.id]: {
          loading: false,
          success: response.ok,
          data: data,
          status: response.status
        }
      });
    } catch (err) {
      setTestResults({
        ...testResults,
        [endpoint.id]: {
          loading: false,
          success: false,
          error: err instanceof Error ? err.message : 'Failed to fetch'
        }
      });
    }
  };

  const getDungeonName = (dungeonId: string) => {
    const dungeon = dungeons.find(d => d.id === dungeonId);
    return dungeon ? dungeon.name : 'Unknown Dungeon';
  };

  if (loading) {
    return (
      <div className="container">
        <main className="main">
          <h1>Loading...</h1>
        </main>
      </div>
    );
  }

  return (
    <div className="container">
      <main className="main">
        <div className="header">
          <h1>API Endpoint Configuration</h1>
          <p className="subtitle">Configure custom API endpoints for your dungeons</p>
        </div>

        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        <div className="actions">
          <button onClick={handleCreate} className="btn-primary">
            Create New Endpoint
          </button>
          <a href="/" className="btn-secondary">
            Back to Home
          </a>
        </div>

        {(isCreating || editingEndpoint) && (
          <div className="form-container">
            <h2>{editingEndpoint ? 'Edit Endpoint' : 'Create New Endpoint'}</h2>
            
            <div className="form-group">
              <label>Endpoint Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="My Custom Endpoint"
              />
            </div>

            <div className="form-group">
              <label>API Path *</label>
              <input
                type="text"
                value={formData.path}
                onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                placeholder="/api/custom/my-dungeon"
              />
              <small>Must start with /api/custom/</small>
            </div>

            <div className="form-group">
              <label>Select Dungeon *</label>
              <select
                value={formData.dungeonId}
                onChange={(e) => setFormData({ ...formData, dungeonId: e.target.value })}
              >
                <option value="">Select a dungeon...</option>
                {dungeons.map(dungeon => (
                  <option key={dungeon.id} value={dungeon.id}>
                    {dungeon.name} (Level {dungeon.level} - {dungeon.difficulty})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description of this endpoint"
                rows={3}
              />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                />
                <span>Enabled</span>
              </label>
            </div>

            <div className="form-actions">
              <button onClick={handleSave} className="btn-primary">
                {editingEndpoint ? 'Update' : 'Create'}
              </button>
              <button onClick={handleCancel} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="endpoints-list">
          <h2>Configured Endpoints</h2>
          
          {endpoints.length === 0 ? (
            <p className="empty-state">No endpoints configured yet. Create one to get started!</p>
          ) : (
            <div className="cards">
              {endpoints.map(endpoint => (
                <div key={endpoint.id} className="endpoint-card">
                  <div className="card-header">
                    <h3>{endpoint.name}</h3>
                    <span className={`status ${endpoint.enabled ? 'enabled' : 'disabled'}`}>
                      {endpoint.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  
                  <div className="card-body">
                    <div className="info-row">
                      <strong>Path:</strong>
                      <code>{endpoint.path}</code>
                    </div>
                    <div className="info-row">
                      <strong>Dungeon:</strong>
                      <span>{getDungeonName(endpoint.dungeonId)}</span>
                    </div>
                    {endpoint.description && (
                      <div className="info-row">
                        <strong>Description:</strong>
                        <span>{endpoint.description}</span>
                      </div>
                    )}
                  </div>

                  <div className="card-actions">
                    <button onClick={() => handleTest(endpoint)} className="btn-test">
                      Test Endpoint
                    </button>
                    <button onClick={() => handleEdit(endpoint)} className="btn-edit">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(endpoint.id)} className="btn-delete">
                      Delete
                    </button>
                  </div>

                  {testResults[endpoint.id] && (
                    <div className="test-results">
                      {testResults[endpoint.id].loading ? (
                        <p>Testing...</p>
                      ) : testResults[endpoint.id].success ? (
                        <div className="success-result">
                          <p><strong>✓ Success!</strong> (Status: {testResults[endpoint.id].status})</p>
                          <details>
                            <summary>View Response</summary>
                            <pre>{JSON.stringify(testResults[endpoint.id].data, null, 2)}</pre>
                          </details>
                        </div>
                      ) : (
                        <div className="error-result">
                          <p><strong>✗ Error:</strong> {testResults[endpoint.id].error || 'Failed to fetch'}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 2rem;
          background: linear-gradient(to bottom, #2c3e50, #1a1a1a);
          color: #ffffff;
        }

        .main {
          max-width: 1200px;
          margin: 0 auto;
        }

        .header {
          margin-bottom: 2rem;
          text-align: center;
        }

        h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }

        .subtitle {
          color: #cccccc;
          font-size: 1.2rem;
        }

        .error-banner {
          background: #dc3545;
          color: white;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .actions {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .btn-primary, .btn-secondary, .btn-test, .btn-edit, .btn-delete {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
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
          text-decoration: none;
          display: inline-block;
        }

        .btn-secondary:hover {
          background: #2d3748;
        }

        .btn-test {
          background: #28a745;
          color: white;
        }

        .btn-test:hover {
          background: #1e7e34;
        }

        .btn-edit {
          background: #ffc107;
          color: #000;
        }

        .btn-edit:hover {
          background: #e0a800;
        }

        .btn-delete {
          background: #dc3545;
          color: white;
        }

        .btn-delete:hover {
          background: #c82333;
        }

        .form-container {
          background: rgba(255, 255, 255, 0.1);
          padding: 2rem;
          border-radius: 12px;
          margin-bottom: 2rem;
        }

        .form-container h2 {
          margin-top: 0;
          margin-bottom: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: bold;
        }

        .form-group input[type="text"],
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #4a5568;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          color: white;
          font-size: 1rem;
        }

        .form-group small {
          display: block;
          margin-top: 0.25rem;
          color: #cccccc;
          font-size: 0.875rem;
        }

        .checkbox-group label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .checkbox-group input[type="checkbox"] {
          width: auto;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
        }

        .endpoints-list {
          margin-top: 2rem;
        }

        .endpoints-list h2 {
          margin-bottom: 1rem;
        }

        .empty-state {
          text-align: center;
          color: #cccccc;
          padding: 2rem;
        }

        .cards {
          display: grid;
          gap: 1.5rem;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
        }

        .endpoint-card {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid #4a5568;
          border-radius: 12px;
          padding: 1.5rem;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .card-header h3 {
          margin: 0;
          font-size: 1.5rem;
        }

        .status {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: bold;
        }

        .status.enabled {
          background: #28a745;
          color: white;
        }

        .status.disabled {
          background: #6c757d;
          color: white;
        }

        .card-body {
          margin-bottom: 1rem;
        }

        .info-row {
          margin-bottom: 0.75rem;
          display: flex;
          gap: 0.5rem;
        }

        .info-row strong {
          min-width: 100px;
        }

        .info-row code {
          background: rgba(0, 0, 0, 0.3);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-family: monospace;
        }

        .card-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .card-actions button {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
        }

        .test-results {
          margin-top: 1rem;
          padding: 1rem;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.3);
        }

        .success-result {
          color: #28a745;
        }

        .error-result {
          color: #dc3545;
        }

        .test-results details {
          margin-top: 0.5rem;
        }

        .test-results summary {
          cursor: pointer;
          color: #0070f3;
        }

        .test-results pre {
          margin-top: 0.5rem;
          padding: 1rem;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 4px;
          overflow-x: auto;
          font-size: 0.875rem;
          max-height: 300px;
          overflow-y: auto;
        }

        @media (max-width: 768px) {
          .cards {
            grid-template-columns: 1fr;
          }

          .actions {
            flex-direction: column;
          }

          .card-actions {
            flex-direction: column;
          }

          .card-actions button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
