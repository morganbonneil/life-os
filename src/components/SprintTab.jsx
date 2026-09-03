export default function SprintTab({ sprint, getRef }) {
  return (
    <div>
      <h1 className="page-title">Sprint &amp; Recovery</h1>

      <div className="subtabs">
        {sprint.subs.map((s) => (
          <button key={s.key} onClick={s.pick} style={s.st}>{s.label}</button>
        ))}
      </div>

      {sprint.isTimes && (
        <div className="grid">
          <section>
            <div className="section-title green">Bests by distance</div>
            {sprint.byDist.map((e) => (
              <div key={e.dist} style={{ padding: "16px 0", borderBottom: "1px solid var(--line2)" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ font: "800 22px/1 'Plus Jakarta Sans',system-ui,sans-serif", minWidth: 64 }}>{e.dist}</span>
                  <span style={{ font: "800 30px/1 'Plus Jakarta Sans',system-ui,sans-serif", letterSpacing: "-.01em" }}>{e.rec}</span>
                  <span style={{ font: "700 12.5px/1.3 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--hint)", marginLeft: "auto", textAlign: "right" }}>
                    PB on {e.recDate}<br />Latest: {e.last} · {e.count}
                  </span>
                </div>
                {e.targets.map((g, gi) => (
                  <div key={gi} style={{ marginTop: 11, paddingLeft: 11, borderLeft: "1px solid var(--red-tint-line)" }}>
                    <div style={{ font: "700 14px/1.35 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--red-dark)" }}>Target {g.t} — {g.dueTxt}</div>
                    <div style={{ font: "700 12.5px/1.5 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--hint)", marginTop: 3 }}>{g.pace}</div>
                  </div>
                ))}
                <div style={{ marginTop: 12 }}>
                  {e.rows.map((r) => (
                    <div key={r.key} style={{ display: "flex", gap: 12, alignItems: "baseline", padding: "6px 0" }}>
                      <span style={{ font: "700 12.5px/1 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--hint)", minWidth: 78 }}>{r.date}</span>
                      <span style={{ font: "800 15px/1 'Plus Jakarta Sans',system-ui,sans-serif" }}>{r.t}</span>
                      <span style={r.kindSt}>{r.kind}</span>
                      <span style={{ font: "700 12px/1 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--faint)" }}>{r.flag}</span>
                      <button onClick={r.remove} title="Delete this time" className="btn-x" style={{ marginLeft: "auto" }}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="rows-empty">{sprint.emptyTimes}</div>
          </section>

          <section>
            <div className="section-title red">Add a time</div>
            <form onSubmit={sprint.addTime}>
              <div className="field-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(104px,1fr))" }}>
                <div><label className="field-label">Distance</label><input ref={getRef("timeDist")} placeholder="40m · 400m · 150m" className="ln" /></div>
                <div><label className="field-label">Time (s)</label><input ref={getRef("timeVal")} placeholder="11.28" className="ln" /></div>
                <div><label className="field-label">Date</label><input ref={getRef("timeDate")} type="date" className="ln" /></div>
              </div>
              <div style={{ marginTop: 16 }}>
                <div className="field-label" style={{ marginBottom: 8 }}>Context</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {sprint.kinds.map((k) => (
                    <button key={k.label} type="button" onClick={k.pick} style={k.st}>{k.label}</button>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn btn-green" style={{ marginTop: 16 }}>Save time</button>
            </form>
            <div className="hint" style={{ marginTop: 12 }}>Any distance, typed by hand: 40 m, 150 m, 400 m… “40” is enough, the unit is added.</div>

            <div style={{ marginTop: 28 }}>
              <div className="section-title-row">
                <span className="section-title green" style={{ border: 0, padding: 0 }}>Progression</span>
                <span style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {sprint.chartTabs.map((c) => (
                    <button key={c.label} onClick={c.pick} style={c.st}>{c.label}</button>
                  ))}
                </span>
              </div>
              <svg viewBox="0 0 320 132" preserveAspectRatio="none" style={{ width: "100%", height: 160, marginTop: 14, display: "block", overflow: "visible" }}>
                <line x1="0" y1="121" x2="320" y2="121" stroke="var(--line)" strokeWidth="1" />
                {sprint.objLines.map((o, i) => (
                  <line key={i} x1="0" y1={o.y} x2="320" y2={o.y} stroke="var(--red)" strokeWidth="1" strokeDasharray="4 4" />
                ))}
                <polyline points={sprint.points} fill="none" stroke="var(--green)" strokeWidth="2" />
                {sprint.dots.map((d, i) => (
                  <circle key={i} cx={d.x} cy={d.y} r="3.5" fill="var(--bg)" stroke="var(--green)" strokeWidth="2" />
                ))}
              </svg>
              <div style={{ display: "flex", justifyContent: "space-between", font: "700 11.5px/1 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--faint)", marginTop: 6, gap: 8 }}>
                <span>{sprint.chartFrom}</span><span style={{ color: "var(--red-dark)" }}>{sprint.chartObjTxt}</span><span>{sprint.chartTo}</span>
              </div>
              <div style={{ font: "700 13px/1.5 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--muted)", marginTop: 10 }}>{sprint.chartSummary}</div>
            </div>
          </section>
        </div>
      )}

      {sprint.isGoalsTab && (
        <div className="grid">
          <section>
            <div className="section-title green">Time targets</div>
            {sprint.targets.map((g) => (
              <div key={g.key} style={{ padding: "15px 0", borderBottom: "1px solid var(--line2)" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ font: "800 20px/1 'Plus Jakarta Sans',system-ui,sans-serif", minWidth: 58 }}>{g.dist}</span>
                  <span style={{ font: "800 26px/1 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--red-dark)" }}>{g.t}</span>
                  <span style={{ font: "700 12.5px/1.3 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--hint)", marginLeft: "auto", textAlign: "right" }}>{g.dueTxt}</span>
                  <button onClick={g.remove} title="Delete" className="btn-x">✕</button>
                </div>
                <div style={{ font: "700 13.5px/1.5 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--muted)", marginTop: 8 }}>{g.status}</div>
                <div style={{ height: 3, background: "var(--line2)", marginTop: 9 }}><div style={g.bar} /></div>
                <div style={{ font: "700 12.5px/1.5 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--faint)", marginTop: 7 }}>{g.pace}</div>
              </div>
            ))}
            <div className="rows-empty">{sprint.emptyTargets}</div>
          </section>

          <section>
            <div className="section-title red">New target</div>
            <form onSubmit={sprint.addTarget}>
              <div className="field-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(104px,1fr))" }}>
                <div><label className="field-label">Distance</label><input ref={getRef("tgDist")} placeholder="400m" className="ln" /></div>
                <div><label className="field-label">Target time (s)</label><input ref={getRef("tgTime")} placeholder="49.50" className="ln" /></div>
                <div><label className="field-label">Deadline</label><input ref={getRef("tgDue")} type="date" className="ln" /></div>
              </div>
              <div className="field">
                <label>Name (optional)</label>
                <input ref={getRef("tgLabel")} placeholder="July championships" />
              </div>
              <button type="submit" className="btn btn-green" style={{ marginTop: 16 }}>Add target</button>
            </form>
          </section>
        </div>
      )}

      {sprint.isRecov && (
        <div className="grid grid-wide">
          <section>
            <div className="section-title-row">
              <span className="section-title green" style={{ border: 0, padding: 0 }}>Today’s check-in</span>
              <span style={{ font: "700 12px/1 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--hint)" }}>{sprint.recovDate}</span>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 14 }}>
              {sprint.dayTypes.map((o) => (
                <button key={o.label} onClick={o.pick} style={o.st}>{o.label}</button>
              ))}
            </div>
            {sprint.recov.map((r) => (
              <div key={r.key} style={{ padding: "14px 0", borderBottom: "1px solid var(--line2)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                  <span style={{ font: "700 14.5px/1.3 'Plus Jakarta Sans',system-ui,sans-serif" }}>{r.label}</span>
                  <span style={{ font: "700 12.5px/1 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--hint)", whiteSpace: "nowrap" }}>{r.valTxt}</span>
                </div>
                <div style={{ font: "700 11.5px/1.4 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--faint)", marginTop: 3 }}>{r.hint}</div>
                <div style={{ display: "flex", gap: 4, marginTop: 9, flexWrap: "wrap" }}>
                  {r.steps.map((s, si) => (
                    <button key={si} onClick={s.pick} style={s.st}>{s.n}</button>
                  ))}
                </div>
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
              <span style={{ font: "800 40px/1 'Plus Jakarta Sans',system-ui,sans-serif" }}>{sprint.recovScore}</span>
              <span style={{ font: "700 14px/1.4 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--muted)" }}>/ 10 — {sprint.recovVerdict}</span>
            </div>
            <div style={{ font: "700 13px/1.5 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--muted)", marginTop: 6 }}>{sprint.recovAdvice}</div>
            <form className="inline-form" onSubmit={sprint.saveNote}>
              <input ref={getRef("recNote")} placeholder="Note for the day (optional)…" />
              <button type="submit" className="btn btn-small">Save</button>
              <button type="button" onClick={sprint.shareCheckin} className="btn btn-green-outline btn-small">Share to my phone</button>
            </form>
          </section>

          <section>
            <div className="section-title red">Last thirty days</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 96, marginTop: 16 }}>
              {sprint.spark.map((s, i) => (
                <div key={i} title={s.title} style={s.st} />
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", font: "700 11.5px/1 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--faint)", marginTop: 7, gap: 8 }}>
              <span>{sprint.sparkFrom}</span><span>{sprint.sparkAvg}</span><span>today</span>
            </div>
          </section>
        </div>
      )}

      {sprint.isLog && (
        <div>
          <div className="section-title green">Check-in history · {sprint.logCount}</div>
          {sprint.log.map((l) => (
            <div key={l.key} style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "14px 0", borderBottom: "1px solid var(--line2)", flexWrap: "wrap" }}>
              <span style={{ font: "700 12.5px/1.3 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--hint)", minWidth: 104 }}>{l.date}<br /><span style={{ color: "var(--faint)" }}>{l.type}</span></span>
              <span style={{ font: "800 24px/1 'Plus Jakarta Sans',system-ui,sans-serif", minWidth: 64 }}>{l.score}</span>
              <span style={{ flex: 1, minWidth: 200 }}>
                <span style={{ display: "block", font: "700 13px/1.5 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--muted)" }}>{l.detail}</span>
                <span style={{ display: "block", font: "700 12.5px/1.5 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--faint)", marginTop: 3 }}>{l.note}</span>
              </span>
              <button onClick={l.remove} title="Delete" className="btn-x">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
