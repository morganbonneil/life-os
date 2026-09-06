import { getStore } from "@netlify/blobs";

// Stores (or updates) one device's push subscription plus the local times
// it wants reminders at. Keyed by a random id the client generates once and
// keeps in localStorage — there's no user account, so this id is the only
// handle on "this device".
export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }

  const { deviceId, subscription, tz, hydrationSlots, onceTasks, weeklyDigest } = body || {};
  if (!deviceId || !subscription || !subscription.endpoint) {
    return new Response("Missing deviceId or subscription", { status: 400 });
  }

  const store = getStore("push-subs");
  const existing = (await store.get(deviceId, { type: "json" })) || {};
  await store.setJSON(deviceId, {
    subscription,
    tz: typeof tz === "string" && tz ? tz : "UTC",
    hydrationSlots: Array.isArray(hydrationSlots) ? hydrationSlots.filter((s) => typeof s === "string") : [],
    onceTasks: Array.isArray(onceTasks)
      ? onceTasks.filter((t) => t && typeof t.id === "string" && typeof t.title === "string" && typeof t.date === "string")
      : [],
    weeklyDigest: !!weeklyDigest,
    sent: existing.sent || {},
    updatedAt: new Date().toISOString(),
  });

  return new Response(JSON.stringify({ ok: true }), { headers: { "content-type": "application/json" } });
};
