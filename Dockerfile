FROM node:18-alpine
WORKDIR /app
COPY app/package*.json ./
RUN npm install --only=production
COPY app/ ./
RUN chown -R node:node /app
EXPOSE 3000
USER node
CMD ["node", "server.js"]
