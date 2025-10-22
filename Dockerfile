# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies) for build
# Set NODE_ENV=development to ensure devDependencies are installed
ENV NODE_ENV=development
# Use `npm install` instead of `npm ci` so the image build succeeds even when
# package-lock.json isn't in sync with package.json (common during rapid edits).
RUN npm install --legacy-peer-deps --no-audit --no-fund

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
ENV NODE_ENV=production \
    NODE_OPTIONS="--enable-source-maps --max-old-space-size=8192"

# Use npm install in production image to avoid failing when lockfile is out of sync.
# In CI/CD you should prefer keeping package-lock.json in sync and using `npm ci`.
RUN npm install --omit=dev --no-audit --no-fund

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Expose port (matches your server configuration)
EXPOSE 5000

# Health check using curl with better error reporting
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
    CMD node -e "require('http').get('http://127.0.0.1:5000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1


# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the production application with better error logging and proper path
CMD ["node", "--trace-warnings", "--unhandled-rejections=strict", "dist/server.js"]