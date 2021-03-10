import * as express from "express";
import * as cors from "cors";
import * as fs from "fs";
import { Config, User, Channel, Ims, Repository, Utils } from "./../common";
import * as path from "path";

const port = 8081;
const repo = new Repository(getConfig());

const app = express.default();
app.use(cors.default());
app.use(express.json());
app.use(express.urlencoded({extended: true}))

function getConfig() {
    const config = Utils.getConfig(path.resolve("config/config.json"));
    console.log(JSON.stringify(config));
    return config;
}

app.get("/slackIds", (req, res) => {
    const userList = readUser();
    const channelList = readChannels();
    const imsList = readIms();

    res.json({
        userList,
        channelList,
        imsList
    });
})

app.get("/ids", async (req, res) => {
    const channels = await repo.readChannels();
    res.json(channels);
})

app.get("/message/:id", (req, res) => {
    const config = getConfig();
    const path = `${config.server.dataDir}/messages/${req.params.id}.json`;
    const users = readUser();

    if (!fs.existsSync(path)) {
        res.sendStatus(404);
        return;
    }

    let content = JSON.parse(fs.readFileSync(path).toString());
    content.forEach(x => {
        const ts = x.ts.split(".").map(x => parseInt(x))
        x.sortCriteria = ts;
        const user = users.find(u => u.id === x.user)
        x.displayUser = user ? user.name : x.user
    })
    content = content.sort((m1, m2) => {
        if (m1.sortCriteria[0] === m2.sortCriteria[0]) {
            return m2.sortCriteria[1] - m1.sortCriteria[1]
        }

        return m2.sortCriteria[0] - m1.sortCriteria[0]
    })
    res.json(content)
})


app.listen(port, () => console.log("listen on port " + port))


function readChannels(): Channel[] {
    const config = getConfig();
    return JSON.parse(fs.readFileSync(`${config.server.dataDir}/channels/channels.json`).toString())
}

function readIms(): Ims[] {
    const config = getConfig();
    return JSON.parse(fs.readFileSync(`${config.server.dataDir}/channels/ims.json`).toString());
}

function readUser(): User[] {
    const config = getConfig();
    const path = `${config.server.dataDir}/users/users.json`;
    return JSON.parse(fs.readFileSync(path).toString())
}