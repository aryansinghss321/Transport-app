import { useEffect, useState } from "react";
import { api } from "./api";

export default function App() {
  const [msg, setMsg] = useState("Loading...");

  useEffect(() => {
    api.get("/health")
      .then((res) => setMsg(res.data.message))
      .catch((err) => setMsg(err.message));
  }, []);

  return (
    <div className="min-h-screen grid place-items-center bg-slate-900">
      <h1 className="text-4xl font-bold text-white">{msg}</h1>
    </div>
  );
}