import Block from "./Block";
import SlackFile from "./SlackFile";

export default interface Message {
    channel: string;
    ts: string;
    _id: string;
    user: string;
    text: string;
    blocks: Block[];
    thread_ts: string;
    files: SlackFile[];
    
    // transient
    sortCriteria: number[];
    displayUser: string;
    displayTarget: string;
    isIm: boolean;
}