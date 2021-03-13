export default interface Config {
    server: DataDirConfig;
    postprocessor: DataDirConfig;
    mongo: MongoConfig;
}

interface DataDirConfig {
    dataDir: string;
}

export interface MongoConfig {
    server: string;
    user: string;
    pw: string;
    db: string;
}