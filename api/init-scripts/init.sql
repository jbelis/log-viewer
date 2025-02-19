-- Switch to postgres user to ensure we have proper permissions
\c postgres postgres

-- Create database if it doesn't exist
DO
$do$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'logviewer') THEN
      CREATE DATABASE logviewer;
   END IF;
END
$do$;

-- Connect to the logviewer database
\c logviewer

-- Create extensions or any other initial setup if needed
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; 