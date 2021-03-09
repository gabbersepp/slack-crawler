import { Db, MongoClient, ObjectID } from "mongodb";
import { config } from "process";
import { runInThisContext } from "vm"; 
import Message from "./contracts/Message";
import { distinct, getConfig } from "./utils";

export default class Repository {
    private config = getConfig();
    private mongo = this.config.mongo;
    private url = `mongodb://${this.mongo.user}:${this.mongo.pw}@${this.mongo.server}:27017/slack`;
    private client: MongoClient;
    private db: Db;

    public async init(retryCount: number = 2) {
        try {
            this.client = await MongoClient.connect(this.url);
            this.db = this.client.db(this.mongo.db);
        } catch (e) {
            console.error(e);
            await this.init(retryCount-1);
        }
    }

    public close() {
        if (this.client) {
            return this.client.close();
        }

        return Promise.resolve(true);
    }

    public get messages() {
        return this.db.collection("messages");
    }

    public async readChannels() {
        const allMessages = (await this.messages.find<Message>({}, { fields: { channel: 1 } }).toArray()).map(x => x.channel);
        return distinct(allMessages);
    }

    public async readMessages(query?: any) {
        return this.messages.find(query).toArray();
    }

    public async insert(message: Message) {
        return (await this.messages.insertOne(message)).insertedCount > 0;
    }

    public async delete(message: Message) {
        const result = await this.messages.deleteOne({ _id: new ObjectID(message._id) });
        return result.deletedCount;
    }
}