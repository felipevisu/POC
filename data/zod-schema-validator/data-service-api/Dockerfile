FROM node:22-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["sh", "-c", "npx tsx scripts/generate.ts && npx tsx src/server.ts"]
