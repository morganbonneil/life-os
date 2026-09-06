import { useEffect, useState } from "react";

// Public VAPID key — safe to ship in client code (it's the "who this push
// belongs to" identity, not a secret). The matching private key lives only
// in the Netlify Function's environment variables.
const VAPID_PUBLIC_KEY = "BLwXqAWhnFEnkQ5RMolKXXx55YmDcDhf86JC6Uxv2t-tAPnpmT4P5ukj5wKK7iapu5MFvG0qdZYeHq7C0UQ0cgI";
const DEVICE_ID_KEY = "oslife.deviceId";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

function getDeviceId() {
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = "d" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    return "d" + Date.now();
  }
}

async function postSubscription(sub, hydrationSlots, onceTasks) {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const res = await fetch("/.netlify/functions/subscribe", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ deviceId: getDeviceId(), subscription: sub.toJSON(), tz, hydrationSlots, onceTasks, weeklyDigest: true }),
  });
  if (!res.ok) throw new Error("The server didn’t accept the subscription (status " + res.status + ").");
}

// Real push notifications — delivered by a small Netlify Function even when
// this tab/app isn't open. Requires that function to be deployed (see
// netlify/functions/); on any host without it, `enable()` will fail with a
// clear error and the app falls back to the in-app-only reminder it always
// had. On iOS this additionally requires the app to be installed to the
// Home Screen first — Safari refuses push subscriptions from a plain tab.
export function usePush(hydrationSlots, onceTasks) {
  const supported = typeof window !== "undefined" && typeof navigator !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;
  const [status, setStatus] = useState("unsubscribed");
  const [error, setError] = useState("");

  const isIOS = supported && /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = supported && (window.navigator.standalone || window.matchMedia("(display-mode: standalone)").matches);
  const needsHomeScreen = isIOS && !isStandalone;

  useEffect(() => {
    if (!supported) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => { if (sub) setStatus("subscribed"); })
      .catch(() => {});
  }, [supported]);

  // Keep the server's copy of the hydration times and open one-off tasks
  // current while subscribed.
  useEffect(() => {
    if (status !== "subscribed" || !supported) return;
    (async () => {
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) await postSubscription(sub, hydrationSlots, onceTasks);
      } catch { /* best-effort resync */ }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(hydrationSlots), JSON.stringify(onceTasks), status, supported]);

  async function enable() {
    if (!supported) return;
    setStatus("pending");
    setError("");
    try {
      if (needsHomeScreen) throw new Error("Add Life OS to your Home Screen first, then try again from there.");
      const perm = await Notification.requestPermission();
      if (perm !== "granted") throw new Error("Notifications permission was declined.");
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) });
      await postSubscription(sub, hydrationSlots, onceTasks);
      setStatus("subscribed");
    } catch (e) {
      setStatus("error");
      setError(e && e.message ? e.message : "Could not enable notifications.");
    }
  }

  async function disable() {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();
      await fetch("/.netlify/functions/unsubscribe", {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ deviceId: getDeviceId() }),
      }).catch(() => {});
    } catch { /* ignore */ }
    setStatus("unsubscribed");
  }

  return { supported, status, error, enable, disable, needsHomeScreen };
}
