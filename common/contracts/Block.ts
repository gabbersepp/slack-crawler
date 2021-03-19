import Element from "./Element";

export default interface Block {
    elements: Element[];
    type: string;
}