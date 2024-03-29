import Channel from "../contracts/Channel";
import Config, { MongoConfig } from "../contracts/Config";
import Ims from "../contracts/Ims";
import User from "../contracts/User";
import File from "../contracts/File";
import { Binary, Db, MongoClient, ObjectID } from "mongodb";
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
            this.client = await MongoClient.connect(this.url, {
                useNewUrlParser: true,
                autoReconnect: true,
                reconnectTries: 2,
                reconnectInterval: 1000,
                poolSize: 10,
              });
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

    public get channels() {
        return this.db.collection("channels");
    }

    public get users() {
        return this.db.collection("users");
    }

    public get ims() {
        return this.db.collection("ims");
    }

    public get files() {
        return this.db.collection("files");
    }

    public async readChannelsFromMessages() {
        const allMessages = (await (await this.messages).find<Message>({}, { fields: { channel: 1 } }).toArray()).map(x => x.channel);
        return distinct(allMessages);
    }

    public async readMessages(query?: any): Promise<Message[]> {
        return this.messages.find(query).toArray();
    }

    public async readChannels(query?: any): Promise<Channel[]> {
        return this.channels.find(query).toArray();
    }

    public async readUsers(query?: any): Promise<User[]> {
        return await this.users.find(query).toArray();
    }

    public async readIms(query?: any): Promise<Ims[]> {
        return this.ims.find(query).toArray();
    }

    public async readFiles(query?: any, projection?: any): Promise<File[]> {
        let options = undefined;
        if (projection) {
            options = {};
            options.projection = projection;
        }
        return this.files.find(query, options).toArray();
    }
    
    public async insertMessage(message: Message) {
        return (await this.messages.insertOne(message)).insertedCount > 0;
    }
    
    public async insertUser(user: User) {
        return (await this.users.insertOne(user)).insertedCount > 0;
    }

    public async insertChannel(channel: Channel) {
        return (await this.channels.insertOne(channel)).insertedCount > 0;
    }

    public async insertIms(ims: Ims) {
        return (await this.ims.insertOne(ims)).insertedCount > 0;
    }

    public async insertFile(file: File) {
        file.content = new Binary(file.content);
        const saveResult = await this.files.insertOne(file);
        return saveResult.insertedCount;
    }

    public async delete(message: Message) {
        const result = await this.messages.deleteOne({ _id: new ObjectID(message._id) });
        return result.deletedCount;
    }

    public async searchMessages(text: string): Promise<Message[]> {
        return this.messages.find({ $text: { $search: text }}).toArray();
    }
}