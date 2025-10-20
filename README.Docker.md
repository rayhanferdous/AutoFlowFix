# 🐳 AutoFlow GMS - Docker Deployment Guide

Complete guide to run AutoFlow Garage Management System using Docker.

---

## 📋 Prerequisites

- **Docker** (v20.10 or later)
- **Docker Compose** (v2.0 or later)
- At least **2GB RAM** and **10GB disk space**

### Install Docker

**Ubuntu/Debian:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

**CentOS/RHEL:**
```bash
sudo yum install -y docker docker-compose
sudo systemctl start docker
sudo systemctl enable docker
```

**macOS/Windows:**
Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop)

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd autoflow-gms
```

### 2. Configure Environment
```bash
# Copy example environment file
cp .env.example .env

# Edit with your settings
nano .env
```

**Required Settings:**
- `PGPASSWORD` - Change the default database password
- `SESSION_SECRET` - Generate a random string (use: `openssl rand -hex 32`)

### 3. Start the Application
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### 4. Initialize Database
```bash
# Run database migrations
docker-compose exec app npm run db:push
```

### 5. Access the Application
Open your browser and navigate to:
- **Application:** http://localhost:5000
- **PostgreSQL:** localhost:5432

---

## 🔧 Docker Commands

### Service Management
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# Stop and remove volumes (deletes data!)
docker-compose down -v
```

### Logs and Debugging
```bash
# View all logs
docker-compose logs -f

# View app logs only
docker-compose logs -f app

# View database logs
docker-compose logs -f postgres

# Execute commands in container
docker-compose exec app sh
docker-compose exec postgres psql -U autoflow_user -d autoflow_gms
```

### Database Operations
```bash
# Run migrations
docker-compose exec app npm run db:push

# Backup database
docker-compose exec postgres pg_dump -U autoflow_user autoflow_gms > backup.sql

# Restore database
docker-compose exec -T postgres psql -U autoflow_user autoflow_gms < backup.sql

# Access PostgreSQL shell
docker-compose exec postgres psql -U autoflow_user -d autoflow_gms
```

### Application Updates
```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose up -d --build

# Run migrations after update
docker-compose exec app npm run db:push
```

---

## 📦 Production Deployment

### 1. Using Docker Compose (Simple)

**Step 1:** Configure production environment
```bash
# Edit .env file
nano .env
```

Set production values:
```env
NODE_ENV=production
SESSION_SECRET=<generate-strong-random-string>
PGPASSWORD=<strong-database-password>
```

**Step 2:** Deploy
```bash
docker-compose up -d
```

### 2. Using Docker Swarm (Scalable)

**Initialize Swarm:**
```bash
docker swarm init
```

**Deploy Stack:**
```bash
docker stack deploy -c docker-compose.yml autoflow
```

**Scale Services:**
```bash
docker service scale autoflow_app=3
```

### 3. Behind Reverse Proxy (Nginx/Traefik)

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Traefik Labels (add to docker-compose.yml):**
```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.autoflow.rule=Host(`yourdomain.com`)"
  - "traefik.http.routers.autoflow.entrypoints=websecure"
  - "traefik.http.routers.autoflow.tls.certresolver=letsencrypt"
```

---

## 🔒 Security Best Practices

1. **Change Default Passwords:**
   ```bash
   # Generate strong password
   openssl rand -base64 32
   ```

2. **Use Secrets Management:**
   ```bash
   # Docker secrets (Swarm mode)
   echo "my-secret-password" | docker secret create db_password -
   ```

3. **Limit Exposed Ports:**
   ```yaml
   # In docker-compose.yml, remove port mapping for postgres
   # postgres:
   #   ports:
   #     - "5432:5432"  # Remove this line
   ```

4. **Regular Updates:**
   ```bash
   docker-compose pull
   docker-compose up -d --build
   ```

5. **Enable SSL/TLS:**
   Use reverse proxy with Let's Encrypt or your own certificates

---

## 🗄️ Data Persistence

### Backup Strategy
```bash
# Automated daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T postgres pg_dump -U autoflow_user autoflow_gms | gzip > "backup_${DATE}.sql.gz"

# Keep only last 7 days
find . -name "backup_*.sql.gz" -mtime +7 -delete
```

### Volume Management
```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect autoflow-gms_postgres_data

# Backup volume
docker run --rm -v autoflow-gms_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_data.tar.gz /data

# Restore volume
docker run --rm -v autoflow-gms_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_data.tar.gz -C /
```

---

## 🐛 Troubleshooting

### Application won't start
```bash
# Check logs
docker-compose logs app

# Verify database is ready
docker-compose exec postgres pg_isready -U autoflow_user

# Restart services
docker-compose restart
```

### Database connection errors
```bash
# Check if postgres is running
docker-compose ps postgres

# Test connection
docker-compose exec app sh -c 'echo "SELECT 1" | psql $DATABASE_URL'

# Reset database (WARNING: deletes all data)
docker-compose down -v
docker-compose up -d
```

### Port already in use
```bash
# Find what's using port 5000
lsof -i :5000

# Change port in .env
PORT=3000
```

### Performance issues
```bash
# Check resource usage
docker stats

# Increase resources in Docker Desktop settings
# Or add resource limits to docker-compose.yml:
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 2G
```

---

## 📊 Monitoring

### Health Checks
```bash
# Check service health
docker-compose ps

# Manual health check
curl http://localhost:5000/api/health
```

### Resource Monitoring
```bash
# Real-time stats
docker stats

# Container logs
docker-compose logs --tail=100 -f app
```

---

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /path/to/autoflow-gms
            git pull
            docker-compose up -d --build
            docker-compose exec -T app npm run db:push
```

---

## 📝 Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | production | Yes |
| `PORT` | Application port | 5000 | Yes |
| `PGHOST` | Database host | postgres | Yes |
| `PGPORT` | Database port | 5432 | Yes |
| `PGDATABASE` | Database name | autoflow_gms | Yes |
| `PGUSER` | Database user | autoflow_user | Yes |
| `PGPASSWORD` | Database password | changeme123 | Yes |
| `SESSION_SECRET` | Session encryption key | - | Yes |
| `ISSUER_URL` | OIDC provider URL | - | No |
| `CLIENT_ID` | OIDC client ID | - | No |
| `CLIENT_SECRET` | OIDC client secret | - | No |

---

## 🎯 Next Steps

1. **Configure SSL/TLS** - Set up reverse proxy with SSL
2. **Set up backups** - Implement automated backup schedule
3. **Configure monitoring** - Add Prometheus/Grafana
4. **Scale horizontally** - Use Docker Swarm or Kubernetes
5. **Add CI/CD** - Automate deployments

---

## 📞 Support

For issues or questions:
- Check logs: `docker-compose logs -f`
- Review [Docker documentation](https://docs.docker.com/)
- Open an issue in the repository

---

**Note:** This Docker setup is production-ready but remember to:
- Change all default passwords
- Use strong SESSION_SECRET
- Configure proper backups
- Set up SSL/TLS for HTTPS
- Monitor resource usage
