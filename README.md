# Log Viewer Application

An extremely basic web application for uploading, viewing and analyzing log files, built with React, Node.js, express, and TypeScript.

## Features

- Upload and parse log files
- Real-time log viewing and filtering
- a basic UI built with React and Tailwind CSS
- Containerized with Docker for easy testing and deployment

### Accepted log file format

The log file must be a text file with one log entry per line.
with each line containing the following columns in this order:
1. timestamp (Format: YYYY-MM-DD HH:MM)
2. service (e.g., auth-service, payment-service)
3. level (one of INFO, WARNING, ERROR, CRITICAL, DEBUG)  (_ASSUMED_)
4. message (string)

Notes:
- lines in log files that do not contain 4 columns of have non parsable data for 
timestamp, level ar ignored. (_ASSUMED_)
- service and message are truncated to 255 characters. (_ASSUMED_)

## Architecture

Todo: add a diagram

## Todos

service
- use an external authentication service like Auth0
- use a proper queue system for uploading and processing log files
- prevent duplicate uploads of the same log file
- do more preprocessing to provide more insights, including pre-aggregation, anomaly detection
- split processing into a separate app which could scale independently from data access
- investigate other storage options, including a mix object store + a fast data store for recent and aggregated data

ui
- add the ability to filter by date range
- provide more interesting visualizations, such as aggregations on multiple axes, 
- hire a UX designer

devx
- figure out why the built app.js throws an error 
- use dev container for testing (instead of sqlite)
- create a CI pipeline
- use a dependency inversion framework


## Running (requires docker) -- NOT WORKING YET

Build the Docker image
```bash
docker build -t logviewer .
```

Create an .env file with the following variables
```
SESSION_SECRET=<a random string for express session management>
DB_USER="postgres" unless a change in the database in init is made
DB_PASSWORD="postgres" unless a change in the database in init is made
DB_URL="postgresql://<DB_USER>:<DB_PASSWORD>@localhost:5432/logviewer"
```

docker compose can then be used to 
1. initialize and run both a postgresql database running on port 5432
2. and the log viewer application on port 3000
```bash
docker compose up -d --env-file ./.env
```

Next, point your browser to http://localhost:3000 to view the application. You will 
notice that you need to authenticated in other to use it. To create a user, you can
use the following curl command:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "<pick a username>", "password": "<pick a password>"}'
```

### Development

Please refer to instructions specific each component:
- [services](./api/README.md)
- [user interface](./ui/README.md)


