<script lang="ts">
  import Card from '$lib/components/Card.svelte';
  import { api } from '$lib/services/api';
  
  type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  
  interface Endpoint {
    name: string;
    method: HTTPMethod;
    path: string;
    description: string;
    needsAuth: boolean;
    bodyExample?: unknown;
  }
  
  const endpoints: Record<string, Endpoint[]> = {
    Auth: [
      { name: 'Login', method: 'POST', path: '/auth/login/', description: 'Authenticate user', needsAuth: false, bodyExample: { username: 'test', password: 'password123' } },
      { name: 'Register', method: 'POST', path: '/auth/registration/', description: 'Register new user', needsAuth: false, bodyExample: { username: 'test', email: 'test@example.com', password1: 'password123', password2: 'password123', first_name: 'Test', last_name: 'User', date_of_birth: '2000-01-01', role: 'student' } },
      { name: 'Logout', method: 'POST', path: '/auth/logout/', description: 'Logout current user', needsAuth: true },
      { name: 'Get Current User', method: 'GET', path: '/auth/user/', description: 'Get current user details', needsAuth: true },
    ],
    Buildings: [
      { name: 'List Buildings', method: 'GET', path: '/buildings/', description: 'Get all buildings', needsAuth: false },
      { name: 'Create Building', method: 'POST', path: '/buildings/', description: 'Create new building', needsAuth: true, bodyExample: { name: 'Science Building', address: 'Via Roma 1, Milano' } },
      { name: 'Get Building', method: 'GET', path: '/buildings/{id}/', description: 'Get building by ID', needsAuth: false },
      { name: 'Delete Building', method: 'DELETE', path: '/buildings/{id}/', description: 'Delete building', needsAuth: true },
    ],
    Spaces: [
      { name: 'List Spaces', method: 'GET', path: '/spaces/', description: 'Get all spaces', needsAuth: false },
      { name: 'Create Space', method: 'POST', path: '/spaces/', description: 'Create new space', needsAuth: true, bodyExample: { name: 'Room 101', type: 'ROOM', building_id: 'UUID-HERE', capacity: 30 } },
      { name: 'Get Space', method: 'GET', path: '/spaces/{id}/', description: 'Get space by ID', needsAuth: false },
      { name: 'Delete Space', method: 'DELETE', path: '/spaces/{id}/', description: 'Delete space', needsAuth: true },
    ],
    Reservations: [
      { name: 'List Reservations', method: 'GET', path: '/reservations/', description: 'Get all reservations', needsAuth: true },
      { name: 'My Reservations', method: 'GET', path: '/reservations/me/', description: 'Get user reservations', needsAuth: true },
      { name: 'Create Reservation', method: 'POST', path: '/reservations/', description: 'Create new reservation', needsAuth: true, bodyExample: { space: 'UUID-HERE', header: 'Meeting', start_at: '2025-12-15T10:00:00Z', end_at: '2025-12-15T12:00:00Z' } },
      { name: 'Confirm Reservation', method: 'PATCH', path: '/reservations/{id}/confirm/', description: 'Confirm reservation', needsAuth: true },
      { name: 'Cancel Reservation', method: 'PATCH', path: '/reservations/{id}/cancel/', description: 'Cancel reservation', needsAuth: true },
    ],
  };
  
  let selectedCategory = $state('Auth');
  let selectedEndpoint = $state<Endpoint | null>(endpoints.Auth[0]);
  let requestPath = $state('/auth/login/');
  let requestBody = $state('{\n  "username": "test",\n  "password": "password123"\n}');
  let useAuth = $state(false);
  
  let response = $state<{ status: number; statusText: string; data: unknown } | null>(null);
  let loading = $state(false);
  let error = $state('');
  
  function selectEndpoint(endpoint: Endpoint) {
    selectedEndpoint = endpoint;
    requestPath = endpoint.path;
    requestBody = endpoint.bodyExample ? JSON.stringify(endpoint.bodyExample, null, 2) : '';
    useAuth = endpoint.needsAuth;
    response = null;
    error = '';
  }
  
  async function sendRequest() {
    if (!selectedEndpoint) return;
    
    loading = true;
    error = '';
    
    try {
      const baseUrl = 'http://127.0.0.1:8000/api';
      const url = `${baseUrl}${requestPath}`;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (useAuth) {
        const token = api.getToken();
        if (token) {
          headers['Authorization'] = `Token ${token}`;
        }
      }
      
      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers,
      };
      
      if (['POST', 'PUT', 'PATCH'].includes(selectedEndpoint.method) && requestBody.trim()) {
        options.body = requestBody;
      }
      
      const res = await fetch(url, options);
      const data = res.status === 204 ? null : await res.json();
      
      response = {
        status: res.status,
        statusText: res.statusText,
        data,
      };
    } catch (err: any) {
      error = err.message || 'Request failed';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>API Tester - UniSpace</title>
</svelte:head>

<div class="container full-width">
  <div class="page-header">
    <h1>🔧 API Tester</h1>
    <p>Test UniSpace API endpoints - Swagger-like interface</p>
  </div>
  
  <div class="api-tester">
    <!-- Sidebar with endpoints -->
    <aside class="endpoints-sidebar">
      <h3>Endpoints</h3>
      {#each Object.entries(endpoints) as [category, categoryEndpoints]}
        <div class="endpoint-category">
          <button
            class="category-btn"
            class:active={selectedCategory === category}
            onclick={() => selectedCategory = category}
          >
            {category}
          </button>
          {#if selectedCategory === category}
            <div class="endpoint-list">
              {#each categoryEndpoints as endpoint}
                <button
                  class="endpoint-btn"
                  class:active={selectedEndpoint === endpoint}
                  onclick={() => selectEndpoint(endpoint)}
                >
                  <span class="method method-{endpoint.method.toLowerCase()}">{endpoint.method}</span>
                  <span>{endpoint.name}</span>
                </button>
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    </aside>
    
    <!-- Main content -->
    <main class="api-main">
      {#if selectedEndpoint}
        <Card>
          <div class="request-panel">
            <div class="endpoint-info">
              <h2>{selectedEndpoint.name}</h2>
              <p>{selectedEndpoint.description}</p>
              <div class="endpoint-meta">
                <span class="method method-{selectedEndpoint.method.toLowerCase()}">{selectedEndpoint.method}</span>
                <code>{selectedEndpoint.path}</code>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">Request Path</label>
              <input
                type="text"
                class="form-input"
                bind:value={requestPath}
                placeholder="/api/endpoint"
              />
            </div>
            
            {#if selectedEndpoint && ['POST', 'PUT', 'PATCH'].includes(selectedEndpoint.method)}
              <div class="form-group">
                <label class="form-label">Request Body (JSON)</label>
                <textarea
                  class="form-textarea code-editor"
                  rows="10"
                  bind:value={requestBody}
                  placeholder="JSON example"
                ></textarea>
              </div>
            {/if}
            
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" bind:checked={useAuth} />
                <span>Include Authentication Token</span>
              </label>
            </div>
            
            <button
              class="btn btn-primary"
              onclick={() => sendRequest()}
              disabled={loading}
            >
              {loading ? 'Sending...' : '🚀 Send Request'}
            </button>
          </div>
        </Card>
        
        <!-- Response panel -->
        {#if response || error}
          <Card>
            <div class="response-panel">
              <h3>Response</h3>
              {#if error}
                <div class="error-message">
                  ❌ Error: {error}
                </div>
              {:else if response}
                <div class="response-status">
                  <span class="status-code" class:success={response.status < 400} class:error={response.status >= 400}>
                    {response.status} {response.statusText}
                  </span>
                </div>
                <div class="response-body">
                  <h4>Response Body:</h4>
                  <pre class="code-block">{JSON.stringify(response.data, null, 2)}</pre>
                </div>
              {/if}
            </div>
          </Card>
        {/if}
      {/if}
    </main>
  </div>
</div>

<style>
  .full-width {
    max-width: 1400px;
  }
  
  .page-header {
    text-align: center;
    margin-bottom: var(--spacing-xl);
  }
  
  .page-header h1 {
    margin-bottom: var(--spacing-sm);
  }
  
  .page-header p {
    color: var(--color-text-secondary);
  }
  
  .api-tester {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: var(--spacing-lg);
    align-items: start;
  }
  
  .endpoints-sidebar {
    position: sticky;
    top: 100px;
  }
  
  .endpoints-sidebar h3 {
    margin-bottom: var(--spacing-md);
  }
  
  .endpoint-category {
    margin-bottom: var(--spacing-md);
  }
  
  .category-btn {
    width: 100%;
    padding: var(--spacing-sm) var(--spacing-md);
    text-align: left;
    background-color: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-weight: 600;
    cursor: pointer;
    transition: all var(--transition-fast);
  }
  
  .category-btn:hover {
    background-color: var(--color-bg-tertiary);
  }
  
  .category-btn.active {
    background-color: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
  }
  
  .endpoint-list {
    margin-top: var(--spacing-sm);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }
  
  .endpoint-btn {
    width: 100%;
    padding: var(--spacing-sm);
    text-align: left;
    background-color: var(--color-bg-primary);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all var(--transition-fast);
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }
  
  .endpoint-btn:hover {
    border-color: var(--color-primary);
  }
  
  .endpoint-btn.active {
    background-color: var(--color-bg-tertiary);
    border-color: var(--color-primary);
  }
  
  .method {
    display: inline-block;
    padding: 2px 6px;
    font-size: 0.75rem;
    font-weight: 700;
    border-radius: 3px;
    color: white;
  }
  
  .method-get { background-color: #3b82f6; }
  .method-post { background-color: #10b981; }
  .method-put { background-color: #f59e0b; }
  .method-patch { background-color: #8b5cf6; }
  .method-delete { background-color: #ef4444; }
  
  .api-main {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
  }
  
  .request-panel,
  .response-panel {
    padding: var(--spacing-lg);
  }
  
  .endpoint-info {
    margin-bottom: var(--spacing-xl);
    padding-bottom: var(--spacing-lg);
    border-bottom: 1px solid var(--color-border);
  }
  
  .endpoint-info h2 {
    margin-bottom: var(--spacing-sm);
  }
  
  .endpoint-info p {
    color: var(--color-text-secondary);
    margin-bottom: var(--spacing-md);
  }
  
  .endpoint-meta {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
  }
  
  .endpoint-meta code {
    background-color: var(--color-bg-tertiary);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-sm);
    font-family: 'Courier New', monospace;
  }
  
  .code-editor {
    font-family: 'Courier New', monospace;
    font-size: 0.875rem;
  }
  
  .checkbox-label {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    cursor: pointer;
  }
  
  .checkbox-label input {
    width: auto;
  }
  
  .response-panel h3 {
    margin-bottom: var(--spacing-lg);
  }
  
  .response-status {
    margin-bottom: var(--spacing-lg);
  }
  
  .status-code {
    display: inline-block;
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--radius-md);
    font-weight: 700;
  }
  
  .status-code.success {
    background-color: rgba(16, 185, 129, 0.1);
    color: var(--color-success);
  }
  
  .status-code.error {
    background-color: rgba(239, 68, 68, 0.1);
    color: var(--color-error);
  }
  
  .response-body h4 {
    margin-bottom: var(--spacing-md);
  }
  
  .code-block {
    background-color: var(--color-bg-tertiary);
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
    overflow-x: auto;
    font-family: 'Courier New', monospace;
    font-size: 0.875rem;
  }
  
  .error-message {
    padding: var(--spacing-md);
    background-color: rgba(239, 68, 68, 0.1);
    border: 1px solid var(--color-error);
    border-radius: var(--radius-md);
    color: var(--color-error);
  }
  
  @media (max-width: 1024px) {
    .api-tester {
      grid-template-columns: 1fr;
    }
    
    .endpoints-sidebar {
      position: static;
    }
  }
</style>
