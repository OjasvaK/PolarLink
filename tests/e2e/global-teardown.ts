import { cleanup, withDb } from "./db";

export default async function globalTeardown() {
  await withDb(cleanup);
}
