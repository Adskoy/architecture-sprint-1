FROM node:18-slim

ENV NODE_ENV development

WORKDIR /app

RUN apt-get update && apt-get install -y wget

COPY ./profile ./profile
COPY ./shared ./shared

WORKDIR /app/shared

RUN yarn install

WORKDIR /app/profile

RUN yarn install

CMD [ "yarn", "start" ]

EXPOSE 8002