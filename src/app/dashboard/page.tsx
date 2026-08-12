"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [message, setMessage] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    try {
      const authKey = localStorage.getItem("sessionId");
      const headers: HeadersInit = {};
      if (authKey) headers["x-api-key"] = authKey;
      fetch("/api/welcome", { headers })
        .then((res) => {
          if (!res.ok) throw new Error("forbidden");
          return res.json();
        })
        .then((data) => {
          if (mounted) {
            setMessage(data.message);
            setChecked(true);
          }
        })
        .catch(() => {
          if (mounted) {
            setChecked(true);
            router.replace("/");
          }
        });
    } catch (e) {
      router.replace("/");
      return;
    }
    return () => {
      mounted = false;
    };
  }, [router]);

  function handleLogout() {
    try {
      const authKey = localStorage.getItem("sessionId");
      const headers: HeadersInit = {};
      if (authKey) headers["x-api-key"] = authKey;
      fetch("/api/logout", { method: "POST", headers }).catch(() => {});
      localStorage.removeItem("sessionId");
    } catch (e) {
      /* ignore */
    }
    router.push("/");
  }

  if (!checked) return null; // don't render until auth check completes

  return (
    <div className="p-12 max-w-xl">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      {message ?? <p className="mt-4">{message}</p>}
      <div className="mt-6">
        <button
          className="bg-red-500 py-1 px-3 text-white font-semibold rounded hover:bg-red-600 shadow"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
