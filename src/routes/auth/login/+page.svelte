<script lang="ts">
  import { authStore } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import Button from '$lib/components/Button.svelte';
  import Card from '$lib/components/Card.svelte';
  
  let username = $state('');
  let password = $state('');
  let error = $state('');
  let isLoading = $state(false);
  
  async function handleSubmit(e: Event) {
    e.preventDefault();
    error = '';
    
    if (!username || !password) {
      error = 'Username and password are required';
      return;
    }
    
    isLoading = true;
    
    try {
      await authStore.login({ username, password });

      goto('/');
    } catch (err: any) {
      error = err.message || 'Login failed. Please check your credentials.';
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="container">
  <div class="login-wrapper">
    <Card>
      <div class="login-content">
        <h1>🎓 Login to UniSpace</h1>
        <p class="subtitle">Access your university space reservations</p>
        
        {#if error}
          <div class="alert alert-error">
            {error}
          </div>
        {/if}
        
        <form onsubmit={handleSubmit}>
          <div class="form-group">
            <label for="username" class="form-label">Username or Email</label>
            <input
              id="username"
              type="text"
              class="form-input"
              bind:value={username}
              placeholder="Enter your username or email"
              disabled={isLoading}
              required
            />
          </div>
          
          <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <input
              id="password"
              type="password"
              class="form-input"
              bind:value={password}
              placeholder="Enter your password"
              disabled={isLoading}
              required
            />
          </div>
          
          <Button type="submit" variant="primary" disabled={isLoading}>
            {#if isLoading}
              Logging in...
            {:else}
              Login
            {/if}
          </Button>
        </form>
        
        <div class="footer-links">
          <p>
            Don't have an account?
            <a href="/auth/register">Register here</a>
          </p>
        </div>
      </div>
    </Card>
  </div>
</div>

<style>
  .login-wrapper {
    max-width: 450px;
    margin: 0 auto;
  }
  
  .login-content {
    text-align: center;
  }
  
  .login-content h1 {
    margin-bottom: var(--spacing-sm);
  }
  
  .subtitle {
    color: var(--color-text-secondary);
    margin-bottom: var(--spacing-xl);
  }
  
  form {
    text-align: left;
  }
  
  .form-group {
    margin-bottom: var(--spacing-lg);
  }
  
  .form-group:last-of-type {
    margin-bottom: var(--spacing-xl);
  }
  
  .alert {
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
    margin-bottom: var(--spacing-lg);
  }
  
  .alert-error {
    background-color: rgba(239, 68, 68, 0.1);
    border: 1px solid var(--color-error);
    color: var(--color-error);
  }
  
  .footer-links {
    margin-top: var(--spacing-xl);
    padding-top: var(--spacing-lg);
    border-top: 1px solid var(--color-border);
  }
  
  .footer-links p {
    color: var(--color-text-secondary);
    margin: 0;
  }
  
  .footer-links a {
    color: var(--color-primary);
    font-weight: 600;
  }
  
  form :global(.btn) {
    width: 100%;
  }
</style>
