import { DEFAULT_PLAN, DOMAINS, RECOV, REPEATS, SLOTS_BY_DAY } from "./constants";
import { iso, parseIso } from "./utils";

// ---------- training / nutrition ----------

export function sessionType(data, k) {
  return data.sessions[k] || DEFAULT_PLAN[parseIso(k).getDay()];
}
export function isTraining(data, k) {
  return sessionType(data, k) !== "rest";
}
export function dayKind(data, k) {
  return isTraining(data, k) ? "training" : "rest";
}
export function slotsFor(data, k) {
  return SLOTS_BY_DAY[dayKind(data, k)];
}
export function candidates(data, k, slot) {
  const dayT = dayKind(data, k);
  return data.meals.filter((m) => m.slot === slot && m.day === dayT);
}
export function mealFor(data, k, slot, hashFn) {
  const cand = candidates(data, k, slot);
  if (!cand.length) return null;
  const bump = data.picks[k + "|" + slot] || 0;
  return cand[hashFn(k + "|" + slot + "#" + bump) % cand.length];
}
export function plan(data, k, hashFn) {
  return slotsFor(data, k)
    .map((s) => {
      const m = mealFor(data, k, s[0], hashFn);
      return m ? { slot: s[0], time: s[1], m } : null;
    })
    .filter(Boolean);
}

// ---------- tasks / goals ----------

export function taskKey(t, date, weekKeyFn, monthKeyFn) {
  if (t.repeat === "daily") return iso(date);
  if (t.repeat === "weekly") return weekKeyFn(date);
  if (t.repeat === "monthly") return monthKeyFn(date);
  return "once";
}
export function taskDone(t, date, weekKeyFn, monthKeyFn) {
  return !!(t.done || {})[taskKey(t, date || new Date(), weekKeyFn, monthKeyFn)];
}
export function goalById(data, id) {
  return data.goals.filter((g) => g.id === id)[0];
}
export function goalProgress(data, g, weekKeyFn, monthKeyFn) {
  if (g.done) return 100;
  const rel = data.tasks.filter((t) => t.goal === g.id);
  if (!rel.length) return 0;
  return Math.round((rel.filter((t) => taskDone(t, new Date(), weekKeyFn, monthKeyFn)).length / rel.length) * 100);
}

export function recovScore(entry) {
  if (!entry) return null;
  const v = RECOV.map((m) => entry[m.k]).filter((x) => x !== null && x !== undefined);
  if (!v.length) return null;
  return Math.round((v.reduce((a, b) => a + b, 0) / v.length) * 10) / 10;
}

export function recOf(data, dist) {
  const all = data.times.filter((t) => t.dist === dist);
  const l = all.filter((t) => t.kind !== "training");
  const use = l.length ? l : all;
  return use.length ? use.reduce((a, b) => (b.t < a.t ? b : a)) : null;
}
export function targetsOf(data, dist) {
  return data.targets.filter((g) => g.dist === dist).sort((a, b) => ((a.due || "9") < (b.due || "9") ? -1 : 1));
}

// ---------- style helpers (already camelCase — usable as React inline styles) ----------

export function box(done, color) {
  return {
    width: "17px", height: "17px", flex: "none", marginTop: "2px",
    border: "1px solid " + (done ? color || "var(--green)" : "var(--input-line)"),
    background: done ? color || "var(--green)" : "transparent",
    color: "var(--bg)", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center",
    font: "700 11px/1 'Plus Jakarta Sans',system-ui,sans-serif", cursor: "pointer",
  };
}
export function strike(done, size) {
  return { display: "block", font: "700 " + (size || 15) + "px/1.35 'Plus Jakarta Sans',system-ui,sans-serif", textDecoration: done ? "line-through" : "none", color: done ? "var(--faint)" : "var(--text)" };
}
export function bar(pct, c) {
  return { height: "3px", width: Math.max(0, Math.min(100, pct)) + "%", background: c || "var(--green)" };
}
export function chip(active, accent) {
  const a = accent || "var(--green)";
  return { border: "1px solid " + (active ? a : "var(--line)"), background: active ? a : "transparent", color: active ? "var(--bg)" : "var(--muted)", padding: "6px 11px", borderRadius: "99px", font: "700 12.5px/1 'Plus Jakarta Sans',system-ui,sans-serif", cursor: "pointer", whiteSpace: "nowrap" };
}
export function tag(color) {
  return { border: "1px solid " + color, color, background: "transparent", padding: "4px 9px", borderRadius: "99px", font: "700 11.5px/1 'Plus Jakarta Sans',system-ui,sans-serif", letterSpacing: ".08em", textTransform: "uppercase", whiteSpace: "nowrap", cursor: "pointer" };
}
export function prose(size) {
  return { font: "700 " + (size || 15) + "px/1.6 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--text)", whiteSpace: "pre-wrap", marginTop: "6px" };
}
export function macroTxt(m) {
  return m.kcal + " kcal · P " + m.p + " g · C " + m.c + " g · F " + m.f + " g";
}
export function ingTxt(m) {
  return m.ing.map((g) => g.n + " " + g.q + (g.u === "pc" ? "" : " " + g.u)).join(" · ");
}

export function taskLink(data, t, fmtShortFn) {
  const g = t.goal ? goalById(data, t.goal) : null;
  const dom = g ? DOMAINS.filter((x) => x.id === g.domain)[0] : null;
  const bits = [REPEATS[t.repeat] || "One-off"];
  if (t.repeat === "once" && t.date) bits.push(fmtShortFn(t.date));
  if (g) bits.push("↳ " + g.title + (dom ? " · " + dom.name : ""));
  else bits.push("no goal attached");
  return bits.join(" · ");
}
