FROM node:22-alpine
RUN apk add --no-cache openssl

EXPOSE 3000

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY apps/OnlyBundles-app/package.json ./apps/OnlyBundles-app/package.json
COPY apps/OnlyBundles-app/extensions/bundle-checkout-ui/package.json ./apps/OnlyBundles-app/extensions/bundle-checkout-ui/package.json
COPY apps/OnlyBundles-app/extensions/bundle-discount-function/package.json ./apps/OnlyBundles-app/extensions/bundle-discount-function/package.json
COPY apps/OnlyBundles-app/extensions/bundle-product-configuration/package.json ./apps/OnlyBundles-app/extensions/bundle-product-configuration/package.json
COPY apps/OnlyBundles-app/extensions/wolfpack-utm-pixel/package.json ./apps/OnlyBundles-app/extensions/wolfpack-utm-pixel/package.json
COPY apps/OnlyBundles-website/package.json ./apps/OnlyBundles-website/package.json
COPY apps/OnlyBundles-app/scripts/install-git-hooks.mjs ./apps/OnlyBundles-app/scripts/install-git-hooks.mjs

RUN npm ci --omit=dev && npm cache clean --force
# Remove CLI packages since we don't need them in production by default.
# Remove this line if you want to run CLI commands in your container.
RUN npm remove @shopify/cli

COPY . .

RUN npm run app:build

CMD ["npm", "run", "docker-start"]
