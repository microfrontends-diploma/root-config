FROM node:16.20-alpine3.16

WORKDIR /app

COPY package*.json yarn.lock ./

RUN yarn install

COPY . .

EXPOSE 9000

CMD ["yarn", "start"]