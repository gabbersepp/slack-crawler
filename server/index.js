const express = require("express")
const cors = require('cors')
const fs = require("fs");
const port = 8081

const app = express();
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.get("/slackIds", (req, res) => {
    const config = getConfig();
    const userList = JSON.parse(fs.readFileSync(`${config.server.dataDir}/users/users.json`).toString());
    const channelList = JSON.parse(fs.readFileSync(`${config.server.dataDir}/channels/channels.json`).toString());
    
    res.json({
        userList,
        channelList
    });
})

app.get("/ids", (req, res) => {
    const config = getConfig();
    const ids = fs.readdirSync(`${config.server.dataDir}/messages`).map(file => {
        return /(.*)\.json/.exec(file)[1]
    })
    res.json(ids);
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

function getConfig() {
    return JSON.parse(fs.readFileSync("config/config.json").toString())
}

function readUser() {
    const config = getConfig();
    const path = `${config.server.dataDir}/users/users.json`;
    return JSON.parse(fs.readFileSync(path).toString())
}