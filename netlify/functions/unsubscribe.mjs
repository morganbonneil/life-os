import { getStore } from "@netlify/blobs";

export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }

  const { deviceId } = body || {};
  if (!deviceId) return new Response("Missing deviceId", { status: 400 });

  const store = getStore("push-subs");
  await store.delete(deviceId);

  return new Response(JSON.stringify({ ok: true }), { headers: { "content-type": "application/json" } });
};
