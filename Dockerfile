FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production
RUN npx prisma generate --generator client
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/server.js"]