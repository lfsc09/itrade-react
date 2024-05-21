FROM node:latest as react
WORKDIR /app/code
COPY package.json .
COPY package-lock.json .
RUN npm install --silent
COPY . .
RUN npm run build
RUN mv ./build ..

FROM nginx:alpine
VOLUME /var/cache/nginx
COPY --from=react app/build /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf