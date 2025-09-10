FROM node:18.18-alpine as BUILD_IMAGE
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --production

FROM node:18.18-alpine
WORKDIR /app
COPY --from=BUILD_IMAGE /app/package.json ./package.json
COPY --from=BUILD_IMAGE /app/node_modules ./node_modules
COPY --from=BUILD_IMAGE /app/.next ./.next
COPY --from=BUILD_IMAGE /app/public ./public
EXPOSE 3000
CMD ["npm", "start"]
