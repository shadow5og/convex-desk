# LaundryClean Pro — Architecture Refactoring Plan

## Current Problems
1. `App.tsx` is a 113-line monolith mixing routing, inline JSX for pages, auth wrappers, and provider config
2. `SignInForm.tsx` lives at `src/` root — no clear feature boundary
3. `SignOutButton.tsx` is orphaned at `src/` root
4. No types/interfaces defined — `any` used everywhere
5. Layout has 200+ lines mixing desktop sidebar, mobile sidebar, header
6. Pages directly import `convex/_generated/api` — no abstraction layer
7. No shared loading/error states
8. No feature-based folder structure

## Target Architecture

```
src/
├── app/                        # App shell (entry, providers, router)
│   ├── App.tsx                 # Minimal — just wraps providers + router
│   ├── providers.tsx           # All provider wrappers composed
│   └── router.tsx              # All route definitions
│
├── features/                   # Feature modules (domain-driven)
│   ├── auth/                   # Auth feature
│   │   ├── components/
│   │   │   ├── SignInForm.tsx
│   │   │   ├── OAuthButtons.tsx
│   │   │   └── LoginPage.tsx
│   │   ├── providers/
│   │   │   └── auth-provider.ts
│   │   └── index.ts            # Public API barrel
│   │
│   ├── dashboard/              # Dashboard feature
│   │   ├── components/
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── StatsGrid.tsx
│   │   │   ├── WeeklyOverview.tsx
│   │   │   └── RecentAlerts.tsx
│   │   └── index.ts
│   │
│   ├── laundry/                # Laundry orders feature
│   │   ├── components/
│   │   │   ├── LaundryListPage.tsx
│   │   │   └── OrderTable.tsx
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   └── cleaning/               # Cleaning bookings feature
│       ├── components/
│       │   └── CleaningPage.tsx
│       └── index.ts
│
├── shared/                     # Shared across features
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx       # Main layout with <Outlet>
│   │   │   ├── Sidebar.tsx         # Desktop sidebar
│   │   │   ├── MobileSidebar.tsx   # Mobile sidebar
│   │   │   ├── Header.tsx          # Top header bar
│   │   │   └── UserMenu.tsx        # User avatar + logout
│   │   ├── feedback/
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ErrorCard.tsx
│   │   │   └── EmptyState.tsx
│   │   ├── pwa/
│   │   │   └── InstallPrompt.tsx
│   │   └── ui/                 # Shadcn primitives (unchanged)
│   │       ├── button.tsx
│   │       └── ...
│   ├── lib/
│   │   ├── convex-client.ts
│   │   └── utils.ts
│   ├── providers/
│   │   └── convex-data-provider.ts
│   └── types/
│       └── index.ts            # Shared types/interfaces
│
├── index.css
├── main.tsx
└── vite-env.d.ts
```

## Execution Order
1. Create shared types
2. Create shared feedback components (Loading, Error, Empty)
3. Split Layout into sub-components
4. Create feature modules (auth, dashboard, laundry, cleaning)
5. Create app shell (providers, router, App)
6. Update main.tsx entry point
7. Delete orphaned files
8. Build verification
