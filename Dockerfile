FROM oven/bun:1.2.22 AS base

WORKDIR /app

COPY package.json bun.lock prisma.config.ts tsconfig.json biome.json vitest.config.ts ./
COPY prisma ./prisma

RUN bun install --frozen-lockfile
RUN bun run db:generate

COPY src ./src

RUN bun run build

ENV NODE_ENV=production
EXPOSE 4000

CMD ["bun", "src/index.ts"]
