# UniSpace Web Frontend

Web interface for **UniSpace**, an academic university-space reservation system developed for the **Secure Software Design** course at the University of Calabria (UniCal).

This repository contains the SvelteKit/TypeScript frontend. It consumes the UniSpace REST API exposed by the companion [`backend`](https://github.com/UniSpace-SSD/backend) repository.

> **Project status:** completed academic project. This repository is kept as a portfolio/reference snapshot and is not actively maintained.

## Project ecosystem

UniSpace is split across three repositories:

- [`backend`](https://github.com/UniSpace-SSD/backend) — Django REST API, authentication, permissions and domain logic
- [`web-frontend`](https://github.com/UniSpace-SSD/web-frontend) — SvelteKit web application
- [`tui`](https://github.com/UniSpace-SSD/tui) — Python terminal client

## Features

The web client includes routes and UI flows for:

- user registration, login and logout
- user profile information
- buildings and university spaces
- reservation creation and management
- role-aware behaviour for students and professors
- administrative views
- interaction with the REST API through token-based authentication

The application models the same core domain exposed by the backend: departments, buildings, spaces, users and reservations.

## Tech stack

- **Svelte 5**
- **SvelteKit 2**
- **TypeScript**
- **Vite**
- **Sass**
- **Lucide Svelte**
- **Playwright** for end-to-end testing
- ESLint / Prettier / `svelte-check`

The API client currently targets:

```text
http://127.0.0.1:8000/api
```

so the backend should be running locally on port `8000`.

## Getting started

### Prerequisites

- Node.js 22+ recommended
- npm
- the UniSpace backend running locally

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

To open the app automatically in the browser:

```bash
npm run dev -- --open
```

### Production build

```bash
npm run build
npm run preview
```

## Quality checks and tests

```bash
# Svelte / TypeScript checks
npm run check

# Formatting + linting
npm run lint

# End-to-end tests
npm test
```

The end-to-end test suite is implemented with Playwright.

## Main structure

```text
src/
├── lib/
│   ├── assets/
│   ├── components/
│   ├── services/
│   └── stores/
└── routes/
    ├── admin/
    ├── auth/
    ├── buildings/
    ├── profile/
    ├── reservations/
    └── spaces/

e2e/
```

The frontend API layer is located in `src/lib/services/api.ts`.

## Security-related design

The client uses the backend's token-based authentication and includes the token in authenticated API requests. Authorization decisions remain enforced server-side by the Django REST API rather than being trusted to the UI alone.

## Academic context

UniSpace was developed as a two-person project for the **Secure Software Design** course at the **University of Calabria**. The project was designed as a multi-client system, with both a graphical web frontend and a terminal client consuming the same backend API.

## Contributors

- [Ronnie2603](https://github.com/Ronnie2603)
- [Shadowz-git](https://github.com/shadowz-git)

See the [UniSpace-SSD organization](https://github.com/UniSpace-SSD) for the complete project.
