# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for TypeScript build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S mcp -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy any additional files needed at runtime
COPY --from=builder /app/LICENSE ./

# Change ownership to non-root user
RUN chown -R mcp:nodejs /app

# Switch to non-root user
USER mcp

# Environment variables with defaults
ENV NODE_ENV=production
ENV PORT=3000
ENV DOCKER_CONTAINER=true
ENV KROKI_URL=http://kroki:8000
ENV KROKI_TIMEOUT=30000
ENV KROKI_MAX_RETRIES=3
ENV KROKI_USE_LOCAL=true
ENV LOG_LEVEL=info
ENV MAX_CODE_LENGTH=5242880

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "process.exit(0)" || exit 1

# Start the application
CMD ["node", "dist/index.js"] 