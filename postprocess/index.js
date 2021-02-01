// merge messages-temp into /messages
const fs = require("fs");
const messageData = {};

function getConfig() {
  return JSON.parse(fs.readFileSync("config/config.json").toString())
}

const dataDir = getConfig().dataDir;

if (!fs.existsSync(`${dataDir}/messages`)) {
  fs.mkdirSync(`${dataDir}/messages`)
}

fs.readdirSync(`${dataDir}/messages`).map(file => {
  file = `${dataDir}/messages/${file}`;
  const messages = JSON.parse(fs.readFileSync(file).toString());
  const channel = /.*?([0-9a-z]+)\.json/i.exec(file)[1]
  messageData[channel] = messages;
})

fs.readdirSync(`${dataDir}/messages-temp`).map(file => {
  var filePath = `${dataDir}/messages-temp/${file}`;
  const channel = /.*_([0-9a-z]+)\.json/i.exec(file)[1]
  const messages = messageData[channel] || [];
  messageData[channel] = messages;
  const tempMessages = JSON.parse(fs.readFileSync(filePath).toString()).messages
  const newMessages = tempMessages.filter(m => !messages.find(m2 => m2.ts == m.ts))
  console.log(`write ${newMessages.length} new messages`)
  messages.push(...newMessages)
  fs.rmSync(filePath)
  fs.writeFileSync(`${dataDir}/messages/${channel}.json`, JSON.stringify(messages)) 
})