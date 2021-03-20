FROM gabbersepp/slack-crawler-common as builder
COPY package.json /slack-crawler/postprocess/package.json
WORKDIR /slack-crawler/postprocess
RUN npm install

COPY . .
RUN npm run tsc

FROM node
COPY --from=builder /slack-crawler/postprocess/dist .

CMD node index.js