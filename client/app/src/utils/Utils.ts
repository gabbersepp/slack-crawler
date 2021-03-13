import Config from "@/contracts/Config";

export default class Utils {
    public static async getConfig(): Promise<Config> {
        const result = await fetch("config/config.json");
        return result.json();
    }
}