
FROM gabbersepp/slack-crawler-common as build
WORKDIR /slack-crawler/client/app
COPY app/package.json package.json
COPY app/package-lock.json package-lock.json

RUN npm install

COPY app/ .
RUN npm run build-docker

FROM nginx
COPY --from=build /slack-crawler/client/app/dist /usr/share/nginx/html