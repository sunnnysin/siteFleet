# SiteFleet

Manage vehicle fleets, drivers, and construction sites — attendance, fuel logs, and UPI payments, built with React Native + Firebase.

Internal, single-user app for managing a transport business: hiring vehicles with drivers on a per-day contract basis to deliver mid-day meals to government schools, tracking driver pay and fuel cost separately, and settling driver payments via UPI at month end.

Distributed as a sideloaded APK (not published to app stores). Cloud data via Firebase, tied to the admin's Google account.

The full implementation spec lives at [`sitefleet-transport-module-spec.md`](../sitefleet-transport-module-spec.md) in the parent directory.

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
npm install
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
npm start
```

In a separate terminal:

```sh
npm run android
# or
npm run ios
```

## Project structure

See the [spec](../sitefleet-transport-module-spec.md#4-folder-structure) for the full `src/` layout (screens, services, stores, types, etc.).

## Branching and commits

- No direct commits to `main`; all work happens on feature branches merged via pull request.
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, `refactor:`, etc.).
