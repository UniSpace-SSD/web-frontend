<script lang="ts">
  import { authStore } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import Button from '$lib/components/Button.svelte';
  import Card from '$lib/components/Card.svelte';
  import { onMount } from 'svelte';
	import { api } from '$lib/services/api';
  
  let formData = $state({
    username: '',
    email: '',
    password1: '',
    password2: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    role: 'student' as 'student' | 'professor',
    department: '' as string  // Aggiungi department
  });
  
  let error = $state('');
  let success = $state(false);
  let isLoading = $state(false);
  let isLoadingDepartments = $state(false);
  let departments = $state<Array<{code: string, name: string}>>([]);
  
  onMount(async () => {
    await fetchDepartments();
  });
  
  async function fetchDepartments() {
    isLoadingDepartments = true;
    try {
      departments = await api.getDepartments();
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      isLoadingDepartments = false;
    }
  }
  
  async function handleSubmit(e: Event) {
    e.preventDefault();
    error = '';

    if (!formData.username || !formData.email || !formData.password1 || !formData.password2) {
      error = 'Please fill in all required fields';
      return;
    }
    
    if (!formData.department) {
      error = 'Please select a department';
      return;
    }
    
    if (formData.password1 !== formData.password2) {
      error = 'Passwords do not match';
      return;
    }
    
    if (formData.password1.length < 8) {
      error = 'Password must be at least 8 characters long';
      return;
    }
    
    if (!formData.first_name || !formData.last_name || !formData.date_of_birth) {
      error = 'Please fill in all required fields';
      return;
    }
    
    isLoading = true;
    
    try {
      await authStore.register(formData);

      if (typeof window !== 'undefined') {
        localStorage.setItem('user_role', formData.role);
        localStorage.setItem('user_department', formData.department);
      }
      success = true;

      setTimeout(() => {
        goto('/auth/login');
      }, 2000);
    } catch (err: any) {
      error = err.message || 'Registration failed. Please try again.';
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="container">
  <div class="register-wrapper">
    <Card>
      <div class="register-content">
        <h1>🎓 Register for UniSpace</h1>
        <p class="subtitle">Create your account to start booking spaces</p>
        
        {#if error}
          <div class="alert alert-error">
            {error}
          </div>
        {/if}
        
        {#if success}
          <div class="alert alert-success">
            Registration successful! Redirecting to login...
          </div>
        {:else}
          <form onsubmit={handleSubmit}>
            <div class="form-row">
              <div class="form-group">
                <label for="first_name" class="form-label">First Name</label>
                <input
                  id="first_name"
                  type="text"
                  class="form-input"
                  bind:value={formData.first_name}
                  placeholder="John"
                  disabled={isLoading}
                  required
                />
              </div>
              
              <div class="form-group">
                <label for="last_name" class="form-label">Last Name</label>
                <input
                  id="last_name"
                  type="text"
                  class="form-input"
                  bind:value={formData.last_name}
                  placeholder="Doe"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
            
            <div class="form-group">
              <label for="username" class="form-label">Username</label>
              <input
                id="username"
                type="text"
                class="form-input"
                bind:value={formData.username}
                placeholder="johndoe"
                disabled={isLoading}
                required
              />
            </div>
            
            <div class="form-group">
              <label for="email" class="form-label">Email</label>
              <input
                id="email"
                type="email"
                class="form-input"
                bind:value={formData.email}
                placeholder="john.doe@university.edu"
                disabled={isLoading}
                required
              />
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="date_of_birth" class="form-label">Date of Birth</label>
                <input
                  id="date_of_birth"
                  type="date"
                  class="form-input"
                  bind:value={formData.date_of_birth}
                  disabled={isLoading}
                  required
                />
              </div>
              
              <div class="form-group">
                <label for="role" class="form-label">Role</label>
                <select
                  id="role"
                  class="form-select"
                  bind:value={formData.role}
                  disabled={isLoading}
                  required
                >
                  <option value="student">Student</option>
                  <option value="professor">Professor</option>
                </select>
              </div>
            </div>
            
            <div class="form-group">
              <label for="department" class="form-label">Department</label>
              {#if isLoadingDepartments}
                <div class="loading-departments">Loading departments...</div>
              {:else if departments.length === 0}
                <div class="no-departments">No departments available</div>
              {:else}
                <select
                  id="department"
                  class="form-select"
                  bind:value={formData.department}
                  disabled={isLoading}
                  required
                >
                  {#each departments as dept}
                    <option value={dept.code}>{dept.name}</option>
                  {/each}
                </select>
              {/if}
            </div>
            
            <div class="form-group">
              <label for="password1" class="form-label">Password</label>
              <input
                id="password1"
                type="password"
                class="form-input"
                bind:value={formData.password1}
                placeholder="At least 8 characters"
                disabled={isLoading}
                required
              />
            </div>
            
            <div class="form-group">
              <label for="password2" class="form-label">Confirm Password</label>
              <input
                id="password2"
                type="password"
                class="form-input"
                bind:value={formData.password2}
                placeholder="Re-enter your password"
                disabled={isLoading}
                required
              />
            </div>
            
            <Button type="submit" variant="primary" disabled={isLoading || isLoadingDepartments}>
              {#if isLoading}
                Registering...
              {:else}
                Register
              {/if}
            </Button>
          </form>
        {/if}
        
        <div class="footer-links">
          <p>
            Already have an account?
            <a href="/auth/login">Login here</a>
          </p>
        </div>
      </div>
    </Card>
  </div>
</div>

<style>
  .register-wrapper {
    max-width: 600px;
    margin: 0 auto;
  }
  
  .register-content {
    text-align: center;
  }
  
  .register-content h1 {
    margin-bottom: var(--spacing-sm);
  }
  
  .subtitle {
    color: var(--color-text-secondary);
    margin-bottom: var(--spacing-xl);
  }
  
  form {
    text-align: left;
  }
  
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-md);
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
  
  .alert-success {
    background-color: rgba(16, 185, 129, 0.1);
    border: 1px solid var(--color-success);
    color: var(--color-success);
  }
  
  .loading-departments,
  .no-departments {
    padding: var(--spacing-md);
    text-align: center;
    background-color: var(--color-bg-secondary);
    border-radius: var(--radius-md);
    color: var(--color-text-secondary);
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
  
  @media (max-width: 768px) {
    .form-row {
      grid-template-columns: 1fr;
    }
  }
</style>