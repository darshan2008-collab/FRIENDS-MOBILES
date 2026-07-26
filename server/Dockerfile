FROM node:18-alpine

WORKDIR /app

COPY package.json ./
COPY server/package.json ./server/package.json

RUN npm install --legacy-peer-deps

COPY server/ ./

EXPOSE 5000

CMD ["node", "server.js"]
