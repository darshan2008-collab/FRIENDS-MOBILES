FROM node:18-alpine

WORKDIR /app

COPY server/package*.json ./

RUN npm install --production --legacy-peer-deps

COPY server/ ./

EXPOSE 5000

CMD ["node", "server.js"]

