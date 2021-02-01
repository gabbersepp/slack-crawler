import SlackId from "@/contracts/SlackId";
import SlackIdResult from "@/contracts/SlackIdResult";
import SlackMessage from "@/contracts/SlackMessage";
import Utils from "./Utils";

export default class Api {
    public async getSlackIds(): Promise<SlackIdResult> {
        return this.get("slackIds")
    }

    public getMessages(id: string): Promise<SlackMessage[]> {
        return this.get(`message/${id}`)
    }

    private async get(urlPart: string): Promise<any> {
        const result = await fetch(`${Utils.Config.baseUrl}/${urlPart}`);
        return result.json();
    }
}