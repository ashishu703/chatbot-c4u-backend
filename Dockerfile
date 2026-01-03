FROM node:18-slim AS builder
WORKDIR /app
COPY package*.json yarn.lock ./
#RUN npm install -g yarn # Install yarn globally <-- This line should remain commented or removed
RUN yarn install --production # Install production dependencies with yarn
COPY . .

FROM node:18-slim AS runner
WORKDIR /app
COPY --from=builder /app ./
EXPOSE 1300
CMD ["node", "server.js"]
