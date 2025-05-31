# Use a specific version of Bun for reproducibility.
FROM oven/bun:1 AS base
WORKDIR /app

# Stage 1: Install dependencies
# This stage is dedicated to installing dependencies to leverage Docker's layer caching.
FROM base AS deps
WORKDIR /app/web
# Copy package.json and bun.lock (as specified in your workspace structure)
# Ensure these files are present in your 'web' directory.
COPY web/package.json web/bun.lock ./
# Install dependencies using Bun.
# Using --frozen-lockfile ensures that the exact versions from bun.lock are installed.
RUN bun install --frozen-lockfile

# Stage 2: Build the application
# This stage builds the Next.js application.
FROM base AS builder
WORKDIR /app
# Copy the entire 'web' directory source code.
COPY web ./web
# Copy the installed node_modules from the 'deps' stage.
COPY --from=deps /app/web/node_modules ./web/node_modules
# Build the Next.js application. This command assumes your package.json has a "build" script.
RUN cd web && bun run build

# Stage 3: Production image
# This stage creates the final, lean production image.
FROM base AS runner
WORKDIR /app/web

ENV NODE_ENV=production
# Optional: Disable Next.js telemetry
# ENV NEXT_TELEMETRY_DISABLED 1

# Copy the built Next.js application artifacts from the 'builder' stage.
COPY --from=builder /app/web/.next ./.next
COPY --from=builder /app/web/public ./public
# Copy package.json and next.config.js, as they are needed by 'next start'.
COPY --from=builder /app/web/package.json ./package.json
COPY --from=builder /app/web/next.config.js ./next.config.js
# Copy node_modules. 'next start' needs 'next' and its dependencies.
COPY --from=builder /app/web/node_modules ./node_modules

# Expose the port Next.js runs on (default is 3000).
EXPOSE 3000
# Set the PORT environment variable, which Next.js respects.
ENV PORT 3000

# Command to run the Next.js application in production mode.
# This assumes your package.json (in the 'web' directory) has a "start" script,
# typically "next start".
CMD ["bun", "run", "start"]
