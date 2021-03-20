FROM node
COPY common/package.json /slack-crawler/common/package.json
WORKDIR /slack-crawler/common
RUN npm install

COPY common /slack-crawler/common
COPY tsconfig-base.json /slack-crawler/tsconfig-base.json
WORKDIR /slack-crawler/common
RUN npm run tsc
