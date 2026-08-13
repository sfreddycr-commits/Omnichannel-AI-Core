# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package.json ./
COPY bun.lock* ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build Vite static assets
RUN npm run build

# Production stage using Nginx
FROM nginx:alpine AS runner

# Copy built dist folder from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom Nginx config to handle SPA client-side routing and fallback
RUN echo 'server { \
    listen 3000; \
    listen 80; \
    server_name _; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 3000
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
