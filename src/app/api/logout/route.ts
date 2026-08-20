import { NextRequest, NextResponse } from "next/server";
import database from "../db";

export async function POST(request: NextRequest) {
  const db = await database;
  const sidCookie = request.cookies.get("sid");
  const sid = sidCookie?.value ?? null;
  if (sid) {
    try {
      await db.removeSession(sid);
    } catch (e) {
      // ignore
    }
  }
  const headerKey = request.headers.get("x-api-key");
  if (headerKey) {
    try {
      await db.removeSession(headerKey);
    } catch (e) {
      // ignore
    }
  }
  const res = NextResponse.json({ success: true });
  res.cookies.set("sid", "", { path: "/", maxAge: 0 });
  return res;
}
