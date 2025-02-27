FROM node:18-slim

ENV NODE_ENV development

WORKDIR /app

RUN apt-get update && apt-get install -y wget

COPY . .

WORKDIR /app/shared

RUN yarn install

WORKDIR /app

RUN yarn install

CMD [ "yarn", "start" ]

EXPOSE 8000