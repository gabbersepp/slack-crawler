import Block from "./Block";
import File from "./File";

export default interface Message {
    channel: string;
    ts: string;
    _id: string;
    user: string;
    text: string;
    blocks: Block[];
    thread_ts: string;
    files: File[];
    
    // transient
    sortCriteria: number[];
    displayUser: string;
    displayTarget: string;
    isIm: boolean;
}