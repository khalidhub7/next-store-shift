# Next Store Shift

Production-minded e-commerce application built with **Next.js**, **React**, **TypeScript**, **Server Components**, **Server Actions**, **Redis-backed sessions**, and a scalable **feature-based architecture**.

> Version 1 focuses on architecture, authentication, server-first rendering, caching, and maintainability. The current persistence layer uses a file-based database by design. Future versions will introduce a real database and expanded commerce features.

---

## Highlights

* Full-stack Next.js App Router application
* Server-first architecture with minimal client JavaScript
* Secure authentication and session management
* Optimistic cart experience
* Redis-backed session validation
* Feature-based architecture with clear boundaries
* Server Actions for internal mutations
* Ready for database migration
* Designed as a portfolio and production-growth project

---

## Why This Project Exists

This project began as a learning exercise to deeply understand modern Next.js architecture and the differences between traditional React applications and full-stack React frameworks.

As development progressed, the project evolved into a portfolio-quality application that demonstrates:

* Architectural thinking
* Authentication and security fundamentals
* Server/client separation
* Scalable application structure
* Production-oriented engineering practices

The long-term goal is to evolve this project into a production-ready e-commerce platform.

---

## Core Features

### Authentication

* User registration and login
* Secure logout flow
* Session creation and revocation
* Redis-backed session validation
* Login rate limiting
* Safe redirect allowlist

### Shopping Cart

* Add, update, increase, decrease, and remove items
* Optimistic UI updates
* User-owned carts
* Race-condition protection
* Cart cleanup support

### User Experience

* Loading boundaries
* Error boundaries
* Not-found handling
* Form validation with Zod
* React Hook Form integration
* Toast notifications

---

## Architecture

The project follows a feature-based structure:

```txt
features/
├── auth
├── cart
└── products
```

Each feature is separated into focused layers:

```txt
db
service
actions
queries
components
types
```

Benefits:

* Easier maintenance
* Easier testing
* Clear ownership
* Database migration readiness
* Reduced coupling

---

## Engineering Highlights

### Server Actions

Internal mutations use Server Actions instead of unnecessary route handlers.

Mutation flow:

```txt
Client Component
        ↓
Server Action
        ↓
Service Layer
        ↓
Persistence Layer
        ↓
revalidatePath
```

### Security

* bcrypt password hashing
* Hashed session identifiers
* httpOnly cookies
* secure cookies
* sameSite protection
* Login rate limiting
* Redirect allowlist

### Modern Next.js Patterns

* App Router
* Server Components by default
* Client Components only where needed
* Route Groups
* loading.tsx
* error.tsx
* not-found.tsx
* next/image
* ISR and revalidation
* server-only boundaries

---

## Technology Stack

* Next.js
* React
* TypeScript
* Tailwind CSS
* Zod
* React Hook Form
* Redis / ioredis
* bcrypt
* Radix UI
* Lucide React
* Sonner
* Framer Motion

---

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run cleanup-sessions
npm run analyze
```

---

## Current Persistence

Version 1 intentionally uses file-based persistence.

The application architecture is designed so persistence can be replaced with a real database with minimal impact on upper layers.

---

## Roadmap

Planned future improvements:

* Real database integration
* Product and order models
* Checkout flow
* Admin dashboard
* Automated tests
* CI/CD pipeline
* Docker support
* Observability and logging
* Role-based authorization
* Stronger design system

---

## Portfolio Value

This project demonstrates my ability to:

* Build full-stack Next.js applications
* Design scalable feature architectures
* Implement secure authentication flows
* Use Server Actions effectively
* Handle optimistic UI correctly
* Manage server/client boundaries
* Design systems prepared for growth
* Build maintainable codebases

---

## Status

**Version 1 (v0.3.51)** is complete and represents the architecture-focused foundation of the project.

The next major milestone is migrating to a real database and expanding the commerce domain.
