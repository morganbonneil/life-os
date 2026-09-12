import { useRef } from "react";

const THEME_OPTIONS = [
  ["system", "System"],
  ["light", "Light"],
  ["dark", "Dark"],
];

export default function SettingsTab({
  themePref, setThemePref, exportData, importData, resetDemo, syncMode,
  push, settings,
}) {
  const fileInput = useRef(null);

  return (
    <div>
      <h1 className="page-title">Settings</h1>

      <div className="grid grid-wide">
        <section>
          <div className="section-title green">Appearance</div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 16 }}>
            {THEME_OPTIONS.map(([v, label]) => (
              <button
                key={v}
                onClick={() => setThemePref(v)}
                className={themePref === v ? "btn btn-dark btn-small" : "btn btn-small"}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="hint">“System” follows your phone or browser’s own light/dark setting.</div>
        </section>

        <section>
          <div className="section-title red">Weekly training schedule</div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 16 }}>
            {settings?.weekPlan?.map((d) => (
              <button key={d.key} onClick={d.cycle} style={d.st}>{d.label} · {d.typeLabel}</button>
            ))}
          </div>
          <div className="hint">The default for each weekday — tap one to cycle Track → Gym → Rest. This decides which meals show up on Nutrition, unless a specific date is overridden there.</div>
        </section>

        <section>
          <div className="section-title red">Notifications</div>
          {push?.supported === false && (
            <div className="hint" style={{ marginTop: 16 }}>This browser doesn’t support push notifications.</div>
          )}
          {push?.supported !== false && (
            <>
              <div style={{ font: "600 13.5px/1.55 -apple-system,BlinkMacSystemFont,'SF Pro Text',system-ui,sans-serif", color: "var(--muted)", marginTop: 16 }}>
                {push?.status === "subscribed"
                  ? "On — hydration reminders and the Sunday form summary can reach this device even when Life OS is closed."
                  : "Off — reminders only show while the app is open. Turn this on to get them as real phone notifications."}
              </div>
              {push?.status !== "subscribed" ? (
                <button onClick={push?.enable} disabled={push?.status === "pending"} className="btn btn-green" style={{ marginTop: 14 }}>
                  {push?.status === "pending" ? "Enabling…" : "Enable phone notifications"}
                </button>
              ) : (
                <button onClick={push?.disable} className="btn btn-small" style={{ marginTop: 14 }}>Turn off</button>
              )}
              {push?.status === "error" && (
                <div className="hint" style={{ color: "var(--red-dark)" }}>{push?.error || "Something went wrong enabling notifications."}</div>
              )}
              {push?.needsHomeScreen && (
                <div className="hint">On iPhone, add Life OS to your Home Screen first (Share → Add to Home Screen) — Safari only allows push notifications for installed apps.</div>
              )}
            </>
          )}
        </section>

        <section>
          <div className="section-title green">Data &amp; backup</div>
          <div style={{ font: "600 13.5px/1.55 -apple-system,BlinkMacSystemFont,'SF Pro Text',system-ui,sans-serif", color: "var(--muted)", marginTop: 16 }}>
            {syncMode === "cloud" && "Cloud sync is on — saved to your account, kept across devices."}
            {syncMode === "local" && "Saved on this device only — cloud sync isn’t available here."}
            {syncMode === "checking" && "Checking sync status…"}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
            <button onClick={exportData} className="btn btn-small">Export data</button>
            <button onClick={() => fileInput.current?.click()} className="btn btn-small">Import data</button>
            <input
              ref={fileInput}
              type="file"
              accept="application/json"
              style={{ display: "none" }}
              onChange={(e) => { const f = e.target.files && e.target.files[0]; importData(f); e.target.value = ""; }}
            />
          </div>
          <div className="hint">A JSON file with everything in the app — meals, times, goals, check-ins. Keep a copy somewhere safe now and then.</div>
        </section>

        <section>
          <div className="section-title red">Reset</div>
          <div className="hint" style={{ marginTop: 16 }}>Replaces everything with the original demo data. There’s no undo — export a backup first if you want to keep what’s here.</div>
          <button
            onClick={() => { if (window.confirm("Reset to demo data? This replaces everything currently in the app.")) resetDemo(); }}
            className="btn btn-small"
            style={{ marginTop: 10 }}
          >
            Reset to demo data
          </button>
        </section>
      </div>
    </div>
  );
}
