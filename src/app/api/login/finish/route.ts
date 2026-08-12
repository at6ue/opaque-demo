import * as opaque from "@serenity-kit/opaque";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import database from "../../db";
import { SESSION_TTL_SECONDS } from "../../sessionConfig";
import { checkRateLimit } from "../../rateLimiter";
import { LoginFinishParams } from "../../schema";

export async function POST(request: NextRequest) {
  if (checkRateLimit({ request })) {
    return NextResponse.json(
      { error: "You have exceeded 40 requests/min" },
      { status: 429 },
    );
  }

  let userIdentifier,
    finishLoginRequest,
    useCookie = false;
  try {
    const rawValues = await request.json();
    const values = LoginFinishParams.parse(rawValues);
    userIdentifier = values.userIdentifier;
    finishLoginRequest = values.finishLoginRequest;
    useCookie = values.useCookie ?? false;
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid input values" },
      { status: 400 },
    );
  }

  const db = await database;
  const serverLoginState = await db.getLogin(userIdentifier);

  if (!serverLoginState)
    return NextResponse.json({ error: "login not started" }, { status: 400 });

  console.log("finishLoginRequest", finishLoginRequest);
  const { sessionKey } = opaque.server.finishLogin({
    finishLoginRequest,
    serverLoginState,
  });

  // create a single auth session id and store only the sessionKey
  const sessionId = randomUUID();
  await db.setLogin(sessionId, sessionKey);
  await db.removeLogin(userIdentifier);

  const responseBody: { success: true; sessionId?: string } = useCookie
    ? { success: true }
    : { success: true, sessionId };

  const res = NextResponse.json(responseBody);

  if (useCookie) {
    res.cookies.set("sid", sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    });
  }

  return res;
}
