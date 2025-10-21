#!/bin/sh

echo "Running database migrations..."
npm run db:push

echo "Starting the application..."
exec npm start