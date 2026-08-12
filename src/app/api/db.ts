import * as opaque from "@serenity-kit/opaque";
import { Datastore } from "./Datastore";
import FileStore from "./FileStore";

async function setupFileStore(): Promise<Datastore> {
  const file = "data.json";
  console.log(`initializing FileStore with file "${file}"`);
  const db = new FileStore(file);
  await db.initialize();
  return db;
}

const db = opaque.ready.then(() => setupFileStore());

export default db;
