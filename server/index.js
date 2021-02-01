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
    if (!fs.existsSync(path)) {
        res.sendStatus(404);
        return;
    }

    const content = JSON.parse(fs.readFileSync(path).toString());
    res.json(content)
})


app.listen(port, () => console.log("listen on port " + port))

function getConfig() {
    return JSON.parse(fs.readFileSync("config/config.json").toString())
}