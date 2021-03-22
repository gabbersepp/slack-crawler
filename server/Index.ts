import * as express from "express";
import * as cors from "cors";
import * as fs from "fs";
import { Config, User, Channel, Ims, Repository, Utils, Message, SlackFile, File } from "../common/Index";
import * as path from "path";
import emojis from "./emoji.json";

const port = 8081;

const app = express.default();
app.use(cors.default());
app.use(express.json());
app.use(express.urlencoded({extended: true}))

function getConfig() {
    const config = Utils.getConfig(path.resolve("config/config.json"));
    return config;
}

const repo = new Repository(getConfig());

app.get("/slackIds", async (req, res) => {
    const userList = await repo.readUsers();
    const channelList = await repo.readChannels();
    const imsList = await repo.readIms();

    res.json({
        userList,
        channelList,
        imsList
    });
})

async function extendMessages(messages:  Message[]) {
    const users = await repo.readUsers();
    const ims = await repo.readIms();
    const channels = await repo.readChannels();

    messages.forEach(x => {
        const ts = x.ts.split(".").map(split => parseInt(split, 10));
        x.sortCriteria = ts;
        const user = users.find(u => u.id === x.user);
        const im = ims.find(i => i.id === x.channel);
        const imUser = im ? users.find(u => u.id === im.user) : null;
        const channel = channels.find(c => c.id === x.channel);
        x.displayUser = user ? user.name : x.user;
        x.displayTarget = ((imUser || channel) || {}).name;
        x.isIm = !!imUser;
        x.text = convertEmojis(x.text);

        x.text = convertTags(x.text, x, users);
    });

    messages = messages.sort((m1, m2) => {
        if (m1.sortCriteria[0] === m2.sortCriteria[0]) {
            return m2.sortCriteria[1] - m1.sortCriteria[1]
        }

        return m2.sortCriteria[0] - m1.sortCriteria[0]
    })

    return messages;
} 

function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function convertEmojis(value: string) {
    const regexp = /:([^ :]+):/;
    let match = regexp.exec(value);
    while (match != null) {
        const emoji =  emojis[match[1]];
        // remove :...: otherwise the loop will never end
        value = value.replace(new RegExp(`${escapeRegExp(match[0])}`, "g"), emoji || match[1])

        match = regexp.exec(value);
    }
    return value;
}

function convertTags(value: string, msg: Message, users: User[]) {
    value = value.replace("<!channel>", "<span class='channel-marker'>@channel</span>");

    if (msg.blocks) {
        const block = msg.blocks.find(x => x.type === "rich_text");
        if (block && block.elements) {
            const element = block.elements.find(x => x.type === "rich_text_section");
            if (element) {
                element.elements.forEach(e => {
                    if (e.type === "user") {
                        const user = users.find(x => x.id === e.user_id);
                        if (user) {
                            value = value.replace(`<@${e.user_id}>`, `<span class='user-marker'>@${user.name}</span>`)
                        }
                    }
                })
            }
        }
    }

    if (msg.files && msg.files.length > 0) {
        msg.files.forEach(file => {
            if (file.mimetype.indexOf("image") >= 0) {
                value = `
                ${value}</br>
                <div class="image_full_view"><img src="http://localhost:${port}/file/${file.id}/${file.created}/thumb_360"></div>
                `
            } else {
                value = `
                ${value}
                </br>
                <div class="download_link"><a target="_blank" href="http://localhost:${port}/file/${file.id}/${file.created}">${file.name}</a></div>
                `
            }
        })
    }

    return value;
}

app.post("/message/search", async (req, res) => {
    try {
        const searchValue = req.body.search;
        let messages = await repo.searchMessages(searchValue);
        messages = await extendMessages(messages);
        res.json(messages);
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    }
});

// read only parent messages, no threads
app.get("/message/:id", async (req, res) => {
    let messages = await repo.readMessages({ "channel": req.params.id, $or: [{ "reply_count": { $exists: true } }, {"thread_ts": { $exists: false }  }] });
    if (messages.length === 0) {
        res.sendStatus(404);
        return;
    }
    
    messages = await extendMessages(messages);
    res.json(messages);
});

app.get("/thread/:channel/:threadTs", async (req, res) => {
    let messages = await repo.readMessages({ "channel": req.params.channel, "reply_count": { $exists: false }, "thread_ts":req.params.threadTs });
    if (messages.length === 0) {
        res.sendStatus(404);
        return;
    }
    
    messages = await extendMessages(messages);
    res.json(messages);
});

app.post("/fileinfos", async (req, res) => {
    const files = req.body as Partial<File>[];
    const query = files.map(f => ({ id: f.id, created: f.created }));
    const fileInfos = await repo.readFiles({ $or: query }, { id: true, created: true });
    res.json(fileInfos);
});

app.get("/file/:id/:created/:suffix?", async (req, res) => {
    const id = req.params.id;
    const created = parseInt(req.params.created, 10);
    const query = { id, created } as any;

    if (req.params.suffix) {
        query.suffix = req.params.suffix;
    }

    const files = await repo.readFiles(query);
    if (files.length > 0) {
        const messages = await repo.readMessages({ "files": { $elemMatch: { id, created } } });
        const slackFile: SlackFile = messages[0].files.find(x => x.id === id);
        const mimeType = slackFile.mimetype;
        if (mimeType.indexOf("image") <= -1) {
            res.set("Content-Disposition",  `attachment; filename="${slackFile.name}"`);
        }
        res.set('Content-Type', mimeType);
        res.end(new Buffer(files[0].content.buffer));
    } else {
        res.sendStatus(404);
    }
})


app.listen(port, async () => {
    console.log("listen on port " + port);
    await repo.init();
})