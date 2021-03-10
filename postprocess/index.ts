// merge messages-temp into /messages
import * as fs from "fs";
import * as path from "path";
import { Config, User, Channel, Ims, Repository, Utils, Message } from "./../common";

const repo = new Repository(getConfig());
const dataDir = getConfig().postprocessor.dataDir;

function getConfig() {
  const config = Utils.getConfig(path.resolve("config/config.json"));
  console.log(JSON.stringify(config));
  return config;
}

function readNewMessages(filePath): Message[] {
  return JSON.parse(fs.readFileSync(filePath).toString()).messages;
}

function getTempMessages() {
  return fs.readdirSync(`${dataDir}/messages-temp`).map(file => {
    const channel = /.*_([0-9a-z]+)\.json/i.exec(file)[1];
    return { channel, file: `${dataDir}/messages-temp/${file}` };
  });
}

async function process() {
  await repo.init();
  const newMsgFile = getTempMessages();

  for (const d of newMsgFile) {
    const messages = readNewMessages(d.file);
    if (!messages || messages.length <= 0) {
      continue;
    }
    const ids = messages.map(m => m.ts);
    const existingMessages = await repo.readMessages({ "ts": { $in: ids }, "channel": d.channel });

    // delete old & insert new
    for (const em of existingMessages) {
      await repo.delete(em);
    }
    for (const m of messages) {
      m.channel = d.channel;
      await repo.insert(m);
    }
  }

  await repo.close();
}

process();