# NextLearn E-Commerce

A production-minded e-commerce web app built with Next.js, React, TypeScript, Server Components, Server Actions, Redis-backed sessions, optimistic cart UX, and feature-based architecture.

This is **Version 1** of the project. The current persistence layer uses a file-based database so the focus stays on architecture, authentication, caching, server/client boundaries, and enterprise-style patterns. The next version will move the app to a real database and expand the commerce domain.

## Why This Project Exists

This project is part of my portfolio and was built to show that I understand more than UI implementation. It demonstrates how to structure a modern full-stack React/Next.js application with clean boundaries, safe auth flows, server-first rendering, progressive enhancement, and scalable service patterns.

The goal is to build like a real product team would build: clear ownership, small modules, server/client separation, defensive authentication, and code that can evolve into a production e-commerce platform.

## Core Features

- Product listing and product details pages
- Shopping cart with optimistic UI updates
- Add, increase, decrease, update, and remove cart items
- User authentication with login, register, and logout flows
- Session creation, revocation, expiration, and cleanup
- Redis-backed session validation
- Login rate limiting
- Safe redirect allowlist
- Server-side validation with Zod
- React Hook Form client UX
- Loading, error, and not-found boundaries
- ISR revalidation for product/cart-related UI freshness
- Script-safe session cleanup command

## Engineering Highlights

### Architecture

The app uses feature-based architecture:

- `features/auth`
- `features/cart`
- `features/products`
- `components/ui`
- `components/layout`
- `scripts`

Each feature is split by responsibility:

- `db` for persistence access
- `service` for business logic
- `actions` for Server Actions
- `queries` for read-only server data
- `components` for UI
- `types` for domain contracts

This keeps the codebase easy to reason about, easier to refactor, and ready for a real database migration.

### Auth & Security

- Password hashing with `bcrypt`
- Session IDs are hashed before storage
- `httpOnly`, `secure`, and `sameSite=lax` cookies
- Redis session lookup for fast auth checks
- Session revocation on logout
- Session cleanup script for expired/revoked sessions
- Redirect allowlist to avoid unsafe redirects
- Login rate limiting by IP and email
- Separate read-only auth helper for Server Components

### Cart System

- User-owned carts instead of client-owned cart cookies
- Server Actions for mutations
- Optimistic UI with `useOptimistic` and `useTransition`
- Serialized cart mutations to prevent race conditions in file persistence
- Cart TTL cleanup behavior
- Service layer owns the fresh-read, mutate, and write flow

### Next.js Patterns

- App Router
- Server Components by default
- Client Components only where interactivity is needed
- `server-only` boundaries
- Server Actions
- Route groups
- `loading.tsx`, `error.tsx`, and `not-found.tsx`
- `next/image`
- ISR with `revalidate`
- Reduced browser JavaScript through server-first rendering

### UI & Developer Experience

- Tailwind CSS
- shadcn/Radix-style UI primitives
- Lucide icons
- Sonner toasts
- Framer Motion form transitions
- TypeScript strict mode
- ESLint
- Bundle analyzer script

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Zod
- React Hook Form
- bcrypt
- Redis / ioredis
- Radix UI
- Lucide React
- Sonner
- Framer Motion

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run cleanup-sessions
npm run analyze
```

## Current Persistence

Version 1 uses file-based persistence for users, sessions, and carts. This is intentional for the learning and architecture phase.

The app is already shaped so the file database can be replaced by a real database with minimal changes to the upper layers.

## Roadmap

Planned for next versions:

- Real database integration
- Product/order models
- Checkout flow
- Admin dashboard
- Docker support
- Automated tests
- CI/CD pipeline
- Better observability and logging
- More advanced cart batching/throttling
- Stronger design system
- Role-based authorization

## Portfolio Value

This project demonstrates my ability to:

- Build full-stack Next.js apps
- Separate server and client concerns
- Design maintainable feature architecture
- Implement secure auth foundations
- Handle optimistic UI correctly
- Think about race conditions and data ownership
- Use modern React and Next.js patterns
- Prepare code for database migration
- Build systems that are easy for humans and AI agents to understand, extend, and refactor

## Status

Version 1 is architecture-focused and ready for the next major step: replacing file persistence with a real database and expanding the e-commerce domain.
