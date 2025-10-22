# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
# Set NODE_ENV=development to ensure devDependencies are installed
ENV NODE_ENV=development
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install curl and dumb-init
RUN apk add --no-cache dumb-init curl

# Copy package files
COPY package*.json ./

# Install production dependencies only
ENV NODE_ENV=production
RUN npm ci --only=production

# Copy built application from builder stage
# Both dist/index.js (server) and dist/public (client) should be here
COPY --from=builder /app/dist ./dist

# Expose port (matches your server configuration)
EXPOSE 5000

# Health check using curl with better error reporting
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl --max-time 3 -f http://127.0.0.1:5000/api/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the production application with better error logging
CMD ["node", "--trace-warnings", "--unhandled-rejections=strict", "dist/prod-server.js"]