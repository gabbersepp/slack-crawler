FROM gabbersepp/slack-crawler-common as builder
COPY package.json /slack-crawler/postprocess/package.json
WORKDIR /slack-crawler/postprocess
RUN npm install

COPY . .
RUN npm run tsc

FROM node
COPY --from=builder /slack-crawler/postprocess/dist .
COPY --from=builder /slack-crawler/postprocess/package.json /postprocess/package.json
COPY --from=builder /slack-crawler/common/package.json /common/package.json

WORKDIR /common
RUN npm install --production

WORKDIR /postprocess
RUN npm install --production
CMD node index.js