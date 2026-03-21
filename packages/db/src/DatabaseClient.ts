import path from "path";
import {
  Client,
  DatabaseClientOptions,
  DBConnectionString,
  IDatabaseClient,
  IDatabaseClientDriver,
  ORM,
} from "./IDatabaseClient";
import { DrizzleDriver } from "./drivers/drizzle";

const defaultOptions: DatabaseClientOptions = {
  orm: "drizzle",
};

export class DatabaseClient implements IDatabaseClient {
  private driver: IDatabaseClientDriver;
  protected modulesDir: string = path.resolve(process.cwd(), "src", "modules");
  orm: ORM;

  constructor(
    readonly url: DBConnectionString,
    readonly options: DatabaseClientOptions = defaultOptions,
  ) {
    this.orm = options.orm;
    if (options.orm === "drizzle") {
      this.driver = new DrizzleDriver(url, { modulePath: this.modulesDir });
    } else {
      throw new Error('We only support "drizzle" database driver');
    }
  }

  async init() {
    return this.driver.init();
  }

  connect(): Promise<void> {
    return this.driver.connect();
  }

  disconnect(): Promise<void> {
    return this.driver.disconnect();
  }

  getClient() {
    return this.driver.getClient();
  }

  isConnected(): boolean {
    return this.driver.isConnected();
  }

  async executeQuery<T>(
    label: string,
    queryFn: (db: Client) => Promise<T>,
  ): Promise<T> {
    return this.driver.executeQuery<T>(label, queryFn);
  }
}
