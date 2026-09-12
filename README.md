# Aurora Motors — Digital Automotive Studio

A premium, generic 3D automotive showroom and vehicle exploration web application. Discover, inspect, configure and virtually experience a fictional line-up of vehicles in an interactive, cinematic interface.

All vehicles, brands and people in this project are fictional. 3D models and avatars are generated procedurally at runtime — no third-party assets are used.

## Features

- Cinematic landing page with a live 3D hero vehicle
- Interactive 3D vehicle viewer with orbit, zoom, viewpoint presets, hotspots and fullscreen
- Virtual showroom (`/showroom`) with explore, focus, interior, compare and spec modes
- Vehicle discovery with category selector, live search, list/grid switching, sorting and advanced filters
- Car details, step-by-step configurator with live 3D updates and price summary, saved builds
- Side-by-side comparison, favourites, profile and settings
- Demo authentication (`/login`, `/signup`, `/forgot-password`, `/demo-login`) with an animated 3D avatar
- Complete light and dark theme system (including 3D lighting), persisted preference
- Custom desktop cursor, scroll progress indicator, restrained page transitions
- Responsive layout, keyboard navigation, focus states, reduced-motion support, WebGL fallbacks

## Tech stack

- React 19 + TypeScript (strict), Vite 8
- SCSS modules with a design-token system (CSS custom properties)
- Three.js via React Three Fiber and Drei
- Framer Motion
- React Router

## Getting started

```bash
npm install
npm run dev
```

| Script              | Description                           |
| ------------------- | ------------------------------------- |
| `npm run dev`       | Start the development server          |
| `npm run build`     | Type-check and build for production   |
| `npm run preview`   | Preview the production build          |
| `npm run typecheck` | Run the TypeScript compiler           |
| `npm run lint`      | Run oxlint                            |

### Demo accounts

Any well-formed email with a 6+ character password signs in as a customer. Pre-defined personas (password `demo1234`):

| Persona          | Email                  |
| ---------------- | ---------------------- |
| Customer         | `maya@demo.aurora`     |
| Showroom visitor | `visitor@demo.aurora`  |
| Sales advisor    | `daniel@demo.aurora`   |
| Admin            | `priya@demo.aurora`    |

## Configuration

Runtime configuration lives in `.env`, `.env.development` and `.env.production` and is read once in `src/core/config/environment.ts`.

| Variable               | Purpose                                            |
| ---------------------- | -------------------------------------------------- |
| `VITE_APP_ENVIRONMENT` | `development` or `production`                      |
| `VITE_API_BASE_URL`    | Base URL for a future HTTP backend                 |
| `VITE_ASSET_BASE_URL`  | Base URL for static assets (defaults to Vite base) |
| `VITE_DEMO_MODE`       | Enables the local demo authentication service      |
| `VITE_REPOSITORY_URL`  | Link shown in the footer                           |

## Deployment (GitHub Pages + Railway API)

The frontend is a static SPA. GitHub Pages hosts it. The Node API is **not** deployed here — it runs on Railway from [car-system-server](https://github.com/maheshpcse/car-system-server).

### GitHub Pages

`.github/workflows/deploy.yml` builds and publishes `dist/` on every push to `main`. Enable **Settings → Pages → Source: GitHub Actions** once.

- The base path is derived from `GITHUB_REPOSITORY`: project pages are served from `/<repo>/`, user/organisation pages from `/`.
- `index.html` is copied to `404.html` and `.nojekyll` is written so deep links work on refresh (`public/.nojekyll` is also committed).
- Production build variables are read from repository **Actions variables** (see `.env.production.example`):

| Variable | Example |
| --- | --- |
| `VITE_API_BASE_URL` | `https://<service>.up.railway.app/api/v1` |
| `VITE_ASSET_BASE_URL` | optional CloudFront origin |
| `VITE_DEMO_MODE` | `true` |

After the Railway API is live, set `VITE_API_BASE_URL` and re-run **Deploy to GitHub Pages**.

### Railway (API only)

Use the backend repository. Required files there: `railway.json`, `nixpacks.toml`, `Procfile`, `.env.railway.example`.

## Project structure

```
src/
  animations/   motion constants and page transitions
  app/          root component and routes
  core/         auth, preferences, config, hooks, utilities
  data/         mock vehicles, categories, personas
  features/     route-level pages grouped by domain
  layout/       navbar, sidebar, footer, app and auth shells
  models/       TypeScript interfaces
  services/     auth service abstraction
  shared/       reusable UI, icons, cursor, scroll, feedback
  styles/       tokens, themes, base, typography, utilities, mixins
  theme/        theme provider
  three/        procedural car, avatar, viewer, showroom, studio lighting
```
