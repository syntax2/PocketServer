
# Stage 1: Build the Next.js application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and lock file
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

# Install dependencies based on the lock file present
# Use --frozen-lockfile for npm/yarn, or --frozen-lockfile equivalent for pnpm
# Adjust based on your package manager
RUN \
  if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Copy the rest of the application code
COPY . .

# Set environment variables for build time (if needed)
# ARG NEXT_PUBLIC_SOME_VAR
# ENV NEXT_PUBLIC_SOME_VAR=$NEXT_PUBLIC_SOME_VAR

# Build the Next.js application for production
RUN npm run build

# Remove development dependencies (optional, reduces image size)
RUN npm prune --production

# Stage 2: Production image
FROM node:18-alpine

WORKDIR /app

# Copy only necessary files from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

# Set environment variables for runtime
# Use ENV for runtime variables
ENV NODE_ENV=production
# Expose the port the app runs on (should match the dev command and docker-compose)
ENV PORT=9002
EXPOSE 9002

# Command to run the application
# Use 'node server.js' if you have a custom server, otherwise 'next start'
# 'next start' uses the port defined by the PORT environment variable
CMD ["npm", "start"]
```