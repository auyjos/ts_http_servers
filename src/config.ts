import { MigrationConfig } from "drizzle-orm/migrator";

process.loadEnvFile();

function envOrThrow(key: string): string {
    const value = process.env[key]
    if (!value) {
        throw new Error(`Environment variable ${key} is required`)
    }
    return value
}
const migrationConfig = {
    migrationsFolder: "./src/db/migrations"
}

export type DBconfig = {
    url: string;
    migrationConfig: MigrationConfig
}

export type APIConfig = {
    fileserverHits: number;
    db: DBconfig;
    platform: string;
}

export const config: APIConfig = {
    fileserverHits: 0,
    db: {
        url: envOrThrow('DB_URL'),
        migrationConfig: migrationConfig
    },
    platform: envOrThrow('PLATFORM')
}

