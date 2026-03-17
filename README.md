<div align="center">
   <img width="1200" height="475" alt="Hotel Sahil Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Hotel Sahil Dashboard

Hotel Sahil Dashboard is a desktop-first hotel front-desk management system built with React, Vite, and Electron.

It helps staff manage:

- Bookings
- Check-ins and check-outs
- Housekeeping status
- Invoices
- Rooms inventory
- Guest reviews
- Staff profile/session

## Who This Is For

- Hotel front desk teams
- Property managers
- Demo users and internal stakeholders

## Quick Start (For End Users)

### Windows Installer

1. Download the latest installer from the repository Releases section.
2. Run the setup file (`Hotel Sahil Setup <version>.exe`).
3. Complete installation and launch **Hotel Sahil** from Desktop or Start Menu.

### Demo Login Accounts

Use any of these demo accounts on the login screen:

- Admin: `admin@hotelsahil.com` / `admin123`
- Manager: `manager@hotelsahil.com` / `manager123`
- Staff: `staff@hotelsahil.com` / `staff123`

## Run Locally (For Developers)

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
npm install
```

### Start Web App (Vite)

```bash
npm run dev
```

### Start Electron App in Development

```bash
npm run electron:dev
```

### Build Production App

```bash
npm run build
```

### Build Windows Installer (Electron Builder)

```bash
npm run electron:build
```

## Available Scripts

- `npm run dev`: Start Vite development server
- `npm run build`: Build frontend assets
- `npm run preview`: Preview production build locally
- `npm run electron:dev`: Run Vite + Electron together for desktop development
- `npm run electron:start`: Start Electron using current build/dev URL setup
- `npm run electron:build`: Build desktop installer for Windows

## What Is Inside This Repository

```text
assets/                Static assets
components/            UI pages and reusable UI sections
   shared/              Shared components (e.g., toast)
electron/              Electron main and preload process files
services/              Service layer (reserved/expandable)
utils/                 Utility helpers (storage/helpers)
App.tsx                Main app shell and page routing
types.ts               Shared TypeScript types
index.tsx              React entry point
vite.config.ts         Vite configuration
package.json           Scripts, dependencies, and Electron build config
```

## Core Modules

- `Dashboard`: High-level operational summary
- `Bookings`: Create/update/delete booking records
- `CheckIns`: Handle arriving guests
- `CheckOuts`: Handle departures
- `Housekeeping`: Room cleaning and inspection status
- `Invoices`: Generate and manage billing records
- `Rooms`: Manage room catalog and room activation
- `Reviews`: Track guest reviews and staff replies
- `Profile`: User details and session preferences

## Data and Persistence

- App data is currently persisted in browser local storage for demo/local usage.
- This project does not require a backend to run in its current form.

## Tech Stack

- React 19
- TypeScript
- Vite
- Electron
- electron-builder

## Company

Developed by **eXon Solution Pvt. Ltd**.
