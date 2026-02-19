import { DatabaseClient, DatabaseClientToken } from "@prexress/db";
import { container } from "tsyringe";

export async function resolveDependencies() {
  try {
    const dbUrl = process.env.DATABASE_URL || "";
    const database = new DatabaseClient(dbUrl);
    await database.init();
    container.register(DatabaseClientToken, {
      useValue: database,
    });
  } catch (error) {
    console.log("[registry]: failed to resolve dependencies");
    throw error;
  }
}
