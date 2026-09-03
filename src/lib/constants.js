export const STORAGE_KEY = "oslife.v4";

export const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const TYPES = { track: "Track", gym: "Gym", rest: "Rest" };

export const FOCUS = {
  track: "Starts + 3×60 m flying",
  gym: "Max strength, lower body",
  rest: "Mobility + 30 min walk",
};

export const DEFAULT_PLAN = { 1: "gym", 2: "track", 3: "rest", 4: "gym", 5: "track", 6: "track", 0: "rest" };

// Every meal is tagged "training" or "rest" — never "any" — and each day type
// has its own fixed set of four slots, matching the phase-1 meal plan exactly.
export const SLOTS = ["Pre-training", "Post-training", "Breakfast", "Lunch", "Snack", "Dinner"];
export const SLOTS_BY_DAY = {
  training: [["Pre-training", "08:00"], ["Post-training", "10:45"], ["Lunch", "13:30"], ["Dinner", "20:00"]],
  rest: [["Breakfast", "09:00"], ["Lunch", "13:30"], ["Snack", "17:00"], ["Dinner", "20:00"]],
};

export const CATS = ["Produce", "Butcher", "Chilled", "Pantry", "Other"];

export const CAT_HINTS = [
  [
    ["banana", "fruit", "courgette", "pepper", "potato", "apple", "broccoli", "bean", "spinach", "carrot", "avocado", "salad", "tomato", "onion", "lemon", "berries",
      "banane", "pomme", "orange", "mangue", "avocat", "patate douce", "pommes de terre", "légumes", "raisins secs", "dattes"],
    "Produce",
  ],
  [
    ["chicken", "beef", "turkey", "salmon", "cod", "tuna", "steak", "ham", "prawn", "fish", "mince",
      "poulet", "bœuf haché", "boeuf haché", "dinde", "escalope", "saumon", "cabillaud", "maquereau", "sardine", "jambon", "thon", "steak", "crevette"],
    "Butcher",
  ],
  [
    ["milk", "skyr", "cheese", "yoghurt", "yogurt", "egg", "butter", "feta", "cheddar", "parmesan", "cream", "quark",
      "lait", "yaourt", "fromage", "œufs", "oeufs", "parmesan", "feta", "skyr"],
    "Chilled",
  ],
];

export const UNIT_STEP = { g: 50, ml: 50, cl: 10, kg: 0.5, l: 0.5, pc: 1, "": 1 };

export const RECOV = [
  { k: "fatigue", label: "Muscular & nervous fatigue", short: "Fatigue", hint: "0 = wrecked · 10 = completely fresh", opt: false },
  { k: "sleep", label: "Sleep", short: "Sleep", hint: "How the night actually felt", opt: false },
  { k: "technique", label: "Technical quality", short: "Technique", hint: "Cleanliness of foot strike and posture — “—” on a rest day", opt: true },
  { k: "speed", label: "Speed feel", short: "Speed", hint: "Sensation of velocity — “—” on a rest day", opt: true },
  { k: "pain", label: "Pain", short: "Pain", hint: "0 = very painful · 10 = no pain at all", opt: false },
  { k: "motivation", label: "Session motivation", short: "Motiv.", hint: "Appetite for the session ahead", opt: false },
];

export const RECOV_DEFAULT = { fatigue: null, sleep: null, technique: null, speed: null, pain: null, motivation: null, note: "", type: null };

export const DOMAINS = [
  { id: "pro", name: "Professional / Business" },
  { id: "sport", name: "Sport & physical performance" },
  { id: "money", name: "Finances / money" },
  { id: "social", name: "Relationships & social life" },
  { id: "growth", name: "Personal development" },
  { id: "health", name: "Health & daily energy" },
  { id: "create", name: "Creativity / expression" },
  { id: "freedom", name: "Freedom / travel" },
];

export const REPEATS = { daily: "Every day", weekly: "Every week", monthly: "Every month", once: "One-off" };
