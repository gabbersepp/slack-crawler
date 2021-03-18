export default interface Message {
    channel: string;
    ts: string;
    _id: string;
    user: string;
    text: string;
    thread_ts: string;
    
    // transient
    sortCriteria: number[];
    displayUser: string;
    displayTarget: string;
    isIm: boolean;
    threadMessages: Message[];
}