FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --no-audit --no-fund
COPY . .
EXPOSE 5011
CMD ["node", "src/index.js"]
