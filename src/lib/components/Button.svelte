<script lang="ts">
  interface Props {
    variant?: 'primary' | 'secondary' | 'danger';
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    onclick?: () => void;
    children: any;
  }

  let { 
    variant = 'primary', 
    type = 'button', 
    disabled = false,
    onclick,
    children 
  }: Props = $props();

  const classMap = {
    primary: 'btn btn-primary',
    secondary: 'btn btn-secondary',
    danger: 'btn btn-danger',
  };
</script>

<button 
  class={classMap[variant]} 
  {type} 
  {disabled}
  onclick={onclick}
>
  {@render children()}
</button>
