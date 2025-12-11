<script>
	// Simple CSS-only animated background
</script>

<div class="background">
	<div class="blob blob-1"></div>
	<div class="blob blob-2"></div>
	<div class="blob blob-3"></div>
	<div class="blur-overlay"></div>
</div>

<style>
    .background {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: -10;
        overflow: hidden;
        background-color: var(--color-bg-primary);
    }

    .blob {
        position: absolute;
        border-radius: 50%;
        filter: blur(80px);
        opacity: 0.6;
        animation: float 20s infinite alternate cubic-bezier(0.45, 0.05, 0.55, 0.95);
    }

    .blob-1 {
        top: -10%;
        left: -10%;
        width: 50vw;
        height: 50vw;
        background: radial-gradient(circle, #4ade80 0%, rgba(74, 222, 128, 0) 70%); /* Primary Green */
        animation-duration: 25s;
    }

    .blob-2 {
        bottom: -10%;
        right: -10%;
        width: 60vw;
        height: 60vw;
        background: radial-gradient(
                circle,
                #60a5fa 0%,
                rgba(96, 165, 250, 0) 70%
        ); /* Blueish complement */
        animation-duration: 30s;
        animation-delay: -5s;
    }

    .blob-3 {
        top: 40%;
        left: 40%;
        width: 40vw;
        height: 40vw;
        background: radial-gradient(
                circle,
                #f472b6 0%,
                rgba(244, 114, 182, 0) 70%
        ); /* Pinkish accent */
        animation-duration: 22s;
        animation-delay: -10s;
    }

    .blur-overlay {
        position: absolute;
        inset: 0;
        backdrop-filter: blur(60px); /* Heavy blur to mesh everything */
        background: rgba(255, 255, 255, 0.3); /* Lighten it up */
    }

    :global([data-theme='dark']) .blur-overlay {
        background: rgba(15, 23, 42, 0.3); /* Darken for dark mode */
    }

    @keyframes float {
        0% {
            transform: translate(0, 0) rotate(0deg) scale(1);
        }
        33% {
            transform: translate(5%, 10%) rotate(5deg) scale(1.1);
        }
        66% {
            transform: translate(-5%, 5%) rotate(-5deg) scale(0.9);
        }
        100% {
            transform: translate(5%, -5%) rotate(5deg) scale(1.05);
        }
    }
</style>
