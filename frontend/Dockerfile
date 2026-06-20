FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

COPY . .

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]