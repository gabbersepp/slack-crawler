FROM gabbersepp/slack-crawler-common as builder
COPY package.json /slack-crawler/server/package.json
WORKDIR /slack-crawler/server
RUN npm install

COPY . .
RUN npm run tsc

FROM node
COPY --from=builder /slack-crawler/server/dist .

CMD node index.js