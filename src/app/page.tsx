"use client";

import * as opaque from "@serenity-kit/opaque";
import { useState } from "react";

async function request(method: string, path: string, body: any = undefined) {
  console.log(`${method} ${path}`, body);
  const res = await fetch(`${path}`, {
    method,
    body: body && JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const { error } = await res.json();
    console.log(error);
    throw new Error(error);
  }
  return res;
}

async function register(userIdentifier: string, password: string) {
  const { clientRegistrationState, registrationRequest } =
    opaque.client.startRegistration({ password });
  const { registrationResponse } = await request(
    "POST",
    `/api/register/start`,
    {
      userIdentifier,
      registrationRequest,
    },
  ).then((res) => res.json());

  console.log("registrationResponse", registrationResponse);
  const { registrationRecord } = opaque.client.finishRegistration({
    clientRegistrationState,
    registrationResponse,
    password,
  });

  const res = await request("POST", `/api/register/finish`, {
    userIdentifier,
    registrationRecord,
  });
  console.log("finish successful", res.ok);
  return res.ok;
}

async function login(userIdentifier: string, password: string) {
  const { clientLoginState, startLoginRequest } = opaque.client.startLogin({
    password,
  });

  const { loginResponse } = await request("POST", "/api/login/start", {
    userIdentifier,
    startLoginRequest,
  }).then((res) => res.json());

  console.log({ loginResponse });

  const loginResult = opaque.client.finishLogin({
    clientLoginState,
    loginResponse,
    password,
  });
  console.log({ loginResult });
  if (!loginResult) {
    return null;
  }
  const { sessionKey, finishLoginRequest } = loginResult;
  const res = await request("POST", "/api/login/finish", {
    userIdentifier,
    finishLoginRequest,
  });
  return res.ok ? sessionKey : null;
}

async function handleSubmit(
  action: string,
  username: string,
  password: string,
) {
  try {
    if (action === "login") {
      const sessionKey = await login(username, password);
      if (sessionKey) {
        alert(
          `User "${username}" logged in successfully; sessionKey = ${sessionKey}`,
        );
      } else {
        alert(`User "${username}" login failed`);
      }
    } else if (action === "register") {
      const ok = await register(username, password);
      if (ok) {
        alert(`User "${username}" registered successfully`);
      } else {
        alert(`Failed to register user "${username}"`);
      }
    }
  } catch (err) {
    console.error(err);
    alert(err);
  }
}

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <>
      <form
        id="form"
        className="p-12 space-y-4 max-w-xl"
        onSubmit={(e) => {
          e.preventDefault();
          const submitter = (e.nativeEvent as SubmitEvent).submitter;
          if (submitter instanceof HTMLButtonElement) {
            handleSubmit(submitter.value, username, password);
          }
        }}
      >
        <h1 className="text-xl font-semibold">Login/Register</h1>

        <div className="space-y-2 flex flex-col">
          <input
            required
            className="border border-slate-300 p-2 rounded"
            name="username"
            placeholder="Username"
            type="text"
            autoComplete="off"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
            }}
          />

          <input
            required
            className="border border-slate-300 p-2 rounded"
            name="password"
            placeholder="Password"
            type="password"
            autoComplete="off"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />

          <div className="space-x-2">
            <Button name="action" value="login">
              Login
            </Button>
            <Button name="action" value="register">
              Register
            </Button>
          </div>
        </div>
      </form>

    </>
  );
}

type ButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "className"
>;

function Button(props: ButtonProps) {
  return (
    <button
      className="bg-blue-500 py-1 px-3 text-white font-semibold rounded hover:bg-blue-600 shadow"
      {...props}
    />
  );
}
