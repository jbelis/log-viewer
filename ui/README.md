# log viewer UI

A bare-bones UI for uploading, viewing and analyzing log files, created using React, TailwindCSS, Typescript, 
and packaged using Vite
For context, please refer to the [README.md](README.md) file in the root of the project.

## Prerequisites

- Node.js (tested so far with v22)
- Docker and Docker Compose to start services
- npm

## Development Setup

### initial steps

After cloning the repository, run the following commands:
```bash
npm install
```

### option 1: fullstack development

Follow the server execution instructions in [api/README.md](api/README.md).
then run 
```bash
npm run dev
```
to start the UI.

### option 2: frontend only

Use the docker compose file at the root of the project, which will start the log viewer service and dependent services,
then run 
```bash
npm run dev
```
to start the UI.

Note: you will need to create a test user, as explained in [README.md](README.md) before you can use the UI.

### test, lint and build

```bash
npm run test     # NOT WORKING YET
npm run test:coverage  # NOT WORKING YET
npm run lint
npm run build
```
