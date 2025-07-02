    FROM node:18-slim AS builder
    WORKDIR /app
    COPY package*.json ./
    RUN npm ci --omit=dev
    COPY . .
    
    FROM node:18-slim AS runner
    WORKDIR /app
    COPY --from=builder /app ./
    EXPOSE 4500
    CMD ["node", "server.js"]
