# Stage 1: Build React Frontend (Debian-based Node 18 for glibc esbuild stability)
FROM node:18-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

# Stage 2: Production High-Performance NGINX Server
FROM nginx:alpine

RUN apk add --no-cache wget

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
