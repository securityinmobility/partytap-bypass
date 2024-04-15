FROM node:18 AS build

WORKDIR /opt/
COPY package.json package-lock.json ./
RUN npm install
COPY main.js .
RUN node_modules/browserify/bin/cmd.js main.js -p esmify -o bundle.js



FROM nginx

WORKDIR /usr/share/nginx/html
COPY index.html .
COPY --from=build /opt/bundle.js .
COPY --from=build /opt/node_modules/qr-scanner/qr-scanner-worker.min.js .
