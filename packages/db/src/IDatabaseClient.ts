import { drizzle } from "drizzle-orm/node-postgres";

export type DrizzleClient = ReturnType<typeof drizzle<any>>;

export type Client = DrizzleClient;

export type ORM = "typeorm" | "drizzle";

export type DBConnectionString = string;

export type DatabaseConfig = {
  maxConnection?: number;
  idleTimeout?: number;
  connectionTimeout?: number;
  maxUses?: number;
  ssl?: boolean;
};

export type DBOptions = {
  config?: DatabaseConfig;
  modulePath: string;
};

export interface IDatabaseClientDriver {
  connect(): Promise<void>;
  init(): Promise<Client>;
  disconnect(): Promise<void>;
  getClient(): Client;
  isConnected(): boolean;
  executeQuery<T>(
    label: string,
    queryFn: (db: Client) => Promise<T>
  ): Promise<T>;
}

export const DatabaseClientToken = Symbol("DatabaseClientToken");

export interface IDatabaseClient {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getClient(): Client;
  isConnected(): boolean;
  init(): Promise<Client>;
  executeQuery<T>(
    label: string,
    queryFn: (db: Client) => Promise<T>
  ): Promise<T>;
}

export type DatabaseClientOptions = {
  orm: ORM;
};
