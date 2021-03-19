import Block from "./Block";

export default interface Message {
    channel: string;
    ts: string;
    _id: string;
    user: string;
    text: string;
    blocks: Block[];
    
    // transient
    sortCriteria: number[];
    displayUser: string;
    displayTarget: string;
    isIm: boolean;
}