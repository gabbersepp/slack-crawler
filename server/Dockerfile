FROM gabbersepp/slack-crawler-common as builder
COPY package.json /slack-crawler/server/package.json
WORKDIR /slack-crawler/server
RUN npm install

COPY . .
RUN npm run tsc

FROM node
COPY --from=builder /slack-crawler/server/dist .
COPY --from=builder /slack-crawler/server/package.json /server/package.json
COPY --from=builder /slack-crawler/common/package.json /common/package.json

WORKDIR /common
RUN npm install --production

WORKDIR /server
RUN npm install --production
CMD node Index.js