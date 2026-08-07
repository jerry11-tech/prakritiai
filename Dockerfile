# ---------- Build stage ----------
FROM node:20-alpine AS build

# Install pnpm (corepack is bundled but may be deprecated; use explicit).
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

WORKDIR /app

# Copy workspace manifests first for better layer caching.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY src/frontend/package.json ./src/frontend/package.json
COPY src/frontend/index.html ./src/frontend/index.html
COPY src/frontend/vite.config.js ./src/frontend/vite.config.js
COPY src/frontend/postcss.config.js ./src/frontend/postcss.config.js
COPY src/frontend/tailwind.config.js ./src/frontend/tailwind.config.js
COPY src/frontend/tsconfig.json ./src/frontend/tsconfig.json
COPY src/frontend/components.json ./src/frontend/components.json
COPY src/frontend/env.json ./src/frontend/env.json

# Install all workspace dependencies.
RUN pnpm install --no-frozen-lockfile

# Copy the actual source and build.
COPY src/frontend/src ./src/frontend/src
COPY src/frontend/public ./src/frontend/public
RUN pnpm --filter @caffeine/template-frontend build

# ---------- Runtime stage ----------
FROM node:20-alpine AS runtime

WORKDIR /app

# Only the compiled assets, static server, and the server entrypoint are needed.
COPY --from=build /app/src/frontend/dist ./dist
COPY server.mjs ./server.mjs
COPY src/frontend/env.json ./env.json

ENV NODE_ENV=production

EXPOSE 4173

# Railway injects $PORT at runtime; default 4173 for local runs.
CMD ["node", "server.mjs"]
