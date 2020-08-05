FROM node:12.9

COPY yarn.lock .
COPY package.json .
RUN yarn

COPY . .
RUN yarn build

FROM nginx:alpine

ADD nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=0 build/ /web/
