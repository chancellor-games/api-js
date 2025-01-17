FROM node:22-alpine AS base

EXPOSE 3000
RUN mkdir /app
WORKDIR /app

RUN npm install -g pnpm
COPY package.json /app
COPY pnpm-lock.yaml /app

FROM base AS dev

ENV NODE_ENV=development
RUN pnpm install

CMD ["pnpm", "-s", "dev"]

FROM base AS api

ENV NODE_ENV=production
RUN pnpm install

COPY . /app
CMD ["node", "src/index.js"]
