import * as fs from "fs";

export function getConfig(): Config {
    return JSON.parse(fs.readFileSync("config/config.json").toString())
}

export function distinct(list: string[]): string[] {
    const obj = {};
    list.forEach(x => obj[x] = true);
    return Object.keys(obj);
}

export interface Config {
    mongo: MongoConfig;
    crawler: DataDirConfig;
    postprocessor: DataDirConfig;
    server: DataDirConfig;
}

export interface DataDirConfig {
    dataDir: string;
}

export interface MongoConfig {
    server: string;
    user: string;
    pw: string;
    db: string;
}