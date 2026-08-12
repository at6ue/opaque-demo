import * as dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

export function requireEnv(key: string) {
  const value = process.env[key];
  if (value == null) throw new Error(`missing value for env variable "${key}"`);
  return value;
}

export function hasEnv(key: string) {
  return process.env[key] != null;
}

export function getEnv(key: string, defaultValue: string) {
  return process.env[key] ?? defaultValue;
}

export const SERVER_SETUP = requireEnv("OPAQUE_SERVER_SETUP");
