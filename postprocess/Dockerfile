# mount /data

# docker build -t ghcr.io/gabbersepp/slack-crawler-postprocess .

FROM node as builder
COPY package.json package.json
RUN npm install

COPY . .
RUN npm run tsc

FROM node
COPY --from=builder /dist .

CMD node index.js