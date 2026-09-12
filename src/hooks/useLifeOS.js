import { useEffect, useMemo, useRef, useState } from "react";
import {
  CATS, DEFAULT_PLAN, DOMAINS, DOW, FLASH_BOX_MAX, FLASH_INTERVALS_DAYS, RECOV, RECOV_DEFAULT, REPEATS, SLOTS, STORAGE_KEY, TYPES, UNIT_STEP,
  pieceWeightFor,
} from "../lib/constants";
import {
  bar, box, candidates, chip, dayKind, goalProgress, ingTxt, macroTxt,
  plan, prose, recOf, recovScore, sessionType, tag, targetsOf, taskLink,
} from "../lib/logic";
import { buildFlashcards, buildMeals, buildSeed } from "../lib/seed";
import {
  addDays, catOf, distNum, fmtFull, fmtLong, fmtShort, hash, iso, monday, monthKey, normDist, parseIngLines, parseIso, resizeImageFile, weekKey,
} from "../lib/utils";

const HYDRATION_TARGET_L = 3;
const TAB_DEFS = [
  ["today", "Today", "01"], ["nutrition", "Nutrition", "02"], ["sprint", "Sprint", "03"],
  ["goals", "Goals", "04"], ["track", "Tracking", "05"], ["settings", "Settings", "06"],
];
const THEME_KEY = "oslife.theme";

// One-time content migration: replace the meal library with the phase-1 set
// for anyone who already has saved data from before it existed. Idempotent —
// checks a version stamp on the data itself, not on when the app loaded.
function migrateMeals(d) {
  if (d.mealSetVersion >= 2) return false;
  d.meals = buildMeals();
  d.mealSetVersion = 2;
  d.weeklyDigest = d.weeklyDigest || { fired: {} };
  return true;
}

// One-time seed of the flashcards tool for anyone whose saved data predates
// it — same idempotent pattern as migrateMeals, keyed on the field's mere
// presence rather than a version number.
function migrateFlashcards(d) {
  if (d.flashDecks) return false;
  d.flashDecks = [{ id: "fd1", name: "Essentials", language: "Spanish" }];
  d.flashCards = buildFlashcards();
  return true;
}

// One-time backfill for anyone whose decks predate the language field —
// derives a language from the old "Language — Deck" naming convention.
function migrateDeckLanguages(d) {
  if (!d.flashDecks || !d.flashDecks.length) return false;
  let changed = false;
  d.flashDecks.forEach((dk) => {
    if (dk.language) return;
    const parts = String(dk.name || "").split("—");
    dk.language = parts.length > 1 ? parts[0].trim() : dk.name || "Other";
    if (parts.length > 1) dk.name = parts.slice(1).join("—").trim() || "Essentials";
    changed = true;
  });
  return changed;
}

function loadOrSeed() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      if (d && d.version === 4) {
        const mealsChanged = migrateMeals(d);
        const flashChanged = migrateFlashcards(d);
        const langChanged = migrateDeckLanguages(d);
        if (mealsChanged || flashChanged || langChanged) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch { /* ignore */ } }
        return d;
      }
    }
  } catch { /* ignore */ }
  const d = buildSeed(HYDRATION_TARGET_L);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch { /* ignore */ }
  return d;
}
function persist(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
}

const DB_PATH = "lifeos/data";

export function useLifeOS() {
  const [data, setData] = useState(loadOrSeed);
  const [syncMode, setSyncMode] = useState("checking"); // "checking" | "cloud" | "local"
  const [tab, setTab] = useState("today");
  const [toasts, setToasts] = useState([]);
  const [selDay, setSelDay] = useState(() => iso(new Date()));
  const [chartDist, setChartDist] = useState("100 m");
  const [ssub, setSsub] = useState("times");
  const [nsub, setNsub] = useState("day");
  const [gsub, setGsub] = useState("horizons");
  const [tsub, setTsub] = useState("books");
  const [libFilter, setLibFilter] = useState("All");
  const [scope, setScope] = useState("daily");
  const [timeKind, setTimeKind] = useState("test");
  const [editingMealId, setEditingMealId] = useState(null);
  const [flashLanguage, setFlashLanguage] = useState(null);
  const [flashDeckId, setFlashDeckId] = useState(null);
  const [editingDeckId, setEditingDeckId] = useState(null);
  const [flashStudy, setFlashStudy] = useState(null); // { deckId, phase, queue: [cardId,...], pos, flipped, known: [id,...], unknown: [id,...] }
  const [gridView, setGridView] = useState(null); // { kind: "daily", taskId } | { kind: "weekly" } | null
  const [weekOffset, setWeekOffset] = useState(0);
  const [horizonDomain, setHorizonDomain] = useState(null);
  const [openBookId, setOpenBookId] = useState(null);
  const [openLearningId, setOpenLearningId] = useState(null);
  const [editingLearningId, setEditingLearningId] = useState(null);
  const [themePref, setThemePrefState] = useState(() => {
    try { return localStorage.getItem(THEME_KEY) || "system"; } catch { return "system"; }
  });

  function setThemePref(pref) {
    setThemePrefState(pref);
    try { localStorage.setItem(THEME_KEY, pref); } catch { /* ignore */ }
  }

  useEffect(() => {
    const root = document.documentElement;
    if (themePref === "light" || themePref === "dark") root.setAttribute("data-theme", themePref);
    else root.removeAttribute("data-theme");
  }, [themePref]);
  const timers = useRef([]);
  const refsStore = useRef({});
  const dataRef = useRef(data);
  const dbDocRef = useRef(null);
  function ref(key) {
    const r = refsStore.current;
    if (!r[key]) r[key] = { current: null };
    return r[key];
  }

  // Local edits: update state, cache to localStorage, and push the whole
  // document to the cloud store when it's available. dataRef stays in sync
  // synchronously so a rapid run of edits (and checkHydra) always builds on
  // the latest value instead of a stale render's closure.
  function mut(fn) {
    const next = structuredClone(dataRef.current);
    fn(next);
    dataRef.current = next;
    setData(next);
    persist(next);
    if (dbDocRef.current) dbDocRef.current.set(next).catch(() => {});
  }

  // Cloud updates land here — never re-written back to the store, or every
  // viewer's snapshot would retrigger every other viewer's write forever.
  function applyRemote(remote) {
    dataRef.current = remote;
    setData(remote);
    persist(remote);
  }

  function toast(kicker, msg) {
    const id = Math.random();
    setToasts((s) => [...s, { id, kicker, msg }]);
    const t = setTimeout(() => setToasts((s) => s.filter((x) => x.id !== id)), 3800);
    timers.current.push(t);
  }

  function notify(title, body) {
    try {
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        new Notification(title, { body, tag: "lifeos-hydra" });
        return true;
      }
    } catch { /* ignore */ }
    return false;
  }

  // Sunday 20:00 — a text summary of the week's daily check-ins ("Mon 7.2 ·
  // Tue — · … — average 7.4/10"). Same honest limitation as hydration
  // reminders: this only fires while the app happens to be open (foreground
  // or a lingering tab) around that time — there's no backend to wake it
  // otherwise. Fires at most once per week (tracked in weeklyDigest.fired).
  function checkWeeklyDigest() {
    const now = new Date();
    if (now.getDay() !== 0 || now.getHours() < 20) return;
    const d = dataRef.current;
    const wk = weekKey(now);
    if (d.weeklyDigest && d.weeklyDigest.fired && d.weeklyDigest.fired[wk]) return;
    const mon = monday(now);
    const scores = Array.from({ length: 7 }, (_, i) => {
      const k = iso(addDays(mon, i));
      return { dow: DOW[parseIso(k).getDay()], s: recovScore(d.recovery[k]) };
    });
    const vals = scores.filter((x) => x.s !== null).map((x) => x.s);
    const avg = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : null;
    const body = scores.map((x) => x.dow + " " + (x.s === null ? "—" : x.s.toFixed(1))).join(" · ") + (avg !== null ? " — average " + avg + "/10" : " — nothing logged this week");
    const next = structuredClone(d);
    next.weeklyDigest = next.weeklyDigest || { fired: {} };
    next.weeklyDigest.fired[wk] = true;
    dataRef.current = next;
    setData(next);
    persist(next);
    if (dbDocRef.current) dbDocRef.current.set(next).catch(() => {});
    notify("This week’s form · Life OS", body);
    toast("This week’s form", body);
  }

  useEffect(() => {
    checkWeeklyDigest();
    const iv = setInterval(() => { checkWeeklyDigest(); }, 20000);
    timers.current.push(iv);
    return () => {
      timers.current.forEach((t) => { clearTimeout(t); clearInterval(t); });
      timers.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cloud store: available only when this page is opened through the
  // claude.ai viewer with the db capability granted. Falls back to
  // localStorage-only (already the default above) everywhere else.
  useEffect(() => {
    let cancelled = false;
    let unsub = null;
    (async () => {
      const c = typeof window !== "undefined" ? window.claude : undefined;
      if (!c || typeof c.use !== "function") { setSyncMode("local"); return; }
      let db = null;
      try { db = await c.use("db"); } catch { db = null; }
      if (cancelled || !db) { if (!cancelled) setSyncMode("local"); return; }
      const docRef = db.doc(DB_PATH);
      unsub = docRef.onSnapshot(
        (snap) => {
          if (cancelled) return;
          if (snap.exists) {
            const remote = snap.data();
            if (remote && remote.version === 4) {
              const mealsChanged = migrateMeals(remote);
              const flashChanged = migrateFlashcards(remote);
              const langChanged = migrateDeckLanguages(remote);
              applyRemote(remote);
              if (mealsChanged || flashChanged || langChanged) docRef.set(remote).catch(() => {});
            }
          } else {
            docRef.set(dataRef.current).catch(() => {});
          }
          dbDocRef.current = docRef;
          setSyncMode("cloud");
        },
        () => setSyncMode("local"),
      );
    })();
    return () => {
      cancelled = true;
      if (unsub) unsub();
      dbDocRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (syncMode === "checking") return;
    toast(
      "Storage",
      syncMode === "cloud" ? "Cloud sync on — saved to your account, kept across devices." : "Saved on this device only — cloud sync isn’t available here.",
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncMode]);

  // ---- shared derived data ----
  const now = new Date();
  const tk = iso(now);
  const mon = monday(now);

  function planOf(d, k) { return plan(d, k, hash); }
  function taskDoneOf(t, date) { return !!(t.done || {})[taskKeyOf(t, date)]; }
  function taskKeyOf(t, date) {
    if (t.repeat === "daily") return iso(date);
    if (t.repeat === "weekly") return weekKey(date);
    if (t.repeat === "monthly") return monthKey(date);
    return "once";
  }

  function toggleTaskForDate(id, date, from) {
    let after = false, title = "";
    mut((d) => {
      const t = d.tasks.filter((x) => x.id === id)[0];
      if (!t) return;
      t.done = t.done || {};
      const k = taskKeyOf(t, date);
      t.done[k] = !t.done[k];
      after = t.done[k];
      title = t.title;
    });
    if (title) toast(from === "today" ? "Synced" : from === "catchup" ? "Yesterday" : "To-do", after ? "“" + title + "” ticked" + (from === "catchup" ? " for yesterday." : " — updated in " + (from === "today" ? "Goals" : "Today") + ".") : "“" + title + "” reopened.");
  }
  function toggleTask(id, from) { toggleTaskForDate(id, now, from); }

  function chooseMeal(dayT, slot, mealId, mealName) {
    mut((x) => {
      x.mealChoice = x.mealChoice || {};
      const key = dayT + "|" + slot;
      if (mealId) x.mealChoice[key] = mealId; else delete x.mealChoice[key];
    });
    toast("Meal", mealId ? slot + " set to “" + mealName + "” for every " + (dayT === "training" ? "training" : "rest") + " day." : slot + " back to automatic rotation.");
  }

  // The recurring weekly pattern (which weekday defaults to track/gym/rest),
  // editable from Settings. A specific date can still be overridden on top
  // of this from Nutrition > Day (stored in data.sessions, checked first).
  function cycleWeekPlanDay(dow) {
    const order = ["track", "gym", "rest"];
    const cur = (data.weekPlan && data.weekPlan[dow]) || DEFAULT_PLAN[dow];
    const next = order[(order.indexOf(cur) + 1) % order.length];
    mut((x) => { x.weekPlan = x.weekPlan || Object.assign({}, DEFAULT_PLAN); x.weekPlan[dow] = next; });
    toast("Weekly schedule", DOW[dow] + " is now " + TYPES[next] + " by default.");
  }

  function setDayType(k, o, dateLabel) {
    mut((x) => { x.sessions[k] = o; });
    toast("Day type", dateLabel + " set to " + TYPES[o] + " — meals recomputed.");
  }

  // Flashcards — Leitner scheduling in two phases: a straight first pass
  // through the queue with no immediate repeats (a wrong answer just files
  // the card as "unknown" and the session moves on), then optional review
  // rounds over just the unknown pile or just the known pile, either of
  // which can flip a card's bucket. The 5-box interval scheduling itself
  // (startStudy/scoreCard) is unchanged — only the session flow around it.
  function shuffleIds(arr) {
    const ids = arr.slice();
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = ids[i]; ids[i] = ids[j]; ids[j] = tmp;
    }
    return ids;
  }

  function startStudy(deckId, onlyDue) {
    const t = iso(new Date());
    const cards = (dataRef.current.flashCards || []).filter((c) => c.deckId === deckId && (!onlyDue || c.due <= t));
    if (!cards.length) { toast("Flashcards", onlyDue ? "Nothing due in this deck right now." : "This deck has no cards yet."); return; }
    setFlashStudy({ deckId, phase: "pass", queue: shuffleIds(cards.map((c) => c.id)), pos: 0, flipped: false, known: [], unknown: [] });
  }

  function scoreCard(cardId, good) {
    mut((x) => {
      const c = (x.flashCards || []).filter((y) => y.id === cardId)[0];
      if (!c) return;
      if (good) {
        c.box = Math.min(FLASH_BOX_MAX, (c.box || 1) + 1);
        c.due = iso(addDays(new Date(), FLASH_INTERVALS_DAYS[c.box - 1]));
      } else {
        c.box = 1;
        c.due = iso(addDays(new Date(), 1));
      }
    });
  }

  function answerCard(good) {
    const s = flashStudy;
    if (!s) return;
    const cardId = s.queue[s.pos];
    scoreCard(cardId, good);
    const known = good ? s.known.concat([cardId]) : s.known.filter((id) => id !== cardId);
    const unknown = good ? s.unknown.filter((id) => id !== cardId) : s.unknown.concat([cardId]);
    const nextPos = s.pos + 1;
    if (nextPos >= s.queue.length) {
      setFlashStudy({ deckId: s.deckId, phase: "summary", queue: [], pos: 0, flipped: false, known, unknown });
    } else {
      setFlashStudy({ deckId: s.deckId, phase: s.phase, queue: s.queue, pos: nextPos, flipped: false, known, unknown });
    }
  }

  function reviewGroup(which) {
    const s = flashStudy;
    if (!s) return;
    const ids = which === "unknown" ? s.unknown : s.known;
    if (!ids.length) return;
    setFlashStudy({ deckId: s.deckId, phase: "review-" + which, queue: shuffleIds(ids), pos: 0, flipped: false, known: s.known, unknown: s.unknown });
  }

  function endStudy() {
    const s = flashStudy;
    if (s) toast("Flashcards", "Session done — " + s.known.length + " known, " + s.unknown.length + " to revisit.");
    setFlashStudy(null);
  }

  // Daily to-do time tracking — logging minutes also flips the ordinary
  // done flag for that day, so streak grids and goal progress keep working
  // unchanged for time-tracked tasks.
  function logTaskTime(taskId, dateKey, minutes) {
    mut((x) => {
      const t = x.tasks.filter((y) => y.id === taskId)[0];
      if (!t) return;
      t.timeLog = t.timeLog || {};
      if (minutes > 0) t.timeLog[dateKey] = minutes; else delete t.timeLog[dateKey];
      t.done = t.done || {};
      t.done[dateKey] = minutes > 0;
    });
  }

  function openTaskGrid(taskId) {
    setTab("goals"); setGsub("todo"); setScope("daily"); setGridView({ kind: "daily", taskId });
  }

  function shopAgg(d) {
    const agg = {};
    for (let i = 0; i < 7; i++) {
      const k = iso(addDays(mon, i));
      planOf(d, k).forEach((o) => o.m.ing.forEach((g) => {
        const key = "a:" + g.n + "|" + g.u;
        agg[key] = agg[key] || { key, n: g.n, u: g.u, c: g.c || catOf(g.n), q: 0, auto: true };
        agg[key].q += g.q;
      }));
    }
    d.shopExtra.forEach((e) => { agg["x:" + e.id] = { key: "x:" + e.id, n: e.n, u: e.u, c: e.c, q: e.q, auto: false, id: e.id }; });
    return Object.keys(agg).map((k) => agg[k]).filter((i) => !d.shopHidden[i.key]).map((i) => {
      const ov = d.shopQty[i.key];
      return Object.assign({}, i, { q: ov === undefined ? i.q : ov });
    });
  }
  function shopSetQty(item, delta) {
    const step = UNIT_STEP[item.u] ?? 1;
    mut((d) => {
      const cur = d.shopQty[item.key] === undefined ? item.q : d.shopQty[item.key];
      d.shopQty[item.key] = Math.max(0, Math.round((cur + delta * step) * 100) / 100);
    });
  }

  const vals = useMemo(
    () => computeVals(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      data, tab, toasts, selDay, chartDist, ssub, nsub, gsub, tsub, libFilter, scope, timeKind,
      editingMealId, syncMode, flashLanguage, flashDeckId, editingDeckId, flashStudy, gridView, weekOffset, horizonDomain, openBookId, openLearningId, editingLearningId,
    ],
  );

  function computeVals() {
    const d = data;
    const type = sessionType(d, tk);
    const rec = Object.assign({}, RECOV_DEFAULT, d.recovery[tk] || {});
    const recScore = recovScore(d.recovery[tk]);
    const recovLabel = recScore === null ? "Not logged" : recScore >= 7.5 ? "Good" : recScore >= 5.5 ? "Moderate" : "Low";
    const weekDays = Array.from({ length: 7 }, (_, i) => iso(addDays(mon, i)));
    const navMon = addDays(mon, weekOffset * 7);
    const navWeekDays = Array.from({ length: 7 }, (_, i) => iso(addDays(navMon, i)));
    const todayTasks = d.tasks.filter((t) => t.repeat === "daily" || (t.repeat === "once" && t.date === tk));
    const openTasks = todayTasks.filter((t) => !taskDoneOf(t, now)).length;

    const v = {
      tabs: TAB_DEFS.map((t) => ({
        key: t[0], label: t[1], active: tab === t[0], pick: () => setTab(t[0]),
      })),
      tab,
      isToday: tab === "today", isNutri: tab === "nutrition", isSprint: tab === "sprint", isGoals: tab === "goals", isTrack: tab === "track", isSettings: tab === "settings",
      toasts: toasts.map((t) => Object.assign({}, t, {
        st: { pointerEvents: "auto", maxWidth: "420px", background: "var(--text)", color: "var(--bg)", padding: "12px 16px", borderLeft: "3px solid var(--green)", borderRadius: "99px", boxShadow: "0 12px 32px var(--shadow)", animation: "osToast .22s ease-out" },
      })),
    };

    // ---- TODAY ----
    const yesterday = addDays(now, -1);
    const yKey = iso(yesterday);
    const yesterdayOpen = d.tasks.filter((t) => t.repeat === "daily" && !taskDoneOf(t, yesterday));
    const todayLearning = d.learnings.filter((l) => l.date === tk)[0];
    const readingBooks = d.books.filter((b) => b.status === "Reading");
    const checkinText = (() => {
      const s = recScore === null ? "—" : recScore.toFixed(1);
      const lines = RECOV.map((m) => m.label + ": " + (rec[m.k] === null || rec[m.k] === undefined ? "—" : rec[m.k] + "/10"));
      return "Daily check-in — " + fmtFull(tk) + "\n" + TYPES[type] + "\n\n" + lines.join("\n") + "\n\nOverall: " + s + "/10 (" + recovLabel + ")" + (rec.note ? "\nNote: " + rec.note : "");
    })();
    v.today = {
      headline: TYPES[type] + " · " + openTasks + (openTasks === 1 ? " task" : " tasks") + " left to close" + (recScore === null ? " · check-in not filled in yet." : " · form " + recScore.toFixed(1) + "/10."),
      checkinLabel: recScore === null ? "Fill in the check-in →" : "Adjust the check-in →",
      goCheckin: () => { setTab("sprint"); setSsub("checkin"); },
      share: () => {
        const payload = { title: "Daily check-in", text: checkinText };
        if (typeof navigator !== "undefined" && navigator.share) {
          navigator.share(payload).then(() => toast("Shared", "Check-in sent.")).catch(() => {});
          return;
        }
        if (typeof navigator !== "undefined" && navigator.clipboard) {
          navigator.clipboard.writeText(checkinText).then(() => toast("Copied", "Check-in copied — paste it into a message.")).catch(() => {});
        }
        try { window.open("sms:?body=" + encodeURIComponent(checkinText), "_self"); } catch { /* ignore */ }
      },
      readingBooks: readingBooks.map((b) => ({
        key: b.id, t: b.title, cover: b.cover || null,
        open: () => { setTab("track"); setTsub("books"); setOpenBookId(b.id); },
      })),
      readingEmpty: readingBooks.length ? "" : "Nothing marked “Reading” yet — add one under Tracking → Reading.",
      tasks: todayTasks.map((t) => {
        const done = taskDoneOf(t, now);
        const isDaily = t.repeat === "daily";
        const isTimed = !!(isDaily && t.timeTarget);
        return {
          id: t.id, title: t.title, link: taskLink(d, t, fmtShort), box: box(done), mark: done ? "✓" : "", name: strikeStyle(done),
          toggle: () => toggleTask(t.id, "today"),
          openGrid: isDaily ? () => openTaskGrid(t.id) : null,
          isTimed, timeTarget: t.timeTarget || 0, minutesToday: isTimed ? ((t.timeLog || {})[tk] || 0) : 0,
          logMinutes: isTimed ? (mins) => logTaskTime(t.id, tk, mins) : null,
        };
      }),
      yesterday: {
        date: fmtShort(yKey),
        tasks: yesterdayOpen.map((t) => ({
          id: t.id, title: t.title, box: box(false), toggle: () => toggleTaskForDate(t.id, yesterday, "catchup"),
        })),
      },
      addTask: (e) => {
        e.preventDefault();
        const el = ref("todayTask").current, v2 = el && el.value.trim();
        if (!v2) return;
        mut((x) => { x.tasks.push({ id: "t" + Date.now(), title: v2, goal: null, repeat: "once", date: tk, done: {} }); });
        el.value = "";
        toast("Goals", "Task added to today’s list.");
      },
      goals: d.goals.filter((g) => !g.done).sort((a, b) => ((a.due || "9") < (b.due || "9") ? -1 : 1)).slice(0, 4).map((g) => {
        const dom = DOMAINS.filter((x) => x.id === g.domain)[0];
        const prog = goalProgress(d, g, weekKey, monthKey);
        return { id: g.id, title: g.title, prog, bar: bar(prog, "var(--green)"), meta: (dom ? dom.name : "") + (g.due ? " · " + fmtShort(g.due) : "") };
      }),
      nextDeadline: (() => {
        const up = d.goals.filter((g) => !g.done && g.due && g.due >= tk).sort((a, b) => (a.due < b.due ? -1 : 1))[0];
        return up ? up.title + " — " + fmtShort(up.due) : "No deadline ahead";
      })(),
      notes: {
        items: (d.quickNotes || []).map((n) => ({
          key: n.id, text: n.text,
          remove: () => { mut((x) => { x.quickNotes = (x.quickNotes || []).filter((y) => y.id !== n.id); }); },
        })),
        empty: (d.quickNotes || []).length ? "" : "Nothing jotted down — quick things to remember or do go here.",
        add: (e) => {
          e.preventDefault();
          const el = ref("quickNote").current, v2 = el && el.value.trim();
          if (!v2) return;
          mut((x) => { x.quickNotes = x.quickNotes || []; x.quickNotes.unshift({ id: "qn" + Date.now(), text: v2 }); });
          el.value = "";
        },
      },
    };

    // ---- NUTRITION ----
    const sel = selDay;
    const selPlan = planOf(d, sel);
    const selTotals = selPlan.reduce((a, o) => ({ k: a.k + o.m.kcal, p: a.p + o.m.p, c: a.c + o.m.c, f: a.f + o.m.f }), { k: 0, p: 0, c: 0, f: 0 });
    const lf = libFilter;
    const shopItems = shopAgg(d);
    v.nutri = {
      subs: [["day", "Day"], ["meals", "Meals"], ["groceries", "Groceries"]].map((s) => ({ key: s[0], label: s[1], st: chip(nsub === s[0]), pick: () => setNsub(s[0]) })),
      isDay: nsub === "day", isLib: nsub === "meals", isShop: nsub === "groceries",
      weekNav: {
        label: fmtShort(navWeekDays[0]) + " – " + fmtShort(navWeekDays[6]),
        isThisWeek: weekOffset === 0,
        prev: () => { setWeekOffset(weekOffset - 1); setSelDay(iso(addDays(navMon, -7))); },
        next: () => { setWeekOffset(weekOffset + 1); setSelDay(iso(addDays(navMon, 7))); },
        today: () => { setWeekOffset(0); setSelDay(tk); },
      },
      days: navWeekDays.map((k) => {
        const dd = parseIso(k), t = sessionType(d, k), on = k === sel;
        return {
          key: k, dow: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dd.getDay()], num: dd.getDate(), tag: t === "rest" ? "rest" : "training",
          pick: () => setSelDay(k),
          st: { flex: "1 1 84px", border: "1px solid " + (on ? "var(--text)" : "var(--line)"), background: on ? "var(--text)" : "transparent", color: on ? "var(--bg)" : "var(--text)", padding: "9px 6px", borderRadius: "99px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", textAlign: "center" },
        };
      }),
      dayOverride: {
        options: ["track", "gym", "rest"].map((o) => ({
          label: TYPES[o],
          st: chip(sessionType(d, sel) === o, o === "rest" ? "var(--hint)" : o === "gym" ? "var(--red)" : "var(--green)"),
          pick: () => setDayType(sel, o, fmtLong(parseIso(sel))),
        })),
      },
      selLabel: fmtLong(parseIso(sel)) + " · " + selPlan.length + " meals",
      selMeals: selPlan.map((m) => {
        const dayT = dayKind(d, sel);
        const cand = candidates(d, sel, m.slot);
        const chosenId = (d.mealChoice && d.mealChoice[dayT + "|" + m.slot]) || "";
        return {
          key: m.slot, slot: m.slot, time: m.time, title: m.m.name, macros: macroTxt(m.m), ingLine: ingTxt(m.m),
          dayTypeLabel: dayT === "training" ? "training days" : "rest days",
          chooseValue: chosenId,
          chooseOptions: [{ v: "", l: "Automatic (rotates)" }].concat(cand.map((c) => ({ v: c.id, l: c.name }))),
          choose: (id) => { const picked = cand.filter((c) => c.id === id)[0]; chooseMeal(dayT, m.slot, id || null, picked ? picked.name : ""); },
        };
      }),
      totals: [
        { label: "Kcal", val: selTotals.k },
        { label: "Protein", val: selTotals.p + " g" },
        { label: "Carbs", val: selTotals.c + " g" },
        { label: "Fat", val: selTotals.f + " g" },
      ],
      libCount: d.meals.length + " saved",
      libFilters: ["All"].concat(SLOTS).map((f) => ({ label: f, st: chip(lf === f), pick: () => setLibFilter(f) })),
      lib: d.meals.filter((m) => lf === "All" || m.slot === lf).map((m) => ({
        key: m.id, name: m.name, slot: m.slot, time: m.time,
        dayTxt: m.day === "training" ? "Training day" : "Rest day",
        slotTag: tag("var(--green-mid)"), dayTag: tag(m.day === "training" ? "var(--red-dark)" : "var(--hint)"),
        macros: macroTxt(m), ingLine: ingTxt(m),
        editing: editingMealId === m.id,
        edit: () => setEditingMealId(m.id),
        cancelEdit: () => setEditingMealId(null),
        editVals: {
          name: m.name, slot: m.slot, time: m.time, day: m.day,
          kcal: m.kcal, p: m.p, c: m.c, f: m.f,
          ingLines: m.ing.map((g) => g.n + " " + g.q + (g.u ? " " + g.u : "")).join("\n"),
        },
        refs: {
          name: ref("em_name_" + m.id), slot: ref("em_slot_" + m.id), time: ref("em_time_" + m.id), day: ref("em_day_" + m.id),
          kcal: ref("em_kcal_" + m.id), p: ref("em_p_" + m.id), c: ref("em_c_" + m.id), f: ref("em_f_" + m.id), ing: ref("em_ing_" + m.id),
        },
        saveEdit: (e) => {
          e.preventDefault();
          const r = { name: ref("em_name_" + m.id), slot: ref("em_slot_" + m.id), time: ref("em_time_" + m.id), day: ref("em_day_" + m.id), kcal: ref("em_kcal_" + m.id), p: ref("em_p_" + m.id), c: ref("em_c_" + m.id), f: ref("em_f_" + m.id), ing: ref("em_ing_" + m.id) };
          const name = (r.name.current.value || "").trim();
          if (!name) { toast("Meal", "The meal needs a name."); return; }
          mut((x) => {
            const q = x.meals.filter((y) => y.id === m.id)[0];
            if (!q) return;
            q.name = name; q.slot = r.slot.current.value; q.time = r.time.current.value || m.time; q.day = r.day.current.value;
            q.kcal = +(r.kcal.current.value || 0); q.p = +(r.p.current.value || 0); q.c = +(r.c.current.value || 0); q.f = +(r.f.current.value || 0);
            q.ing = parseIngLines(r.ing.current.value);
          });
          setEditingMealId(null);
          toast("Meal library", "“" + name + "” updated.");
        },
        remove: () => { mut((x) => { x.meals = x.meals.filter((y) => y.id !== m.id); }); toast("Meal library", "“" + m.name + "” deleted."); },
      })),
      addMeal: (e) => {
        e.preventDefault();
        const name = (ref("mName").current.value || "").trim();
        if (!name) { toast("Meal", "The meal needs a name."); return; }
        const meal = {
          id: "m" + Date.now(), name, slot: ref("mSlot").current.value, time: ref("mTime").current.value || "12:30", day: ref("mDay").current.value,
          kcal: +(ref("mKcal").current.value || 0), p: +(ref("mP").current.value || 0), c: +(ref("mC").current.value || 0), f: +(ref("mF").current.value || 0),
          ing: parseIngLines(ref("mIng").current.value),
        };
        mut((x) => { x.meals.unshift(meal); });
        ["mName", "mKcal", "mP", "mC", "mF", "mIng"].forEach((k) => { ref(k).current.value = ""; });
        toast("Meal library", "“" + name + "” added — it joins the rotation and the grocery list.");
      },
      cats: CATS.map((c) => ({ v: c })),
      shopMeta: shopItems.length + " lines · week of " + fmtShort(weekDays[0]) + " to " + fmtShort(weekDays[6]),
      shop: CATS.map((c) => ({
        cat: c, items: shopItems.filter((i) => i.c === c).sort((a, b) => (a.n < b.n ? -1 : 1)).map((i) => {
          const bought = !!d.bought[i.key];
          const pieceG = i.c === "Produce" && i.u === "g" ? pieceWeightFor(i.n) : null;
          const qLabel = pieceG ? Math.max(1, Math.round(i.q / pieceG)) + " pc" : Math.round(i.q * 10) / 10 + (i.u ? " " + i.u : "");
          return {
            key: i.key, n: i.n, q: qLabel,
            box: box(bought), mark: bought ? "✓" : "", name: strikeStyle(bought),
            toggle: () => { mut((x) => { x.bought[i.key] = !x.bought[i.key]; }); },
            plus: () => shopSetQty(i, 1), minus: () => shopSetQty(i, -1),
            remove: () => { mut((x) => { if (i.auto) { x.shopHidden[i.key] = true; } else { x.shopExtra = x.shopExtra.filter((y) => y.id !== i.id); } }); },
          };
        }),
      })).filter((c) => c.items.length),
      regen: () => { mut((x) => { x.bought = {}; x.shopQty = {}; x.shopHidden = {}; }); toast("Groceries", "Quantities recomputed from this week’s meals."); },
      addItem: (e) => {
        e.preventDefault();
        const n = (ref("sName").current.value || "").trim();
        if (!n) return;
        const item = { id: "x" + Date.now(), n, q: parseFloat((ref("sQty").current.value || "1").replace(",", ".")) || 1, u: ref("sUnit").current.value, c: ref("sCat").current.value };
        mut((x) => { x.shopExtra.push(item); });
        ref("sName").current.value = ""; ref("sQty").current.value = "";
        toast("Groceries", n + " added to the list.");
      },
    };

    // ---- SPRINT ----
    const fmtT = (val) => val.toFixed(2);
    const distsAll = Array.from(new Set(d.times.map((t) => t.dist).concat(d.targets.map((t) => t.dist)))).sort((a, b) => distNum(a) - distNum(b));
    const cDist = distsAll.indexOf(chartDist) >= 0 ? chartDist : distsAll[0] || "";
    const paceTxt = (g) => {
      const r = recOf(d, g.dist);
      if (!r) return "No time on this distance yet — log a reference run.";
      const gap = Math.round((r.t - g.t) * 100) / 100;
      if (gap <= 0) return "Already achieved (best " + fmtT(r.t) + ").";
      const days = g.due ? Math.round((parseIso(g.due) - parseIso(tk)) / 86400000) : null;
      if (days === null) return gap.toFixed(2) + " s to find off the best (" + fmtT(r.t) + "), no deadline set.";
      if (days <= 0) return "Deadline passed — " + gap.toFixed(2) + " s were still to find.";
      const months = Math.max(1, days / 30.4);
      return gap.toFixed(2) + " s to find in " + days + " days — about " + (gap / months).toFixed(2) + " s per month.";
    };
    const chartList = d.times.filter((t) => t.dist === cDist).sort((a, b) => (a.date < b.date ? -1 : 1));
    const chartTargets = targetsOf(d, cDist);
    const cv = chartList.map((t) => t.t).concat(chartTargets.map((g) => g.t));
    const cmin = cv.length ? Math.min.apply(null, cv) : 0, cmax = cv.length ? Math.max.apply(null, cv) : 1;
    const span = cmax - cmin || 1, yOf = (val) => Math.round((10 + ((val - cmin) / span) * 100) * 10) / 10;
    const xOf = (i) => (chartList.length > 1 ? Math.round((i / (chartList.length - 1)) * 318 * 10) / 10 : 160);
    const trend = (() => {
      if (chartList.length < 2) return "At least two times are needed to show a trend.";
      const first = chartList[0], last = chartList[chartList.length - 1], diff = last.t - first.t;
      return (diff < 0 ? Math.abs(diff).toFixed(2) + " s gained" : diff > 0 ? diff.toFixed(2) + " s lost" : "no change") + " since " + fmtShort(first.date) + " across " + chartList.length + " times.";
    })();
    const logDates = Object.keys(d.recovery).sort().reverse();
    const sparkDays = Array.from({ length: 30 }, (_, i) => iso(addDays(now, -(29 - i))));
    const sparkScores = sparkDays.map((k) => ({ k, s: recovScore(d.recovery[k]) }));
    const sparkVals = sparkScores.filter((x) => x.s !== null).map((x) => x.s);

    v.sprint = {
      subs: [["times", "Times"], ["targets", "Targets"], ["checkin", "Daily check-in"], ["history", "History"]].map((s) => ({ key: s[0], label: s[1], st: chip(ssub === s[0]), pick: () => setSsub(s[0]) })),
      isTimes: ssub === "times", isGoalsTab: ssub === "targets", isRecov: ssub === "checkin", isLog: ssub === "history",
      byDist: distsAll.filter((dist) => d.times.some((t) => t.dist === dist)).map((dist) => {
        const rows = d.times.filter((t) => t.dist === dist).sort((a, b) => (a.date < b.date ? 1 : -1));
        const r = recOf(d, dist);
        return {
          dist, rec: r ? fmtT(r.t) : "—", recDate: r ? fmtShort(r.date) : "—", last: fmtT(rows[0].t), count: rows.length + (rows.length > 1 ? " times" : " time"),
          targets: targetsOf(d, dist).map((g) => ({ t: fmtT(g.t), dueTxt: (g.label ? g.label + " · " : "") + (g.due ? fmtShort(g.due) : "no deadline"), pace: paceTxt(g) })),
          rows: rows.map((t) => ({
            key: t.id, date: fmtShort(t.date), t: fmtT(t.t), flag: r && t.id === r.id ? "best" : "",
            kind: t.kind === "test" ? "test" : "training",
            kindSt: Object.assign({}, tag(t.kind === "test" ? "var(--red)" : "var(--hint)"), { cursor: "default", padding: "2px 8px", fontSize: "10.5px" }),
            remove: () => { mut((x) => { x.times = x.times.filter((y) => y.id !== t.id); }); toast("Times", fmtShort(t.date) + " time deleted."); },
          })),
        };
      }),
      emptyTimes: d.times.length ? "" : "No times yet — add the first one on the right.",
      kinds: [["test", "Test / race"], ["training", "Training"]].map((k) => ({ label: k[1], st: chip(timeKind === k[0], k[0] === "test" ? "var(--red)" : "var(--green)"), pick: () => setTimeKind(k[0]) })),
      addTime: (e) => {
        e.preventDefault();
        const dist = normDist(ref("timeDist").current.value);
        const v2 = parseFloat((ref("timeVal").current.value || "").replace(",", "."));
        if (!dist) { toast("Times", "Enter a distance (e.g. 40m)."); return; }
        if (!v2) { toast("Times", "Enter a time in seconds."); return; }
        const date = ref("timeDate").current.value || tk;
        const prev = recOf(d, dist);
        const kind = timeKind || "test";
        mut((x) => { x.times.push({ id: "c" + Date.now(), date, dist, t: v2, kind }); });
        ref("timeVal").current.value = "";
        setChartDist(dist);
        toast("Times", prev && v2 < prev.t && kind === "test" ? "Personal best over " + dist + ": " + fmtT(v2) + "!" : dist + " " + (kind === "test" ? "test" : "training") + " time saved.");
      },
      chartTabs: distsAll.map((dist) => ({ label: dist, st: chip(cDist === dist), pick: () => setChartDist(dist) })),
      points: chartList.map((t, i) => xOf(i) + "," + yOf(t.t)).join(" "),
      dots: chartList.map((t, i) => ({ x: xOf(i), y: yOf(t.t) })),
      objLines: chartTargets.map((g) => ({ y: yOf(g.t) })),
      chartObjTxt: chartTargets.length ? "— — target " + chartTargets.map((g) => fmtT(g.t)).join(" / ") : "no target on this distance",
      chartFrom: chartList.length ? fmtShort(chartList[0].date) : "—",
      chartTo: chartList.length ? fmtShort(chartList[chartList.length - 1].date) : "—",
      chartSummary: (cDist ? cDist + " — " : "") + trend,
      targets: d.targets.slice().sort((a, b) => distNum(a.dist) - distNum(b.dist)).map((g) => {
        const r = recOf(d, g.dist), gap = r ? r.t - g.t : null;
        const start = (() => { const l = d.times.filter((t) => t.dist === g.dist).sort((a, b) => (a.date < b.date ? -1 : 1)); return l.length ? l[0].t : null; })();
        const prog = start !== null && r && start > g.t ? Math.max(0, Math.round(((start - r.t) / (start - g.t)) * 100)) : r && r.t <= g.t ? 100 : 0;
        return {
          key: g.id, dist: g.dist, t: fmtT(g.t), dueTxt: (g.label ? g.label + " · " : "") + (g.due ? fmtShort(g.due) : "no deadline"),
          status: r ? (gap <= 0 ? "Achieved — best " + fmtT(r.t) : "Best " + fmtT(r.t) + " · " + gap.toFixed(2) + " s to find") : "No time on this distance yet",
          bar: bar(prog, "var(--red)"), pace: paceTxt(g),
          remove: () => { mut((x) => { x.targets = x.targets.filter((y) => y.id !== g.id); }); toast("Targets", g.dist + " target deleted."); },
        };
      }),
      emptyTargets: d.targets.length ? "" : "No targets yet — add a distance and a time.",
      addTarget: (e) => {
        e.preventDefault();
        const dist = normDist(ref("tgDist").current.value);
        const v2 = parseFloat((ref("tgTime").current.value || "").replace(",", "."));
        if (!dist || !v2) { toast("Targets", "Distance and target time are both needed."); return; }
        const due = ref("tgDue").current.value || null, label = (ref("tgLabel").current.value || "").trim();
        mut((x) => { x.targets.push({ id: "o" + Date.now(), dist, t: v2, due, label }); });
        ref("tgTime").current.value = ""; ref("tgLabel").current.value = "";
        setChartDist(dist);
        toast("Targets", dist + " in " + fmtT(v2) + (due ? " by " + fmtShort(due) : "") + ".");
      },
      recovDate: fmtLong(now),
      shareCheckin: () => v.today.share(),
      dayTypes: ["track", "gym", "rest"].map((o) => ({
        label: TYPES[o], st: chip(type === o, o === "rest" ? "var(--hint)" : o === "gym" ? "var(--red)" : "var(--green)"),
        pick: () => { mut((x) => { x.sessions[tk] = o; }); toast("Today’s session", TYPES[o] + " · meals and calories recomputed."); },
      })),
      recov: RECOV.map((m) => {
        const val = rec[m.k];
        return {
          key: m.k, label: m.label, hint: m.hint, valTxt: val === null || val === undefined ? "—" : val + " / 10",
          steps: (m.opt ? [null] : []).concat([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).map((n) => ({
            n: n === null ? "—" : n,
            st: Object.assign({}, chip((val === undefined ? null : val) === n, m.k === "pain" ? "var(--red)" : "var(--green)"), { padding: "5px 9px", minWidth: "30px", textAlign: "center" }),
            pick: () => { mut((x) => { x.recovery[tk] = Object.assign({}, RECOV_DEFAULT, x.recovery[tk] || {}, { type: sessionType(x, tk) }); x.recovery[tk][m.k] = n; }); },
          })),
        };
      }),
      recovScore: recScore === null ? "—" : recScore.toFixed(1),
      recovVerdict: recovLabel,
      recovAdvice: recScore === null ? "Rate at least one item to get today’s score."
        : recScore >= 7.5 ? "Green light: full intensity on the planned session."
        : recScore >= 5.5 ? "Session is fine with volume cut by about 20 %."
        : "Load is not being absorbed: active rest or low-intensity technique only.",
      saveNote: (e) => {
        e.preventDefault();
        const v2 = (ref("recNote").current.value || "").trim();
        mut((x) => { x.recovery[tk] = Object.assign({}, RECOV_DEFAULT, x.recovery[tk] || {}, { note: v2, type: sessionType(x, tk) }); });
        toast("Check-in", fmtShort(tk) + " saved to the history.");
      },
      spark: sparkScores.map((x) => ({
        title: fmtShort(x.k) + (x.s === null ? " — not filled in" : " — " + x.s.toFixed(1) + "/10"),
        st: { flex: 1, minWidth: "4px", height: x.s === null ? "3px" : Math.max(4, Math.round((x.s / 10) * 92)) + "px", background: x.s === null ? "var(--line2)" : x.s >= 7.5 ? "var(--green)" : x.s >= 5.5 ? "var(--streak-mid1)" : "var(--red)" },
      })),
      sparkFrom: fmtShort(sparkDays[0]),
      sparkAvg: sparkVals.length ? "average " + (sparkVals.reduce((a, b) => a + b, 0) / sparkVals.length).toFixed(1) + "/10 over " + sparkVals.length + " days" : "no days filled in",
      logCount: logDates.length + (logDates.length === 1 ? " day" : " days"),
      log: logDates.map((k) => {
        const e = d.recovery[k], s = recovScore(e);
        return {
          key: k, date: fmtShort(k), type: TYPES[e.type || sessionType(d, k)], score: s === null ? "—" : s.toFixed(1),
          detail: RECOV.map((m) => m.short + " " + (e[m.k] === null || e[m.k] === undefined ? "—" : e[m.k])).join(" · "),
          note: e.note || "",
          remove: () => { mut((x) => { delete x.recovery[k]; }); toast("History", fmtShort(k) + " deleted."); },
        };
      }),
    };

    // ---- GOALS ----
    const domainsComputed = DOMAINS.map((dm, idx) => {
        const list = d.goals.filter((g) => g.domain === dm.id);
        const openCount = list.filter((g) => !g.done).length;
        return {
          key: dm.id, name: dm.name,
          head: { font: "800 15px/1.25 'Plus Jakarta Sans',system-ui,sans-serif", letterSpacing: ".01em", color: idx % 2 ? "var(--red-dark)" : "var(--green-mid)" },
          count: list.length ? openCount + " open · " + list.length + " total" : "no goal yet",
          goals: list.map((g) => {
            const prog = goalProgress(d, g, weekKey, monthKey), rel = d.tasks.filter((t) => t.goal === g.id);
            return {
              key: g.id, title: g.title, prog, box: box(g.done), mark: g.done ? "✓" : "", name: strikeStyle(g.done, 15.5),
              bar: bar(prog, g.done ? "var(--hint)" : idx % 2 ? "var(--red)" : "var(--green)"),
              meta: (g.due ? "due " + fmtFull(g.due) : "no deadline") + (rel.length ? " · " + rel.filter((t) => taskDoneOf(t, now)).length + "/" + rel.length + " tasks done" : " · no task attached"),
              toggle: () => { mut((x) => { const q = x.goals.filter((y) => y.id === g.id)[0]; q.done = !q.done; }); },
              remove: () => { mut((x) => { x.goals = x.goals.filter((y) => y.id !== g.id); x.tasks.forEach((t) => { if (t.goal === g.id) t.goal = null; }); }); toast("Horizons", "“" + g.title + "” deleted."); },
            };
          }),
          add: (e) => {
            e.preventDefault();
            const ti = ref("gt_" + dm.id).current, di = ref("gd_" + dm.id).current;
            const v2 = (ti && ti.value || "").trim();
            if (!v2) return;
            const due = (di && di.value) || null;
            mut((x) => { x.goals.push({ id: "g" + Date.now(), domain: dm.id, title: v2, due, done: false }); });
            ti.value = ""; if (di) di.value = "";
            toast(dm.name, "“" + v2 + "” added" + (due ? " · due " + fmtShort(due) : "") + ".");
          },
          refTitle: ref("gt_" + dm.id), refDue: ref("gd_" + dm.id),
        };
      });

    v.goals = {
      subs: [["horizons", "Horizons"], ["todo", "To-do"], ["ideas", "Idea box"]].map((s) => ({ key: s[0], label: s[1], st: chip(gsub === s[0]), pick: () => setGsub(s[0]) })),
      isHorizons: gsub === "horizons", isTodo: gsub === "todo", isIdeas: gsub === "ideas",
      horizons: domainsComputed.map((dm) => ({ key: dm.key, name: dm.name, count: dm.count, open: () => setHorizonDomain(dm.key) })),
      horizonDetail: horizonDomain
        ? Object.assign({}, domainsComputed.filter((dm) => dm.key === horizonDomain)[0], { back: () => setHorizonDomain(null) })
        : null,
      scopeTabs: ["daily", "weekly", "monthly"].map((s) => ({ key: s, label: { daily: "Daily", weekly: "Weekly", monthly: "Monthly" }[s], st: chip(scope === s), pick: () => setScope(s) })),
      gridView: (() => {
        if (!gridView || gridView.kind !== "daily") return null;
        const t = d.tasks.filter((x) => x.id === gridView.taskId)[0];
        if (!t) return null;
        const start = monday(addDays(now, -364));
        const cells = Array.from({ length: 371 }, (_, i) => {
          const date = addDays(start, i);
          const k = iso(date);
          const future = date > now;
          const done = !future && !!(t.done || {})[k];
          return { key: k, future, done, title: future ? "" : fmtShort(k) + " — " + (done ? "done" : "missed") };
        });
        const isTimed = !!t.timeTarget;
        const timeLog = t.timeLog || {};
        const totalMin = Object.keys(timeLog).reduce((a, k) => a + timeLog[k], 0);
        const yearMin = Object.keys(timeLog).filter((k) => k.slice(0, 4) === tk.slice(0, 4)).reduce((a, k) => a + timeLog[k], 0);
        const fmtHM = (m) => Math.floor(m / 60) + "h " + (m % 60) + "min";
        return {
          kind: "daily", title: t.title, grid: { cells, from: fmtShort(iso(start)), to: fmtShort(tk) }, back: () => setGridView(null),
          isTimed, timeTarget: t.timeTarget || 0, todayMinutes: timeLog[tk] || 0,
          statsLabel: isTimed ? fmtHM(totalMin) + " total · " + fmtHM(yearMin) + " this year" : "",
          logMinutes: isTimed ? (mins) => logTaskTime(t.id, tk, mins) : null,
        };
      })(),
      tasks: d.tasks.filter((t) => t.repeat === scope).map((t) => {
        const done = taskDoneOf(t, now);
        const isTimed = !!(scope === "daily" && t.timeTarget);
        return {
          key: t.id, title: t.title, link: taskLink(d, t, fmtShort), box: box(done), mark: done ? "✓" : "", name: strikeStyle(done),
          toggle: () => toggleTask(t.id, "goals"),
          remove: () => { mut((x) => { x.tasks = x.tasks.filter((y) => y.id !== t.id); }); },
          openGrid: scope === "daily" ? () => setGridView({ kind: "daily", taskId: t.id }) : null,
          isTimed, timeTarget: t.timeTarget || 0, minutesToday: isTimed ? ((t.timeLog || {})[tk] || 0) : 0,
          logMinutes: isTimed ? (mins) => logTaskTime(t.id, tk, mins) : null,
        };
      }),
      tasksEmpty: d.tasks.filter((t) => t.repeat === scope).length ? "" : "Nothing here yet — add a task on the right.",
      linkOpts: [{ v: "", l: "No goal" }].concat(d.goals.map((g) => {
        const dom = DOMAINS.filter((x) => x.id === g.domain)[0];
        return { v: g.id, l: (dom ? dom.name.split(" ")[0] + " — " : "") + g.title };
      })),
      addTask: (e) => {
        e.preventDefault();
        const v2 = (ref("gTask").current.value || "").trim();
        if (!v2) return;
        const repeat = ref("gRepeat").current.value, goal = ref("gGoal").current.value || null;
        const timeTargetRaw = ref("gTimeTarget").current && ref("gTimeTarget").current.value;
        const timeTarget = repeat === "daily" && timeTargetRaw ? Math.max(0, Math.round(+timeTargetRaw)) : 0;
        mut((x) => {
          const task = { id: "t" + Date.now(), title: v2, goal, repeat, date: tk, done: {} };
          if (timeTarget) { task.timeTarget = timeTarget; task.timeLog = {}; }
          x.tasks.push(task);
        });
        ref("gTask").current.value = ""; if (ref("gTimeTarget").current) ref("gTimeTarget").current.value = "";
        setScope(repeat);
        toast("To-do", repeat === "daily" ? "Added — it will show on Today every day." : REPEATS[repeat] + " task added.");
      },
      ideaCount: d.ideas.length + (d.ideas.length === 1 ? " entry" : " entries"),
      ideas: d.ideas.map((i) => ({
        key: i.id, text: i.text, date: fmtFull(i.date), textSt: prose(15),
        remove: () => { mut((x) => { x.ideas = x.ideas.filter((y) => y.id !== i.id); }); },
      })),
      addIdea: (e) => {
        e.preventDefault();
        const v2 = (ref("idea").current.value || "").trim();
        if (!v2) return;
        mut((x) => { x.ideas.unshift({ id: "i" + Date.now(), text: v2, date: tk }); });
        ref("idea").current.value = "";
        toast("Idea box", "Kept, exactly as written.");
      },
    };

    // ---- TRACKING ----
    const booksComputed = d.books.map((b) => {
        const cyc = { "To read": "Reading", Reading: "Finished", Finished: "To read" };
        const c = b.status === "Reading" ? "var(--green)" : b.status === "Finished" ? "var(--hint)" : "var(--red)";
        return {
          key: b.id, t: b.title, a: b.author || "—", status: b.status, tag: tag(c), review: b.review || "", ratingTxt: (b.rating || 0) + " / 10",
          cover: b.cover || null,
          coverInputRef: ref("cover_" + b.id),
          pickCover: () => { const el = ref("cover_" + b.id).current; if (el) el.click(); },
          setCover: (file) => {
            if (!file) return;
            resizeImageFile(file, 640, 0.82).then((dataUrl) => {
              mut((x) => { const q = x.books.filter((y) => y.id === b.id)[0]; if (q) q.cover = dataUrl; });
              toast("Reading", "Cover added for “" + b.title + "”.");
            }).catch(() => toast("Reading", "Couldn’t read that image."));
          },
          removeCover: () => { mut((x) => { const q = x.books.filter((y) => y.id === b.id)[0]; if (q) q.cover = null; }); },
          stars: Array.from({ length: 10 }, (_, i) => ({
            title: i + 1 + " / 10",
            st: { border: 0, background: "transparent", padding: "0 1px", font: "700 19px/1 'Plus Jakarta Sans',system-ui,sans-serif", cursor: "pointer", color: i < (b.rating || 0) ? "var(--red)" : "var(--line)" },
            pick: () => { mut((x) => { const q = x.books.filter((y) => y.id === b.id)[0]; q.rating = q.rating === i + 1 ? 0 : i + 1; }); },
          })),
          cycle: () => { mut((x) => { const q = x.books.filter((y) => y.id === b.id)[0]; q.status = cyc[q.status] || "To read"; }); },
          remove: () => { mut((x) => { x.books = x.books.filter((y) => y.id !== b.id); }); toast("Reading", "“" + b.title + "” removed from the shelf."); },
          refReview: ref("br_" + b.id), refQuote: ref("bq_" + b.id),
          saveReview: (e) => {
            e.preventDefault();
            const v2 = ref("br_" + b.id).current && ref("br_" + b.id).current.value || "";
            mut((x) => { const q = x.books.filter((y) => y.id === b.id)[0]; q.review = v2; });
            toast("Reading", "Review saved for “" + b.title + "”.");
          },
          quotes: (b.quotes || []).map((q, qi) => ({
            key: qi, text: "“" + q + "”", st: { flex: 1, minWidth: 0, font: "700 14px/1.6 'Plus Jakarta Sans',system-ui,sans-serif", fontStyle: "italic", color: "var(--muted)", whiteSpace: "pre-wrap" },
            remove: () => { mut((x) => { const bk = x.books.filter((y) => y.id === b.id)[0]; bk.quotes = bk.quotes.filter((_, j) => j !== qi); }); },
          })),
          addQuote: (e) => {
            e.preventDefault();
            const v2 = (ref("bq_" + b.id).current && ref("bq_" + b.id).current.value || "").trim();
            if (!v2) return;
            mut((x) => { const bk = x.books.filter((y) => y.id === b.id)[0]; bk.quotes = (bk.quotes || []).concat([v2]); });
            ref("bq_" + b.id).current.value = "";
            toast("Reading", "Passage added.");
          },
        };
      });

    v.track = {
      subs: [["books", "Reading"], ["learnings", "Learnings"], ["flashcards", "Flashcards"]].map((s) => ({ key: s[0], label: s[1], st: chip(tsub === s[0]), pick: () => setTsub(s[0]) })),
      isBooks: tsub === "books", isLearn: tsub === "learnings", isFlash: tsub === "flashcards",
      bookMeta: (() => {
        const f = d.books.filter((b) => b.status === "Finished").length, r = d.books.filter((b) => b.status === "Reading").length;
        return f + " finished · " + r + " reading · " + d.books.length + " total";
      })(),
      addBook: (e) => {
        e.preventDefault();
        const t = (ref("bTitle").current.value || "").trim();
        if (!t) return;
        mut((x) => { x.books.unshift({ id: "b" + Date.now(), title: t, author: (ref("bAuthor").current.value || "").trim(), status: ref("bStatus").current.value, rating: 0, review: "", quotes: [] }); });
        ref("bTitle").current.value = ""; ref("bAuthor").current.value = "";
        toast("Reading", "“" + t + "” added to the shelf.");
      },
      bookTiles: booksComputed.map((b) => ({ key: b.key, t: b.t, cover: b.cover, open: () => setOpenBookId(b.key) })),
      bookDetail: openBookId
        ? Object.assign({}, booksComputed.filter((b) => b.key === openBookId)[0], { back: () => setOpenBookId(null) })
        : null,
      learnDate: fmtLong(now),
      learnCount: d.learnings.length + (d.learnings.length === 1 ? " entry" : " entries"),
      learnings: d.learnings.slice().sort((a, b) => (a.date < b.date ? 1 : -1)).map((l) => {
        const title = l.title || (l.text.length > 40 ? l.text.slice(0, 40) + "…" : l.text);
        return {
          key: l.id, title, date: fmtFull(l.date), text: l.text, textSt: prose(15),
          open: () => setOpenLearningId(l.id),
          remove: () => { mut((x) => { x.learnings = x.learnings.filter((y) => y.id !== l.id); }); },
        };
      }),
      learningDetail: (() => {
        if (!openLearningId) return null;
        const l = d.learnings.filter((x) => x.id === openLearningId)[0];
        if (!l) return null;
        const title = l.title || (l.text.length > 40 ? l.text.slice(0, 40) + "…" : l.text);
        return {
          key: l.id, title, date: fmtFull(l.date), text: l.text, textSt: prose(15),
          back: () => setOpenLearningId(null),
          remove: () => { mut((x) => { x.learnings = x.learnings.filter((y) => y.id !== l.id); }); setOpenLearningId(null); },
          editing: editingLearningId === l.id,
          edit: () => setEditingLearningId(l.id),
          cancelEdit: () => setEditingLearningId(null),
          refTitle: ref("elTitle_" + l.id), refText: ref("elText_" + l.id),
          saveEdit: (e) => {
            e.preventDefault();
            const newTitle = (ref("elTitle_" + l.id).current.value || "").trim();
            const newText = (ref("elText_" + l.id).current.value || "").trim();
            if (!newTitle) { toast("Learnings", "Give it a short title."); return; }
            mut((x) => { const q = x.learnings.filter((y) => y.id === l.id)[0]; if (q) { q.title = newTitle; q.text = newText; } });
            setEditingLearningId(null);
            toast("Learnings", "Updated.");
          },
        };
      })(),
      learnEmpty: d.learnings.length ? "" : "Nothing recorded yet — write today’s learning on the left.",
      learnStreak: (() => {
        let n = 0;
        for (let i = 0; i < 400; i++) {
          const k = iso(addDays(now, -i));
          if (d.learnings.some((l) => l.date === k)) n++; else break;
        }
        return todayLearning ? "Today is recorded · " + n + (n === 1 ? " day" : " days") + " in a row." : "Today is still empty.";
      })(),
      addLearning: (e) => {
        e.preventDefault();
        const title = (ref("lTitle").current.value || "").trim();
        const v2 = (ref("lText").current.value || "").trim();
        if (!title) { toast("Learnings", "Give it a short title."); return; }
        mut((x) => { x.learnings = x.learnings.filter((l) => l.date !== tk); x.learnings.unshift({ id: "l" + Date.now(), date: tk, title, text: v2 }); });
        ref("lTitle").current.value = ""; ref("lText").current.value = "";
        toast("Learnings", "Saved for " + fmtShort(tk) + ".");
      },
      flash: (() => {
        const flashDecks = d.flashDecks || [];
        const flashCards = d.flashCards || [];
        const cardsOf = (id) => flashCards.filter((c) => c.deckId === id);
        const dueOf = (id) => cardsOf(id).filter((c) => c.due <= tk).length;

        if (flashStudy) {
          const s = flashStudy;
          if (s.phase === "summary") {
            return {
              view: "study",
              study: {
                summary: true, knownCount: s.known.length, unknownCount: s.unknown.length,
                reviewUnknown: s.unknown.length ? () => reviewGroup("unknown") : null,
                reviewKnown: s.known.length ? () => reviewGroup("known") : null,
                end: () => endStudy(),
              },
            };
          }
          const card = flashCards.filter((c) => c.id === s.queue[s.pos])[0];
          return {
            view: "study",
            study: !card ? null : {
              summary: false,
              phaseLabel: s.phase === "pass" ? "First pass" : s.phase === "review-unknown" ? "Reviewing the unknowns" : "Reviewing the knowns",
              pos: s.pos + 1, total: s.queue.length,
              front: card.front, back: card.back, flipped: s.flipped,
              flip: () => setFlashStudy((prev) => (prev ? Object.assign({}, prev, { flipped: true }) : prev)),
              again: () => answerCard(false),
              good: () => answerCard(true),
              end: () => endStudy(),
            },
          };
        }

        const openDeck = flashDeckId ? flashDecks.filter((x) => x.id === flashDeckId)[0] : null;
        if (openDeck) {
          const cards = cardsOf(openDeck.id);
          return {
            view: "deck",
            deck: {
              id: openDeck.id, name: openDeck.name, back: () => setFlashDeckId(null),
              total: cards.length, due: cards.filter((c) => c.due <= tk).length, mastered: cards.filter((c) => (c.box || 1) >= FLASH_BOX_MAX).length,
              cards: cards.map((c) => ({
                key: c.id, front: c.front, back: c.back,
                meta: "Box " + (c.box || 1) + "/" + FLASH_BOX_MAX + " · " + (c.due <= tk ? "due now" : "due " + fmtShort(c.due)),
                remove: () => { mut((x) => { x.flashCards = (x.flashCards || []).filter((y) => y.id !== c.id); }); },
              })),
              cardsEmpty: cards.length ? "" : "No cards yet — add the first one on the right.",
              addCard: (e) => {
                e.preventDefault();
                const front = (ref("fcFront").current.value || "").trim();
                const back = (ref("fcBack").current.value || "").trim();
                if (!front || !back) { toast("Flashcards", "A card needs both sides filled in."); return; }
                mut((x) => { x.flashCards = x.flashCards || []; x.flashCards.push({ id: "fc" + Date.now(), deckId: openDeck.id, front, back, box: 1, due: tk }); });
                ref("fcFront").current.value = ""; ref("fcBack").current.value = "";
                toast("Flashcards", "Card added.");
              },
              studyDue: () => startStudy(openDeck.id, true),
              studyAll: () => startStudy(openDeck.id, false),
            },
          };
        }

        if (flashLanguage) {
          const decksInLang = flashDecks.filter((dk) => (dk.language || "Other") === flashLanguage);
          return {
            view: "decks",
            language: flashLanguage,
            backToLanguages: () => setFlashLanguage(null),
            decks: decksInLang.map((dk) => ({
              key: dk.id, name: dk.name, language: dk.language || "Other", total: cardsOf(dk.id).length, due: dueOf(dk.id),
              open: () => setFlashDeckId(dk.id),
              studyDue: () => startStudy(dk.id, true),
              remove: () => {
                mut((x) => {
                  x.flashDecks = (x.flashDecks || []).filter((y) => y.id !== dk.id);
                  x.flashCards = (x.flashCards || []).filter((c) => c.deckId !== dk.id);
                });
                toast("Flashcards", "“" + dk.name + "” deck deleted.");
              },
              editing: editingDeckId === dk.id,
              edit: () => setEditingDeckId(dk.id),
              cancelEdit: () => setEditingDeckId(null),
              refName: ref("edk_name_" + dk.id), refLanguage: ref("edk_lang_" + dk.id),
              saveEdit: (e) => {
                e.preventDefault();
                const newName = (ref("edk_name_" + dk.id).current.value || "").trim();
                const newLanguage = (ref("edk_lang_" + dk.id).current.value || "").trim();
                if (!newName || !newLanguage) { toast("Flashcards", "Give the deck both a name and a language."); return; }
                mut((x) => { const q = (x.flashDecks || []).filter((y) => y.id === dk.id)[0]; if (q) { q.name = newName; q.language = newLanguage; } });
                setEditingDeckId(null);
                if (newLanguage !== flashLanguage) setFlashLanguage(newLanguage);
                toast("Flashcards", "Deck updated.");
              },
            })),
            decksEmpty: decksInLang.length ? "" : "No deck yet in " + flashLanguage + " — add one on the right.",
            addDeck: (e) => {
              e.preventDefault();
              const name = (ref("fdName").current.value || "").trim();
              if (!name) return;
              mut((x) => { x.flashDecks = x.flashDecks || []; x.flashDecks.push({ id: "fd" + Date.now(), name, language: flashLanguage }); });
              ref("fdName").current.value = "";
              toast("Flashcards", "“" + name + "” deck created.");
            },
          };
        }

        const langMap = {};
        flashDecks.forEach((dk) => {
          const lang = dk.language || "Other";
          langMap[lang] = langMap[lang] || { total: 0, due: 0 };
          langMap[lang].total += cardsOf(dk.id).length;
          langMap[lang].due += dueOf(dk.id);
        });
        return {
          view: "languages",
          languages: Object.keys(langMap).sort().map((lang) => ({
            key: lang, language: lang, total: langMap[lang].total, due: langMap[lang].due,
            open: () => setFlashLanguage(lang),
          })),
          languagesEmpty: Object.keys(langMap).length ? "" : "No deck yet — create one on the right to start learning a language.",
          addDeck: (e) => {
            e.preventDefault();
            const lang = (ref("fdLang").current.value || "").trim();
            const name = (ref("fdName").current.value || "").trim();
            if (!lang || !name) { toast("Flashcards", "Give the language and the deck a name."); return; }
            mut((x) => { x.flashDecks = x.flashDecks || []; x.flashDecks.push({ id: "fd" + Date.now(), name, language: lang }); });
            ref("fdLang").current.value = ""; ref("fdName").current.value = "";
            setFlashLanguage(lang);
            toast("Flashcards", "“" + lang + "” started with “" + name + "”.");
          },
        };
      })(),
    };

    // ---- SETTINGS ----
    v.settings = {
      weekPlan: [1, 2, 3, 4, 5, 6, 0].map((dow) => {
        const cur = (d.weekPlan && d.weekPlan[dow]) || DEFAULT_PLAN[dow];
        return {
          key: dow, label: DOW[dow], typeLabel: TYPES[cur],
          st: tag(cur === "rest" ? "var(--hint)" : cur === "gym" ? "var(--red)" : "var(--green)"),
          cycle: () => cycleWeekPlanDay(dow),
        };
      }),
    };

    return v;
  }

  // Manual backup: a plain JSON download/restore of the whole document.
  // Independent of localStorage and the cloud store — the safety net when
  // neither is guaranteed (e.g. a fresh, unclaimed host with a new origin
  // on every deploy has no way to carry localStorage over on its own).
  //
  // A page framed in the claude.ai viewer can't trigger a browser download
  // directly (the sandbox drops it silently) — that view has to hand the
  // file to the viewer through the `downloads` capability instead. Anywhere
  // else (this dev server, Netlify, any plain static host) there's no
  // window.claude at all, so the ordinary <a download> trick is what runs.
  async function exportData() {
    const payload = JSON.stringify(dataRef.current, null, 2);
    const filename = "life-os-backup-" + iso(new Date()) + ".json";
    const c = typeof window !== "undefined" ? window.claude : undefined;
    if (c && typeof c.use === "function") {
      const downloads = await c.use("downloads").catch(() => null);
      if (downloads) {
        try {
          await downloads.save({ filename, data: payload });
          toast("Backup", "Saved — keep this file somewhere safe.");
        } catch (e) {
          if (!e || e.code !== "declined") toast("Backup", "Couldn’t save the backup here.");
        }
        return;
      }
    }
    try {
      const blob = new Blob([payload], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      toast("Backup", "Downloaded — keep this file somewhere safe.");
    } catch {
      toast("Backup", "Couldn’t start the download here.");
    }
  }

  function importData(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      let parsed;
      try { parsed = JSON.parse(String(reader.result)); } catch { parsed = null; }
      if (!parsed || parsed.version !== 4) { toast("Backup", "That file doesn’t look like a Life OS backup."); return; }
      dataRef.current = parsed;
      setData(parsed);
      persist(parsed);
      if (dbDocRef.current) dbDocRef.current.set(parsed).catch(() => {});
      toast("Backup", "Restored from backup.");
    };
    reader.onerror = () => toast("Backup", "Couldn’t read that file.");
    reader.readAsText(file);
  }

  return {
    vals, ref, syncMode, exportData, importData, themePref, setThemePref,
    resetDemo: () => {
      const s = buildSeed(HYDRATION_TARGET_L);
      dataRef.current = s;
      setData(s);
      persist(s);
      if (dbDocRef.current) dbDocRef.current.set(s).catch(() => {});
      toast("Reset", "Demo data reloaded.");
    },
  };
}

function strikeStyle(done, size) {
  return { display: "block", font: "700 " + (size || 15) + "px/1.35 'Plus Jakarta Sans',system-ui,sans-serif", textDecoration: done ? "line-through" : "none", color: done ? "var(--faint)" : "var(--text)" };
}
