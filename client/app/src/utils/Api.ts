import Message from "@/contracts/server/Message";
import SlackIdResult from "@/contracts/SlackIdResult";
import Utils from "./Utils";

export default class Api {
    public async getSlackIds(): Promise<SlackIdResult> {
        return this.get("slackIds")
    }

    public getThreadMessages(channel: string, threadTs: string): Promise<Message[]> {
        return this.get(`thread/${channel}/${threadTs}`)
    }

    public getMessages(id: string): Promise<Message[]> {
        return this.get(`message/${id}`)
    }

    public searchMessages(value: string): Promise<Message[]> {
        return this.post("message/search", { search: value });
    }

    private async post(urlPart: string, data: any): Promise<any> {
        const config = await Utils.getConfig();
        const result = await fetch(`${config.baseUrl}/${urlPart}`, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json"
            }
        });
        return result.json();
    }

    private async get(urlPart: string): Promise<any> {
        const config = await Utils.getConfig();
        const result = await fetch(`${config.baseUrl}/${urlPart}`);
        return result.json();
    }
}