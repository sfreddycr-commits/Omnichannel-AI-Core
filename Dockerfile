# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package.json bun.lock* ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build Vite static assets and esbuild server bundle
RUN npm run build

# Production stage using Node 20 Alpine
FROM node:20-alpine AS runner

WORKDIR /app

# Install tini for init process management
RUN apk add --no-cache tini

# Copy package metadata and install production dependencies
COPY package.json ./
RUN npm install --only=production

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Use non-root user
USER node

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/server.cjs"]

