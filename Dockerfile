# --- build stage --------------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install --no-audit --no-fund --loglevel=error
COPY tsconfig.json esbuild.config.mjs ./
COPY src ./src
RUN npm run build

# --- runtime stage ------------------------------------------------------
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000

RUN apk add --no-cache tini curl \
    && addgroup -S kira -g 1001 \
    && adduser  -S kira -u 1001 -G kira

COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund --loglevel=error \
    && npm cache clean --force

COPY --from=build /app/dist ./dist

USER kira
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -fsS http://127.0.0.1:3000/api/health || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/server.js"]
