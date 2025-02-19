# Log Viewer Service

A service and WEB API for uploading, storing, and analyzing log files. For context, please refer to the [README.md](README.md) file in the root of the project.

## Features

- File upload with streaming support
- Asynchronous log processing
- Log aggregation and analysis
- User authentication
- PostgreSQL database storage
- TypeScript/Node.js implementation

## Prerequisites

- Node.js (tested so far with v22)
- Docker and Docker Compose
- npm

## Development Setup

After cloning the repository, run the following commands:

```bash
cd api
npm install
```

A docker compose file is provided to create and initialise a PostgreSQL database docker container, 
using postgres:postgres as the username and password. Start it with
```bash
docker-compose up -d
```

Create a .env file in the api directory and set the following variables:
```bash
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/logviewer
DB_MIGRATIONS=src/database/migrations/*.ts
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
SESSION_SECRET=<create a random string>
```

The app validates and updates the schema with the database if needed. It can also be done manually with the following commands:
```bash
npm run migration:run -- -d src/database/connection.ts
```

You can now start the service with
```bash
npm run starR
```

To run tests, and lint:
```bash
npm run test
npm run test:coverage
npm run lint
```
