import * as fs from "fs";

import { Config, User, Channel, Ims, Repository, Utils, Message } from "./../common";

const dataDir = "\\\\biehler.speedport.ip\\sambashare\\slack-crawler";
const repo = new Repository(JSON.parse(fs.readFileSync("config/config.json").toString()) as Config);

function readMessages(filePath): Message[] {
    return JSON.parse(fs.readFileSync(filePath).toString());
}
  
function getAllMessageFiles() {
    return fs.readdirSync(`${dataDir}/messages`).map(file => {
        const channel = /([0-9a-z]+)\.json/i.exec(file)[1];
        return { channel, file: `${dataDir}/messages/${file}` };
    });
}

async function migrateMessages() {
    await repo.init();
    const messages = getAllMessageFiles().map(x => ({
        channel: x.channel,
        messages: readMessages(x.file)
    }));
    
    console.log(`processing ${messages.length} files`);

    messages.forEach(m => m.messages.forEach(m2 => m2.channel = m.channel));
    
    for (const d of messages) {
        for (const m of d.messages) {
            await repo.insertMessage(m);
        }
    }

    await repo.close();
}

migrateMessages();