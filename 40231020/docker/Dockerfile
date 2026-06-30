# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY backend/package*.json ./
RUN npm ci --only=production

# Stage 2: Production
FROM node:18-alpine

WORKDIR /app

# Copy built files
COPY --from=builder /app/node_modules ./node_modules
COPY backend/ ./backend/

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "backend/src/index.js"]
