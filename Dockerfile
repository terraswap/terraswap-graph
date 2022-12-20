FROM node:lts-alpine as builder

WORKDIR /app

RUN apk add --no-cache make gcc g++ python3
COPY package.json package-lock.json ./

RUN npm ci --prod
RUN npm i --save-dev ts-node

FROM node:lts-alpine
RUN apk add --no-cache git
WORKDIR /app

COPY --from=builder /app .
COPY . .

ENTRYPOINT ["npm", "run"]
CMD ["dashboard"]
