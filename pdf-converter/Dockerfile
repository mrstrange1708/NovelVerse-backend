FROM node:20-slim

# Install poppler-utils (pdftoppm, pdftotext)
RUN apt-get update && apt-get install -y poppler-utils && apt-get clean

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENTRYPOINT ["node", "convert-all.js"]