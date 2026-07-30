# Stage 1: High-Performance Frontend Build Stage (Node 18)
FROM node:18-alpine AS build

WORKDIR /app

ENV NODE_ENV=development
ENV NODE_OPTIONS="--max-old-space-size=4096"

COPY package.json ./
RUN npm install --include=dev --legacy-peer-deps

COPY . .
RUN rm -f package-lock.json

# Build React production bundle into /app/dist
RUN npm run build

# Stage 2: Production High-Performance NGINX Web Server
FROM nginx:alpine

RUN apk add --no-cache wget

# Purge default NGINX placeholder template
RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]

