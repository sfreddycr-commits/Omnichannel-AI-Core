# --- build stage --------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests first to maximise Docker layer cache
COPY package.json ./
COPY bun.lock* ./

# Install all deps (dev deps needed for vite + esbuild)
RUN npm install --no-audit --no-fund --loglevel=error

# Copy source code
COPY . .

# Build: Vite static assets + server.cjs (esbuild bundle, node runtime)
RUN npm run build

# Drop dev deps to slim node_modules for the runtime stage
RUN npm prune --omit=dev

# --- runtime stage ------------------------------------------------------
FROM node:20-alpine AS runtime

WORKDIR /app

RUN apk add --no-cache tini curl \
    && addgroup -S wiazart -g 1001 \
    && adduser  -S wiazart -u 1001 -G wiazart

ENV NODE_ENV=production \
    PORT=3000

# Copy exactly what the runtime needs
COPY --from=builder /app/dist         ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

USER wiazart

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -fsS http://127.0.0.1:3000/api/health || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/server.cjs"]
