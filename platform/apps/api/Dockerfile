FROM node:22-bookworm-slim AS build
WORKDIR /workspace

COPY platform/package.json ./package.json
COPY platform/apps/api/package.json ./apps/api/package.json
COPY platform/apps/storefront/package.json ./apps/storefront/package.json
RUN npm install --workspace @neweix/shop-api --include-workspace-root=false

COPY platform/apps/api ./apps/api
RUN npm run build --workspace @neweix/shop-api
RUN npm prune --omit=dev --workspace @neweix/shop-api --include-workspace-root=false

ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

USER node
CMD ["node", "apps/api/dist/main.js"]
