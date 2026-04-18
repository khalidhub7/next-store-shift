# Route Handlers Refactor Notes

This note is a learning reference for how this project could be refactored from a mainly Server Actions style to a Route Handlers style.

## Target Structure

```txt
../app-route-handlers/
├── README.md
├── app
│   ├── (auth)
│   │   ├── login
│   │   │   └── page.tsx
│   │   └── register
│   │       └── page.tsx
│   ├── (public)
│   │   ├── about
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── (shop)
│   │   ├── layout.tsx
│   │   └── products
│   │       ├── [id]
│   │       │   ├── loading.tsx
│   │       │   ├── not-found.tsx
│   │       │   └── page.tsx
│   │       ├── loading.tsx
│   │       └── page.tsx
│   ├── api
│   │   ├── auth
│   │   │   ├── login
│   │   │   │   └── route.ts
│   │   │   ├── logout
│   │   │   │   └── route.ts
│   │   │   ├── register
│   │   │   │   └── route.ts
│   │   │   └── session
│   │   │       └── route.ts
│   │   ├── cart
│   │   │   ├── route.ts
│   │   │   ├── add
│   │   │   │   └── route.ts
│   │   │   ├── item
│   │   │   │   └── [productId]
│   │   │   │       └── route.ts
│   │   │   └── qty
│   │   │       └── route.ts
│   │   └── products
│   │       ├── route.ts
│   │       └── [id]
│   │           └── route.ts
│   ├── error.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── not-found.tsx
├── components
│   ├── layout
│   │   ├── ClientNav.client.tsx
│   │   ├── ClientNav.module.css
│   │   └── Header.tsx
│   └── ui
│       ├── aspect-ratio.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── carousel.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── form.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── skeleton.tsx
│       ├── sonner.tsx
│       └── table.tsx
├── docs
│   └── structure.txt
├── features
│   ├── auth
│   │   ├── components
│   │   │   └── AuthForm.client.tsx
│   │   ├── client.ts
│   │   ├── handlers
│   │   │   ├── login.ts
│   │   │   ├── logout.ts
│   │   │   ├── register.ts
│   │   │   └── session.ts
│   │   ├── guard.ts
│   │   ├── index.ts
│   │   ├── repository
│   │   │   ├── session.ts
│   │   │   └── user.ts
│   │   ├── schema.ts
│   │   ├── service.ts
│   │   ├── session.helpers.ts
│   │   └── types
│   │       ├── session.ts
│   │       └── user.ts
│   ├── cart
│   │   ├── components
│   │   │   ├── AddToCartButton.client.tsx
│   │   │   ├── CartDialog.client.tsx
│   │   │   └── CartTable.client.tsx
│   │   ├── client.ts
│   │   ├── handlers
│   │   │   ├── add.ts
│   │   │   ├── get-cart.ts
│   │   │   ├── remove.ts
│   │   │   └── update-qty.ts
│   │   ├── index.ts
│   │   ├── queries.ts
│   │   ├── repository
│   │   │   └── cart.ts
│   │   ├── service.ts
│   │   └── types
│   │       └── cart.ts
│   └── products
│       ├── components
│       │   └── ProductCard.tsx
│       ├── client.ts
│       ├── handlers
│       │   ├── get-product.ts
│       │   └── list-products.ts
│       ├── index.ts
│       ├── repository
│       │   └── product.ts
│       └── types
│           └── product.ts
├── lib
│   ├── api
│   │   ├── http.ts
│   │   └── response.ts
│   └── utils.ts
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── proxy.ts
├── public
│   └── favicon.ico
├── storage
│   ├── auth
│   │   ├── sessions.json
│   │   └── users.json
│   └── cart
│       └── carts.json
└── tsconfig.json
```

## Main Changes From Server Actions Style

- `actions.ts` mostly disappears.
- `app/api/**/route.ts` becomes the HTTP entry layer.
- UI calls API through `fetch()` or helper files like `features/auth/client.ts`.
- `handlers/` contains route-handler-specific logic so `route.ts` stays thin.
- `service/` and `repository/` can still stay almost the same.

## Layer Meanings

- `page.tsx` = UI route
- `route.ts` = HTTP API route
- `client.ts` = frontend caller of `/api/...`
- `handlers/` = adapter between route handler and business logic
- `service.ts` = business logic
- `repository/` = db/file access

## Simple Mental Model

Use this style when the app needs clear HTTP endpoints, for example:

- API-style requests with `fetch()`
- external clients
- mobile apps
- webhooks
- cron jobs

Use Server Actions when the app mainly needs same-app UI mutations.
