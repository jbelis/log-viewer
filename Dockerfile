# Build stage
FROM node:23-alpine AS builder

# Set working directory
WORKDIR /app

# Build UI
WORKDIR /app/ui
COPY ui/*.json .
COPY ui/*.ts .
COPY ui/*.html .
COPY ui/src ./src
RUN npm ci
RUN npm run build 

# Build API
WORKDIR /app/api
COPY api/*.json ./
COPY api/src ./src
RUN npm ci && npm run build && npm prune --production

# Clean up, keeping only necessary files
WORKDIR /app
RUN mv ui/dist ./public && \
    mv api/dist ./dist && mv api/node_modules ./node_modules


# Run stage
FROM node:23-alpine AS runner

# Set working directory
WORKDIR /app

# Step 5: Copy files from the first build stage.
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/public ./public

# Create uploads directory with proper permissions
RUN mkdir -p $WORKDIR/uploads && chown -R node:node $WORKDIR/uploads

# Create non-root user
USER node


# Expose port
EXPOSE 3000

# Set environment variables
#ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["node", "./dist/app.js"] 
