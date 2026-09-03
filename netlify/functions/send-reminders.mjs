import { getStore } from "@netlify/blobs";
import webpush from "web-push";

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails("mailto:lifeos-noreply@example.com", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

// Runs every 5 minutes. For each subscribed device, works out that device's
// current local time from its stored IANA timezone and fires a push for any
// hydration slot (or the Sunday 20:00 form digest) that just came due and
// hasn't already been sent today/this week. A 5-minute match window covers
// clock drift between this cron tick and the device's stored time.
function localParts(tz, date) {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false,
    weekday: "short", year: "numeric", month: "2-digit", day: "2-digit",
  });
  const parts = Object.fromEntries(fmt.formatToParts(date).map((p) => [p.type, p.value]));
  return { hm: parts.hour + ":" + parts.minute, dateKey: parts.year + "-" + parts.month + "-" + parts.day, dow: parts.weekday };
}

function withinWindow(targetHM, curHM, windowMin) {
  const [th, tm] = targetHM.split(":").map(Number);
  const [ch, cm] = curHM.split(":").map(Number);
  if (Number.isNaN(th) || Number.isNaN(tm)) return false;
  const diff = ch * 60 + cm - (th * 60 + tm);
  return diff >= 0 && diff < windowMin;
}

async function sendPush(subscription, title, body) {
  try {
    await webpush.sendNotification(subscription, JSON.stringify({ title, body }));
    return true;
  } catch (e) {
    return e && (e.statusCode === 404 || e.statusCode === 410) ? "gone" : false;
  }
}

export default async () => {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.error("send-reminders: VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY not set — skipping.");
    return new Response("VAPID keys not configured", { status: 500 });
  }

  const store = getStore("push-subs");
  const { blobs } = await store.list();
  const now = new Date();

  for (const { key } of blobs) {
    const entry = await store.get(key, { type: "json" });
    if (!entry || !entry.subscription) continue;

    const { hm, dateKey, dow } = localParts(entry.tz || "UTC", now);
    entry.sent = entry.sent || {};
    let changed = false;
    let gone = false;

    for (const slot of entry.hydrationSlots || []) {
      const sentKey = "hydra:" + slot;
      if (entry.sent[sentKey] === dateKey) continue;
      if (withinWindow(slot, hm, 5)) {
        const result = await sendPush(entry.subscription, "Hydration · Life OS", "Glass due at " + slot + ".");
        if (result === "gone") { gone = true; break; }
        if (result) { entry.sent[sentKey] = dateKey; changed = true; }
      }
    }

    if (!gone && entry.weeklyDigest && dow === "Sun" && withinWindow("20:00", hm, 5)) {
      const wkKey = "digest:" + dateKey;
      if (entry.sent.digest !== wkKey) {
        const result = await sendPush(entry.subscription, "This week’s form · Life OS", "Open Life OS to see this week’s check-ins.");
        if (result === "gone") gone = true;
        else if (result) { entry.sent.digest = wkKey; changed = true; }
      }
    }

    if (gone) await store.delete(key);
    else if (changed) await store.setJSON(key, entry);
  }

  return new Response("ok");
};

export const config = { schedule: "*/5 * * * *" };
