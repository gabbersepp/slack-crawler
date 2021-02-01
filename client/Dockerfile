
FROM node as build
WORKDIR /app
COPY app/package.json package.json
RUN npm install

COPY app/ /app
RUN npm run build

FROM nginx
COPY --from=build /app/dist /usr/share/nginx/html