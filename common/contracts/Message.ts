export default interface Message {
    channel: string;
    ts: string;
    _id: string;
    user: string;
    text: string;
    
    // transient
    sortCriteria: number[];
    displayUser: string;
}