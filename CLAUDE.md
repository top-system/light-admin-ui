# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vue 3 + TypeScript + Vite enterprise admin template (light-admin-ui v4.0.0). Uses Element Plus for UI, Pinia for state, Vue Router for routing, and UnoCSS for atomic CSS. Backend API proxy at `/dev-api` → `http://localhost:2222`.

## Commands

```bash
pnpm run dev              # Dev server on port 3000
pnpm run build            # Production build (with type-check)
pnpm run build-only       # Production build (skip type-check)
pnpm run type-check       # Vue-tsc type checking only
pnpm run test             # Vitest in watch mode
pnpm run test:run         # Vitest single run
pnpm run test:coverage    # Vitest with coverage
pnpm run lint             # All linters (eslint + prettier + stylelint)
pnpm run lint:eslint      # ESLint with auto-fix
pnpm run lint:prettier    # Prettier formatting
pnpm run lint:stylelint   # Stylelint for CSS/SCSS
pnpm run commit           # Interactive conventional commit (cz-git)
```

Requires Node.js `^20.19.0 || >=22.12.0` and `pnpm >= 8.0.0`.

## Architecture

### Routing: Static + Dynamic

Static routes are defined in `src/router/index.ts` (login, error pages, dashboard). Dynamic routes are fetched from the backend via `MenuAPI.getRoutes()` and added at runtime in `src/store/modules/permission.ts`. Components are resolved dynamically using `import.meta.glob()` against `src/views/**/*.vue`. Route guards live in `src/router/guards/permission.ts`.

### Authentication & Token Refresh

Login flow: `AuthAPI.login()` → tokens stored via `src/utils/auth.ts` (localStorage if "remember me", sessionStorage otherwise). The axios interceptor in `src/utils/request.ts` attaches Bearer tokens and handles automatic token refresh on 401 responses using a request queue pattern. API response code `"00000"` = success, `"A0230"` = access token expired (triggers refresh), `"A0231"` = refresh token expired (redirect to login).

### Permission System

Two directives: `v-has-perm="'sys:user:create'"` for button-level permissions and `v-has-role="'ADMIN'"` for role checks. The `ROLE_ROOT` super admin bypasses all checks. Permissions come from `userStore.userInfo.perms` populated at login.

### State Management (Pinia)

Key stores in `src/store/modules/`:
- **user** — auth state, login/logout, token refresh
- **permission** — dynamic route generation, menu tree
- **app** — UI state (language, sidebar, device), persisted via `useStorage()`
- **settings** — theme, layout mode, component size
- **dict** — dictionary data cache with WebSocket invalidation
- **tenant** — multi-tenant context (optional, toggled by `VITE_APP_TENANT_ENABLED`)

### API Layer

API modules in `src/api/` organized by domain (e.g., `src/api/system/user.ts`). Each exports a default object with typed methods using the `request()` wrapper from `src/utils/request.ts`. Types for request/response payloads live in `src/types/api/`.

### WebSocket

STOMP protocol via `@stomp/stompjs`. Composables in `src/composables/websocket/` handle dict cache sync and online user count. Initialized in `main.ts`, cleaned up on logout.

## Key Conventions

- **Path alias:** `@/` maps to `src/`
- **Auto-imports:** Vue, Vue Router, Pinia, VueUse, and Vue I18n APIs are auto-imported (no manual imports needed). Element Plus components are auto-registered.
- **Global types:** `PageQuery`, `PageResult`, `OptionType`, `ApiResponse`, `ExcelResult`, `TagView`, `AppSettings` are globally available without import.
- **Formatting:** Double quotes, 2-space indent, 100 char line width, trailing commas (ES5), semicolons on. Configured in `.prettierrc.yaml`.
- **Styling:** Use UnoCSS utility classes where possible. Global SCSS variables in `src/styles/variables.scss` are auto-injected into all SCSS files via Vite config.
- **Component naming:** PascalCase for `.vue` files.
- **Commits:** Conventional commits enforced by commitlint + husky. Use `pnpm run commit` for interactive flow.

## CURD Pattern

Reusable CRUD components in `src/components/CURD/`: `PageSearch` (filter form), `PageContent` (data table), `PageModal` (create/edit dialog). Use the `usePage()` composable for coordinating them. See `src/views/system/` for usage examples.

## Environment Variables

Defined in `.env.development` and `.env.production`. Key variables:
- `VITE_APP_BASE_API` — API base path (`/dev-api` in dev)
- `VITE_APP_API_URL` — Backend URL for proxy target
- `VITE_APP_WS_ENDPOINT` — WebSocket endpoint
- `VITE_MOCK_DEV_SERVER` — Enable mock server (`true`/`false`)
- `VITE_APP_TENANT_ENABLED` — Enable multi-tenant feature
