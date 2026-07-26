# Stage 1: Build React Frontend
FROM node:18-alpine AS build

WORKDIR /app

ENV NODE_ENV=development

COPY package*.json ./
RUN npm install --include=dev --legacy-peer-deps

COPY . .

ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

# Stage 2: Production High-Performance NGINX Server
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
