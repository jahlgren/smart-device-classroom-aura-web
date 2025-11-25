# Classroom Aura – Web Portal

Classroom Aura is a web portal (frontend + backend) for monitoring indoor air quality through the Classroom Aura IoT device.

This project provides APIs, a UI dashboard, and database storage for sensor data.

## Development Setup

### 1. Install

Install dependencies:

```
npm install
```

### 2. Environment variables

Create a .env file in the project root:

```
DATABASE_URL=postgres://devuser:devpass@localhost:5432/devdb
```

### 3. Start Postgres using Docker

Make sure Docker is installed, then run:

```
docker compose up --detach
```

This starts the Postgres database defined in docker-compose.yml.

### 4. Run the development server

```
npm run dev
```

## Database & Migrations

When you modify the database schema, create a migration:

```
npx drizzle-kit generate
```

Apply migrations:

```
npx drizzle-kit migrate
```

To inspect database state:

```
npx drizzle-kit studio
```
