FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies for build
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built app and runtime files
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.mjs ./

# Ensure data file exists for runtime persistence
RUN printf '{"users":{},"logins":{},"sessions":{}}' > data.json

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
