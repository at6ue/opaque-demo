import { NextRequest, NextResponse } from "next/server";
import database from "../db";

export async function GET(request: NextRequest) {
  const db = await database;
  const headerKey = request.headers.get("x-api-key");
  const cookieKey = request.cookies.get("sid")?.value ?? null;
  const authKey = headerKey ?? cookieKey;

  if (!authKey) {
    return new Response("Forbidden", { status: 403 });
  }

  const has = await db.hasSession(authKey);
  if (!has) return new Response("Forbidden", { status: 403 });

  return NextResponse.json({
    message: `Welcome to OPAQUE demo!`,
  });
}
