// merge messages-temp into /messages
import * as fs from "fs";
import * as path from "path";
import { Config, User, Channel, Ims, Repository, Utils, Message } from "../common/Index";

const repo = new Repository(getConfig());
const dataDir = getConfig().postprocessor.dataDir;

function getConfig() {
  const config = Utils.getConfig(path.resolve("config/config.json"));
  return config;
}

function readNewMessages(filePath): Message[] {
  return JSON.parse(fs.readFileSync(filePath).toString()).messages;
}

function getTempMessages(partialDir) {
  return fs.readdirSync(`${dataDir}/${partialDir}`).map(file => {
    const channel = /.*_([0-9a-z]+)\.json/i.exec(file)[1];
    return { channel, file: `${dataDir}/${partialDir}/${file}` };
  });
}

function readAdditionalData() {
  const channels = JSON.parse(fs.readFileSync(`${dataDir}/channels/channels.json`).toString()) as Channel[];
  const ims = JSON.parse(fs.readFileSync(`${dataDir}/channels/ims.json`).toString()) as Ims[];
  const users = JSON.parse(fs.readFileSync(`${dataDir}/users/users.json`).toString()) as User[];

  return {
    channels,
    ims,
    users
  }
}

async function processMessages(partialDir) {
  const newMsgFile = getTempMessages(partialDir);

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
      await repo.insertMessage(m);
    }

    fs.unlinkSync(d.file);
  }
}

async function processData() {
  const data = readAdditionalData();
  const existingChannels = await repo.readChannels();
  const existingUsers = await repo.readUsers();
  const existingIms = await repo.readIms();
  
  const newChannels = data.channels.filter(localC => !existingChannels.find(ec => ec.id === localC.id));
  const newUsers = data.users.filter(localU => !existingUsers.find(eu => eu.id === localU.id));
  const newIms = data.ims.filter(localI => !existingIms.find(ei => ei.id === localI.id));
  
  for (const nc of newChannels) {
    await repo.insertChannel(nc);
  }

  for (const nu of newUsers) {
    await repo.insertUser(nu);
  }

  for (const ni of newIms) {
    await repo.insertIms(ni);
  }
}

async function processAll() {
  await repo.init();
  await processData();
  await processMessages("messages-temp");
  await processMessages("threads-temp");
  return repo.close();
}

processAll();