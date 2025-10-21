Deploying AutoFlow GMS to Coolify (with an external Postgres)

This document explains how to deploy this repository to Coolify and connect it to a self-hosted PostgreSQL instance.

Summary:
- Build a Docker image that Coolify will run.
- Provide an external Postgres DATABASE_URL (self-hosted) via Coolify environment variables / secrets.
- Ensure migrations are run after deployment (drizzle-kit push).

1) Prepare repository
- Ensure your repo contains a Dockerfile (this project does). Coolify will build the Docker image using that Dockerfile.

2) External Postgres (self-hosted)
- Provision PostgreSQL on your hosting provider.
- Open port 5432 (or the port you choose) to the Coolify host IPs / allow connections from your Coolify server.
- Create database and user, e.g.:
  - CREATE DATABASE autoflow_gms;
  - CREATE USER autoflow_user WITH PASSWORD 'strong-password';
  - GRANT ALL PRIVILEGES ON DATABASE autoflow_gms TO autoflow_user;

- Connection string example (set this as COOLIFY secret or environment variable named DATABASE_URL):
  postgresql://autoflow_user:strong-password@your-db-host.example.com:5432/autoflow_gms

- If your Postgres requires SSL (hosted providers typically do), add ?sslmode=require to the URL:
  postgresql://user:pass@host:5432/dbname?sslmode=require

3) Coolify app setup
- In Coolify, create a new "App" and connect your repository (GitHub/GitLab/remote URL).
- Set build method to "Dockerfile" and leave the default build context (/).
- Set environment variables / secrets in the Coolify UI (these will be provided to the container):
  - NODE_ENV=production
  - PORT=5000
  - DATABASE_URL=postgresql://... (your DB connection string)
  - SESSION_SECRET=<strong-random-string>
  - (Optional) ISSUER_URL, CLIENT_ID, CLIENT_SECRET, REDIRECT_URI if you use OIDC

4) Database migrations
- After the first deployment, run migrations using Drizzle:
  - Option A (recommended): Run a one-off task in Coolify to execute `npm run db:push` inside the container (make sure env var DATABASE_URL is set).
  - Option B: Run migrations locally (or from a CI) against the remote DATABASE_URL:
      DATABASE_URL="postgresql://..." npm run db:push

5) Persistent storage and uploads
- If the app stores files locally, configure an external S3-compatible storage and set environment variables accordingly. This project doesn't currently include S3 wiring; prefer storing large files externally.

6) Health checks
- Coolify will detect the container health via exposed port. Ensure `PORT` is set to 5000 and the app responds on /api/health.

7) Troubleshooting
- Connection refused: verify network/port and Postgres listen/pg_hba.conf settings allow connections from the Coolify server IP.
- SSL/TLS errors: add `?sslmode=require` to the DATABASE_URL and ensure your Postgres server supports SSL.
- Migrations fail: check that the DATABASE_URL user has CREATE and ALTER privileges.

8) Post-deploy tasks
- Run `npm run db:push` once after deploy.
- Restart the app if you change environment variables.

If you'd like, I can also:
- Add a small Health endpoint file or readiness probe tweaks
- Create a lightweight one-off script to run migrations automatically during startup (optional but I can implement it)

