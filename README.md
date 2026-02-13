# Genealogy Tree

A genealogical family tree visualization and management application. Browse interactive family trees powered by D3/family-chart and manage individuals through an admin dashboard.

## Tech Stack

- **Framework:** Next.js 16 (App Router), TypeScript
- **UI:** React 19, MUI 7, Tailwind CSS 4
- **Visualization:** D3, family-chart
- **Database:** MongoDB / Mongoose
- **Linting & Formatting:** Biome

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm
- [MongoDB](https://www.mongodb.com/) (listed as a dependency; not yet wired up)

## Installation

```bash
git clone <repository-url>
cd genealogy-tree
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command          | Description                  |
| ---------------- | ---------------------------- |
| `npm run dev`    | Start the dev server         |
| `npm run build`  | Create a production build    |
| `npm run start`  | Serve the production build   |
| `npm run lint`   | Run Biome linting checks     |
| `npm run format` | Auto-format files with Biome |

## Project Structure

```
src/
├── app/                  # Next.js App Router pages & layouts
│   ├── (admin)/          # Admin route group — serves /admin, /admin/individuals
│   ├── familytree/       # Family tree visualization page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/           # Reusable UI components
│   ├── admin_page/       # Admin sidebar, breadcrumbs, lists
│   └── footer/           # Footer component
└── lib/
    └── actions/          # Server actions
```
