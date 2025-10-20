#!/bin/bash

# AutoFlow GMS - Docker Quick Start Script
# This script helps you get started with Docker deployment

set -e

echo "🚀 AutoFlow GMS - Docker Setup"
echo "================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from example..."
    cp .env.example .env
    
    # Generate random SESSION_SECRET
    if command -v openssl &> /dev/null; then
        SESSION_SECRET=$(openssl rand -hex 32)
        sed -i.bak "s/your-super-secret-random-string-change-this-in-production/$SESSION_SECRET/" .env
        rm .env.bak 2>/dev/null || true
        echo "✅ Generated random SESSION_SECRET"
    else
        echo "⚠️  Please set SESSION_SECRET in .env file manually"
    fi
    
    echo "⚠️  IMPORTANT: Edit .env file and set your database password!"
    echo "   Default password 'changeme123' is NOT secure for production."
    echo ""
    read -p "Press Enter to continue or Ctrl+C to exit and edit .env first..."
fi

echo ""
echo "🐳 Starting Docker containers..."
docker-compose up -d

echo ""
echo "⏳ Waiting for database to be ready..."
sleep 5

# Wait for postgres to be healthy
until docker-compose exec -T postgres pg_isready -U autoflow_user &> /dev/null; do
    echo "   Waiting for PostgreSQL..."
    sleep 2
done

echo "✅ Database is ready"
echo ""

echo "🗄️  Running database migrations..."
docker-compose exec -T app npm run db:push

echo ""
echo "================================"
echo "✅ AutoFlow GMS is now running!"
echo "================================"
echo ""
echo "📍 Application URL: http://localhost:5000"
echo "📍 PostgreSQL: localhost:5432"
echo ""
echo "🔧 Useful commands:"
echo "   View logs:        docker-compose logs -f"
echo "   Stop services:    docker-compose down"
echo "   Restart:          docker-compose restart"
echo ""
echo "📖 For more information, see README.Docker.md"
echo ""
