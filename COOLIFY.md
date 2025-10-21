# Deploying to Coolify

This guide explains how to deploy this application on Coolify with your self-hosted PostgreSQL database.

## Prerequisites

1. A running Coolify instance
2. A PostgreSQL database (self-hosted or managed)
3. Git repository with your code

## Deployment Steps

### 1. Database Preparation

Ensure your PostgreSQL database is:
- Accessible from your Coolify server
- Has a user with proper permissions
- Has SSL enabled if required by your hosting

Example SQL to prepare database:
```sql
CREATE DATABASE autoflow;
CREATE USER autoflow_user WITH PASSWORD 'your-strong-password';
GRANT ALL PRIVILEGES ON DATABASE autoflow TO autoflow_user;
```

### 2. Coolify Configuration

1. Create a new service in Coolify
2. Choose "Docker" as deployment method
3. Connect your Git repository
4. Configure build settings:
   - Build Method: Dockerfile
   - Port: 5000
   - Healthcheck Path: /api/health

### 3. Environment Variables

Set these environment variables in Coolify:

```env
# Required
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:password@your-db-host:5432/dbname

# Security
SESSION_SECRET=generate-a-strong-random-string

# Optional - External Authentication
ISSUER_URL=
CLIENT_ID=
CLIENT_SECRET=
REDIRECT_URI=
```

### 4. Deploy

1. Click "Deploy" in Coolify
2. The application will:
   - Build using the Dockerfile
   - Run database migrations on startup
   - Start the application

### 5. Verify Deployment

1. Check the deployment logs in Coolify
2. Visit the application URL
3. Check /api/health endpoint for system status

### Troubleshooting

1. Database Connection Issues:
   - Verify DATABASE_URL is correct
   - Check if database is accessible from Coolify
   - Ensure proper SSL configuration if required

2. Migration Issues:
   - Check if database user has proper permissions
   - View logs: `docker logs your-container-name`

3. Application Errors:
   - Check application logs in Coolify
   - Verify all required environment variables are set
   - Ensure database schema is properly migrated

### Maintenance

1. Database Backups:
   ```bash
   # From your database server
   pg_dump -U your_user your_database > backup.sql
   ```

2. Updating the Application:
   - Push changes to your repository
   - Redeploy in Coolify

3. Monitoring:
   - Use Coolify's built-in monitoring
   - Check /api/health endpoint
   - Monitor database connections and performance

### Security Notes

1. Always use strong passwords for:
   - Database users
   - SESSION_SECRET
   - Any API keys or secrets

2. Configure SSL/TLS:
   - Use HTTPS in production
   - Enable SSL for database connections if needed

3. Environment Variables:
   - Never commit sensitive values to git
   - Use Coolify's secret management

### Need Help?

- Check Coolify documentation
- Review application logs
- Check database logs
- Ensure all required environment variables are set
