# Stage 1: Dependency installation
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy dependency manifests
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Stage 2: Production release
FROM node:20-alpine

# Set environment to production
ENV NODE_ENV=production
ENV PORT=5000

WORKDIR /usr/src/app

# Copy production node_modules from builder stage
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Copy package manifests and application code
COPY package*.json ./
COPY . .

# Expose backend port
EXPOSE 5000

# Use non-root user for runtime safety
USER node

# Run application with optimized Node.js V8 memory limit (450MB) to prevent OOM on 2GB VPS
CMD ["node", "--max-old-space-size=450", "server.js"]
