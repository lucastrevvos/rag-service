FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile || pnpm install

COPY tsconfig.json ./
COPY src ./src

RUN pnpm run build

EXPOSE 3333
CMD ["node", "dist/server.js"]