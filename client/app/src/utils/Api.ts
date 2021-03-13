import Message from "@/contracts/server/Message";
import SlackIdResult from "@/contracts/SlackIdResult";
import Utils from "./Utils";

export default class Api {
    public async getSlackIds(): Promise<SlackIdResult> {
        return this.get("slackIds")
    }

    public getMessages(id: string): Promise<Message[]> {
        return this.get(`message/${id}`)
    }

    private async get(urlPart: string): Promise<any> {
        const config = await Utils.getConfig();
        const result = await fetch(`${config.baseUrl}/${urlPart}`);
        return result.json();
    }
}