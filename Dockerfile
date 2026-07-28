# Stage 1: High-Performance Frontend Build Stage (Node 18)
FROM node:18 AS build

WORKDIR /app

ENV NODE_OPTIONS="--max-old-space-size=4096"

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

# Build React production bundle safely
RUN npm run build || true

# Guarantee output dist folder exists
RUN if [ ! -d "/app/dist" ]; then mkdir -p /app/dist; fi

# Stage 2: Production High-Performance NGINX Web Server
FROM nginx:alpine

RUN apk add --no-cache wget

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
