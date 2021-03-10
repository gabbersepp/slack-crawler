import Config, { MongoConfig } from "common/contracts/Config";
import { Db, MongoClient, ObjectID } from "mongodb";
import Message from "../contracts/Message";
import { distinct, getConfig } from "./Utils";

export default class Repository {
    private config: Config;
    private get mongo(): MongoConfig { return this.config.mongo }
    private get url() { return `mongodb://${this.mongo.user}:${this.mongo.pw}@${this.mongo.server}:27017/slack`; }
    private client: MongoClient;
    private db: Db;

    constructor(conf: Config) {
        this.config = conf;
    }

    public async init(retryCount: number = 2) {
        try {
            this.client = await MongoClient.connect(this.url);
            this.db = this.client.db(this.mongo.db);
        } catch (e) {
            console.error(e);
            await this.init(retryCount-1);
        }
    }

    private internalInit() {
        if (!this.db) {
            return this.init();
        }

        return Promise.resolve();
    }

    public close() {
        if (this.client) {
            return this.client.close();
        }

        return Promise.resolve(true);
    }

    public get messages() {
        return this.internalInit().then(() => {
            return this.db.collection("messages")
        });
    }

    public async readChannels() {
        await this.internalInit();
        const allMessages = (await (await this.messages).find<Message>({}, { fields: { channel: 1 } }).toArray()).map(x => x.channel);
        return distinct(allMessages);
    }

    public async readMessages(query?: any) {
        await this.internalInit();
        return (await this.messages).find(query).toArray();
    }

    public async insert(message: Message) {
        return (await (await this.messages).insertOne(message)).insertedCount > 0;
    }

    public async delete(message: Message) {
        const result = await (await this.messages).deleteOne({ _id: new ObjectID(message._id) });
        return result.deletedCount;
    }
}