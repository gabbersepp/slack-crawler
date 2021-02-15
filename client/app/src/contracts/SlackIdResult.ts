import ImId from "./ImId";
import SlackId from "./SlackId";

export default interface SlackIdResult {
    userList: SlackId[];
    channelList: SlackId[];
    imsList: ImId[];
}