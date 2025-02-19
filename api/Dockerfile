# Build stage
FROM node:23-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Remove dev dependencies
RUN npm prune --production


# Run stage
FROM node:23-alpine

# Set working directory
WORKDIR /app

# Create uploads directory with proper permissions
RUN mkdir -p /app/uploads && chown -R node:node /app/uploads

# Create non-root user
USER node

# Copy built assets from builder
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/package*.json ./

# Expose port
EXPOSE 3000

# Set environment variables
#ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["node", "dist/app.js"] 