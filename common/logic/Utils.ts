import Config from "../contracts/Config";
import * as fs from "fs";

export function getConfig(path: string): Config {
    return JSON.parse(fs.readFileSync(path).toString());
}

export function distinct(list: string[]): string[] {
    const obj = {};
    list.forEach(x => obj[x] = true);
    return Object.keys(obj);
}