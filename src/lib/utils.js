import { CAT_HINTS } from "./constants";

export function iso(d) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
export function parseIso(s) {
  const p = String(s).split("-");
  return new Date(+p[0], +p[1] - 1, +p[2]);
}
export function addDays(d, n) {
  const x = new Date(d.getTime());
  x.setDate(x.getDate() + n);
  return x;
}
export function monday(d) {
  const x = new Date(d.getTime());
  return addDays(x, -((x.getDay() + 6) % 7));
}
export function fmtLong(d) {
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
}
export function fmtShort(s) {
  return parseIso(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}
export function fmtFull(s) {
  return parseIso(s).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
}
export function weekKey(d) {
  const m = monday(d);
  return "w" + iso(m);
}
export function monthKey(d) {
  return "m" + d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
}
export function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
export function catOf(name) {
  const n = name.toLowerCase();
  for (const [w, c] of CAT_HINTS) if (w.some((x) => n.includes(x))) return c;
  return "Pantry";
}
export function ing(n, q, u) {
  return { n, q, u, c: catOf(n) };
}
export function parseIngLines(txt) {
  return String(txt || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const m = l.match(/^(.+?)[\s,;:-]+(\d+(?:[.,]\d+)?)\s*(kg|g|ml|cl|l|pc|pcs|piece|pieces|slice|slices)?\.?$/i);
      if (!m) return ing(l, 1, "pc");
      let u = (m[3] || "pc").toLowerCase();
      if (u.indexOf("pie") === 0 || u.indexOf("pc") === 0) u = "pc";
      if (u.indexOf("slice") === 0) u = "pc";
      return ing(m[1].trim(), parseFloat(m[2].replace(",", ".")), u);
    });
}
export function distNum(s) {
  const m = String(s).match(/(\d+(?:[.,]\d+)?)/);
  return m ? parseFloat(m[1].replace(",", ".")) : 0;
}
export function normDist(raw) {
  const s = String(raw || "").trim();
  if (!s) return "";
  const n = distNum(s);
  if (!n) return "";
  return n + " " + (/km/i.test(s) ? "km" : "m");
}
