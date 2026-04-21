FROM node:20-slim AS builder
WORKDIR /app

# Install ALL deps (including devDependencies needed for tsc)
COPY package*.json ./
RUN npm ci

# Copy source and compile TypeScript → dist/
COPY . .
RUN npm run build

# ---
FROM node:20-slim
WORKDIR /app

# Only install production deps in the final image
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled output from builder stage
COPY --from=builder /app/dist ./dist

CMD ["node", "dist/index.js"]
