# SiteFleet

Manage vehicle fleets, drivers, and construction sites — attendance, fuel logs, and UPI payments, built with React Native + Firebase.

Internal, single-user app for managing a transport business: hiring vehicles with drivers on a per-day contract basis to deliver mid-day meals to government schools, tracking driver pay and fuel cost separately, and settling driver payments via UPI at month end.

Distributed as a sideloaded APK (not published to app stores). Cloud data via Firebase, tied to the admin's Google account.

## Tech stack

- Bare React Native CLI, TypeScript (strict mode)
- Firebase JS SDK — Auth (Google Sign-In), Firestore, Storage
- React Navigation (native stack)
- Zustand for global state
- React Hook Form + Zod for forms and validation
- date-fns for date handling

## Getting started

### Prerequisites

- Node.js
- For iOS: Xcode + CocoaPods
- For Android: Android Studio / SDK, an emulator or device

### Install dependencies

```sh
yarn install
```

iOS only, first time and after native dependency changes:

```sh
bundle install
bundle exec pod install --project-directory=ios
```

### Environment variables

Copy `.env.example` to `.env` and fill in your Firebase project credentials. `.env` is gitignored and must never be committed.

```sh
cp .env.example .env
```

### Run the app

Start Metro:

```sh
yarn start
```

In a separate terminal:

```sh
yarn android
# or
yarn ios
```

## Project structure

The app is organized around independent business modules, each with its own screens, services, and Firestore collections:

- **Transport** (`src/screens/transport/`, `src/services/`) — the module documented in this repo today: drivers, routes, daily attendance/fuel entries, fuel price and pump tracking, driver payments, and the Bill/Summary PDF reports. Reached via the bottom tab bar's Transport tab.
- **Construction** — a placeholder tab only ("Coming soon"), no functionality yet. A future module for tracking construction sites, planned to follow the same per-owner, Firestore-backed pattern as Transport.
- More modules may be added the same way over time, each as its own top-level tab with its own screens/services/types, sharing the common `firebase/`, `components/`, `theme/`, and `stores/` layers.

Shared infrastructure lives at the top of `src/`: `firebase/` (Auth + Firestore setup), `navigation/` (root nav, custom tab bar), `components/` (buttons, form fields, pickers, list rows, loading skeletons), `stores/` (Zustand global state), `theme/`, and `utils/`.

## Branching and commits

- No direct commits to `main`; all work happens on feature branches merged via pull request.
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, `refactor:`, etc.).
