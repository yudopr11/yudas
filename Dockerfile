FROM node:18-alpine as builder

WORKDIR /app

# Copy package files and npmrc
COPY package*.json .npmrc ./

# Install dependencies with specific flags
RUN npm config set legacy-peer-deps true && \
    npm config set fetch-retry-maxtimeout 60000 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set network-timeout 300000 && \
    npm install --no-optional

# Copy the rest of the app
COPY . .

# Run the build
RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

# Copy built assets from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Install only production dependencies
RUN npm install --omit=dev --no-optional --ignore-scripts

# Expose the port
EXPOSE 3000

# Start the app
CMD ["npm", "run", "preview"] 