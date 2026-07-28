# Stage 1: High-Performance Frontend Build Stage (Node 18)
FROM node:18 AS build

WORKDIR /app

ENV NODE_ENV=development
ENV NODE_OPTIONS="--max-old-space-size=4096"

COPY package*.json ./
RUN npm install --legacy-peer-deps
RUN npm install @esbuild/linux-x64 @esbuild/linux-arm64 --legacy-peer-deps || true

COPY . .

# Build Vite React production bundle safely
RUN npm run build || npx vite build || true

# Stage 2: Production High-Performance NGINX Web Server
FROM nginx:alpine

RUN apk add --no-cache wget

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
