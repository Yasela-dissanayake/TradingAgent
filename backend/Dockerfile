FROM node:20-slim AS builder
WORKDIR /app

# Build context is the repo root, so reference backend/ explicitly
COPY backend/package*.json ./
RUN npm ci

COPY backend/ .
RUN npm run build

# ---
FROM node:20-slim
WORKDIR /app

COPY backend/package*.json ./
RUN npm install --omit=dev

# Copy compiled output from builder stage
COPY --from=builder /app/dist ./dist

CMD ["node", "dist/index.js"]
