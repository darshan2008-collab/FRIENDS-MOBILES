FROM node:18-alpine

RUN apk add --no-cache wget

WORKDIR /app

COPY package*.json ./

RUN npm install --production --legacy-peer-deps

COPY . .

EXPOSE 5000 5001

CMD ["node", "server.js"]
