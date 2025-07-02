FROM node:18-slim AS builder
WORKDIR /app
COPY package*.json yarn.lock ./ # Copy yarn.lock as well
RUN npm install -g yarn # Install yarn globally
RUN yarn install --production # Install production dependencies with yarn
COPY . .

FROM node:18-slim AS runner
WORKDIR /app
COPY --from=builder /app ./
EXPOSE 4500
CMD ["node", "server.js"] # Or CMD ["yarn", "start"] if your package.json has a "start" script for server.js
