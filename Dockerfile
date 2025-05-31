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
# This stage creates the final, lean production image using Next.js standalone output.
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Optional: Disable Next.js telemetry
# ENV NEXT_TELEMETRY_DISABLED 1

# Copy the standalone Next.js server output from the 'builder' stage.
# This includes a minimal server and only the necessary node_modules.
COPY --from=builder /app/web/.next/standalone ./web
# Copy the static assets (public folder and .next/static)
COPY --from=builder /app/web/public ./web/public
COPY --from=builder /app/web/.next/static ./web/.next/static

# Expose the port Next.js runs on (default is 3000).
EXPOSE 3000
# Set the PORT environment variable, which Next.js respects.
ENV PORT 3000

# Command to run the Next.js standalone server.
# Note: The entrypoint is now server.js inside the standalone output directory.
# We use bun to run it, though node could also be used.
CMD ["bun", "web/server.js"]
