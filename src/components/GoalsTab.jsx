function streakColor(pct) {
  if (pct <= 0) return "transparent";
  if (pct < 0.34) return "var(--green-tint-line)";
  if (pct < 0.67) return "var(--streak-mid1)";
  if (pct < 1) return "var(--streak-mid2)";
  return "var(--green)";
}

function StreakGrid({ grid, className }) {
  return (
    <div className="streak-wrap">
      <div className="streak-scroll">
        <div className={className}>
          {grid.cells.map((c) => (
            <div
              key={c.key}
              title={c.title}
              className={"streak-cell" + (c.future ? " future" : "")}
              style={c.future ? undefined : { background: streakColor(c.pct) }}
            />
          ))}
        </div>
      </div>
      <div className="streak-legend">
        <span>{grid.from}</span>
        {[0, 0.2, 0.5, 0.8, 1].map((p) => (
          <div key={p} className="streak-cell" style={{ background: streakColor(p), border: p === 0 ? "1px solid var(--line2)" : "none" }} />
        ))}
        <span>{grid.to}</span>
      </div>
    </div>
  );
}

// One 365-day grid per daily task: filled = done, light tint = missed (past
// and still open), dashed outline = not reached yet.
function DailyTaskGrid({ grid }) {
  return (
    <div className="streak-wrap">
      {grid.title && <div style={{ font: "700 12.5px/1.4 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--muted)", marginBottom: 6 }}>{grid.title}</div>}
      <div className="streak-scroll">
        <div className="streak-grid-daily">
          {grid.cells.map((c) => (
            <div
              key={c.key}
              title={c.title}
              className={"streak-cell" + (c.future ? " future" : c.done ? "" : " missed")}
              style={c.future ? undefined : { background: c.done ? "var(--green)" : undefined }}
            />
          ))}
        </div>
      </div>
      <div className="streak-legend">
        <span>{grid.from}</span>
        <div className="streak-cell" style={{ background: "var(--green)" }} /><span>done</span>
        <div className="streak-cell missed" /><span>missed</span>
        <span>{grid.to}</span>
      </div>
    </div>
  );
}

export default function GoalsTab({ goals, getRef }) {
  return (
    <div>
      <h1 className="page-title">Goals</h1>

      <div className="subtabs">
        {goals.subs.map((s) => (
          <button key={s.key} onClick={s.pick} style={s.st}>{s.label}</button>
        ))}
      </div>

      {goals.isHorizons && (
        <div className="grid grid-wider">
          {goals.domains.map((dm) => (
            <section key={dm.key}>
              <div className="section-title-row">
                <span style={dm.head}>{dm.name}</span>
                <span className="count">{dm.count}</span>
              </div>
              {dm.goals.map((g) => (
                <div key={g.key} style={{ padding: "12px 0", borderBottom: "1px solid var(--line2)" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span onClick={g.toggle} style={g.box}>{g.mark}</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={g.name}>{g.title}</span>
                      <span style={{ display: "block", font: "700 11.5px/1.35 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--faint)", marginTop: 4 }}>{g.meta}</span>
                    </span>
                    <span style={{ font: "800 12.5px/1 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--muted)", whiteSpace: "nowrap", marginTop: 2 }}>{g.prog}%</span>
                    <button onClick={g.remove} title="Delete" className="btn-x">✕</button>
                  </div>
                  <div style={{ height: 3, background: "var(--line2)", marginTop: 8 }}><div style={g.bar} /></div>
                </div>
              ))}
              <form className="inline-form" onSubmit={dm.add}>
                <input ref={dm.refTitle} placeholder="New goal…" />
                <input ref={dm.refDue} type="date" style={{ border: 0, borderBottom: "1px solid var(--input-line)", background: "transparent", padding: "7px 2px", font: "700 13px/1.2 'Plus Jakarta Sans',system-ui,sans-serif" }} />
                <button type="submit" className="btn btn-small">Add</button>
              </form>
            </section>
          ))}
        </div>
      )}

      {goals.isTodo && goals.gridView && (
        <div className="grid grid-wide">
          <section style={{ gridColumn: "1 / -1" }}>
            <div className="section-title-row">
              <button onClick={goals.gridView.back} className="link-btn" style={{ textDecoration: "none" }}>← Back to to-do</button>
              <span className="count">{goals.gridView.title}</span>
            </div>
            {goals.gridView.kind === "daily"
              ? <DailyTaskGrid grid={goals.gridView.grid} />
              : <StreakGrid grid={goals.gridView.grid} className="streak-grid-weekly" />}
          </section>
        </div>
      )}

      {goals.isTodo && !goals.gridView && (
        <div className="grid grid-wide">
          <section>
            <div className="section-title-row">
              <span className="section-title green" style={{ border: 0, padding: 0 }}>To-do</span>
              <span style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {goals.scopeTabs.map((s) => (
                  <button key={s.key} onClick={s.pick} style={s.st}>{s.label}</button>
                ))}
              </span>
            </div>

            {goals.showDailyGrid && goals.dailySummaries.map((s) => (
              <div key={s.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--line2)" }}>
                <span style={{ font: "700 14px/1.35 'Plus Jakarta Sans',system-ui,sans-serif" }}>{s.title}</span>
                <button onClick={s.view} className="link-btn" style={{ textDecoration: "none", whiteSpace: "nowrap" }}>{s.streakTxt} · Calendar →</button>
              </div>
            ))}
            {goals.showDailyGrid && !goals.dailySummaries.length && <div className="rows-empty">No daily task yet — add one on the right to start a streak.</div>}

            {goals.showWeeklyGrid && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--line2)" }}>
                <span style={{ font: "700 14px/1.35 'Plus Jakarta Sans',system-ui,sans-serif" }}>Weekly tasks calendar</span>
                <button onClick={goals.viewWeeklyGrid} className="link-btn" style={{ textDecoration: "none" }}>Calendar →</button>
              </div>
            )}

            {goals.tasks.map((t) => (
              <div key={t.key} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid var(--line2)" }}>
                <span onClick={t.toggle} style={t.box}>{t.mark}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={t.name}>{t.title}</span>
                  <span style={{ display: "block", font: "700 11.5px/1.35 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--faint)", marginTop: 3 }}>{t.link}</span>
                </span>
                <button onClick={t.remove} title="Delete" className="btn-x">✕</button>
              </div>
            ))}
            <div className="rows-empty">{goals.tasksEmpty}</div>
          </section>

          <section>
            <div className="section-title red">New task</div>
            <form onSubmit={goals.addTask}>
              <div className="field">
                <label>What needs doing</label>
                <input ref={getRef("gTask")} placeholder="30 min of Spanish" />
              </div>
              <div className="field-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))" }}>
                <div>
                  <label className="field-label">Repeat</label>
                  <select ref={getRef("gRepeat")} className="ln" defaultValue="daily">
                    <option value="daily">Every day</option><option value="weekly">Every week</option><option value="monthly">Every month</option><option value="once">One-off</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">Linked goal</label>
                  <select ref={getRef("gGoal")} className="ln" style={{ fontSize: 13.5 }} defaultValue="">
                    {goals.linkOpts.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="field-label">Date (one-off)</label>
                  <input ref={getRef("gDate")} type="date" className="ln" />
                </div>
              </div>
              <button type="submit" className="btn btn-green" style={{ marginTop: 16 }}>Add task</button>
            </form>
          </section>
        </div>
      )}

      {goals.isIdeas && (
        <div className="grid grid-wide">
          <section>
            <div className="section-title red">Capture</div>
            <form onSubmit={goals.addIdea}>
              <textarea ref={getRef("idea")} rows={7} placeholder="Anything at all — a quote, a thought, an object you saw, an opinion on someone, a note on how you reacted…" style={{ width: "100%", marginTop: 14, border: "1px solid var(--line)", background: "var(--bg)", borderRadius: 14, padding: 12, font: "700 15px/1.6 'Plus Jakarta Sans',system-ui,sans-serif", resize: "vertical" }} />
              <button type="submit" className="btn btn-green-outline" style={{ marginTop: 10 }}>Keep it</button>
            </form>
          </section>

          <section>
            <div className="section-title-row">
              <span className="section-title green" style={{ border: 0, padding: 0 }}>Idea box</span>
              <span className="count">{goals.ideaCount}</span>
            </div>
            {goals.ideas.map((i) => (
              <div key={i.key} style={{ padding: "14px 0", borderBottom: "1px solid var(--line2)" }}>
                <div style={i.textSt}>{i.text}</div>
                <div style={{ display: "flex", gap: 14, marginTop: 8, alignItems: "baseline" }}>
                  <span style={{ font: "700 11.5px/1 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--faint)" }}>{i.date}</span>
                  <button onClick={i.remove} className="link-btn" style={{ marginLeft: "auto", textDecoration: "none" }}>Discard</button>
                </div>
              </div>
            ))}
          </section>
        </div>
      )}
    </div>
  );
}
