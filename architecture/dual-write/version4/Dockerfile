FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY index.js outbox-consumer.js ./
USER node
CMD ["node", "index.js"]
