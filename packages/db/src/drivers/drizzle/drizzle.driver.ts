import { drizzle as pgDrizzle } from "drizzle-orm/node-postgres";
import { readdir } from "fs/promises";
import path from "path";
import { Pool } from "pg";
import { pathToFileURL } from "url";
import {
  Client,
  DBConnectionString,
  DBOptions,
  IDatabaseClientDriver,
} from "../../IDatabaseClient";

export class DrizzleDriver implements IDatabaseClientDriver {
  protected pool: Pool | null = null;
  protected client: Client | null = null;
  protected isConnect = false;
  protected modulesDir: string;

  constructor(
    readonly url: DBConnectionString,
    readonly options: DBOptions,
  ) {
    const pgPool = new Pool({
      connectionString: url,
      ...options.config,
    });
    this.modulesDir = options.modulePath;

    this.pool = pgPool;
  }

  async init() {
    await this.connect();
    const schema = await this.loadAllSchemas();
    this.client = pgDrizzle({
      client: this.pool as Pool,
      schema,
    }) as unknown as Client;
    return this.client;
  }

  async connect(): Promise<void> {
    try {
      await this.pool?.connect();
      this.isConnect = true;
    } catch (error) {
      throw new Error("Failed to connect to database");
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.pool?.end();
      this.isConnect = false;
    } catch (error) {
      throw new Error("Failed to disconnect to database");
    }
  }

  getClient() {
    if (!this.isConnect || !this.client) {
      throw new Error("Database is not connected");
    }
    return this.client;
  }

  isConnected(): boolean {
    return this.isConnect;
  }

  async executeQuery<T>(
    label: string,
    queryFn: (db: Client) => Promise<T>,
  ): Promise<T> {
    try {
      return await queryFn(this.client!);
    } catch (error) {
      throw new Error(`[${label}] Database query failed`);
    }
  }

  private async getAllSchemaFiles(dir: string): Promise<string[]> {
    const entries = await readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          return this.getAllSchemaFiles(fullPath); // recurse
        } else if (entry.isFile() && entry.name.endsWith(".schema.ts")) {
          return [fullPath];
        }
        return [];
      }),
    );

    return files.flat();
  }

  private async loadAllSchemas() {
    try {
      const files = await this.getAllSchemaFiles(this.modulesDir);

      const allSchemas: Record<string, any> = {};

      for (const file of files) {
        const moduleExports = await import(pathToFileURL(file).pathname);

        Object.assign(allSchemas, moduleExports);
      }

      return allSchemas;
    } catch (error) {
      throw new Error("[drizzle.driver]: schema loads failed!");
    }
  }
}
