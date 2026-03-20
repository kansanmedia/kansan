# Kansan Group

React + Vite frontend with an Express API and MySQL-backed admin CMS.

## Prerequisites

- Node.js 20+
- MySQL database

## Setup

1. Install dependencies with `npm install`
2. Configure the environment in `.env`
3. Start the app with `npm run dev`

The server runs the API and Vite middleware on the same port.

## Available Scripts

- `npm run dev` starts the local server
- `npm run build` creates the production frontend build
- `npm run lint` runs TypeScript checks
- `npm run clean` removes `dist`

## Environment Variables

- `PORT`
- `NODE_ENV`
- `JWT_SECRET`
- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `ENABLE_DB_INIT=true` only when you intentionally want the database init route enabled
