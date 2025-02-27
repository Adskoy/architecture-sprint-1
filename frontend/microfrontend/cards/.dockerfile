FROM node:18-slim

ENV NODE_ENV development

WORKDIR /app

RUN apt-get update && apt-get install -y wget

COPY ./cards ./cards
COPY ./shared ./shared

WORKDIR /app/shared

RUN yarn install

WORKDIR /app/cards

RUN yarn install

CMD [ "yarn", "start" ]

EXPOSE 8003