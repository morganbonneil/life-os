export default function TodayTab({ today, getRef }) {
  return (
    <div>
      <h1 className="page-title">Today</h1>

      <button onClick={today.goCheckin} className="btn btn-dark" style={{ display: "block", width: "100%", padding: "18px", font: "800 17px/1 'Plus Jakarta Sans',system-ui,sans-serif", marginBottom: 22 }}>
        Check-in
      </button>

      <div className="grid">
        <section>
          <div className="section-title green">Today’s to-do</div>
          {today.tasks.map((t) => (
            <div key={t.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "9px 0", borderBottom: "1px solid var(--line2)" }}>
              {!t.isTimed && <span onClick={t.toggle} style={{ ...t.box, cursor: "pointer" }}>{t.mark}</span>}
              <span style={{ flex: 1, minWidth: 0 }}>
                <span
                  onClick={t.openGrid || t.toggle}
                  style={t.openGrid ? { ...t.name, cursor: "pointer", textDecoration: "underline" } : { ...t.name, cursor: "pointer" }}
                >
                  {t.title}
                </span>
                <span style={{ display: "block", font: "700 11.5px/1.3 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--faint)", marginTop: 3 }}>{t.link}</span>
                {t.isTimed && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                    <input
                      type="number" min="0" defaultValue={t.minutesToday || ""} placeholder="0"
                      onBlur={(e) => t.logMinutes(Math.max(0, Math.round(+e.target.value || 0)))}
                      style={{ width: 64, border: "1px solid var(--input-line)", borderRadius: 8, padding: "6px 8px", font: "700 14px/1 'Plus Jakarta Sans',system-ui,sans-serif", background: "var(--bg)", color: "var(--text)" }}
                    />
                    <span style={{ font: "700 12px/1.3 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--faint)" }}>min today · target {t.timeTarget} min</span>
                  </div>
                )}
              </span>
            </div>
          ))}
          <form className="inline-form" onSubmit={today.addTask}>
            <input ref={getRef("todayTask")} placeholder="Add a task for today…" />
            <button type="submit" className="btn btn-small">Add</button>
          </form>

          {today.yesterday.tasks.length > 0 && (
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--line2)" }}>
              <div style={{ font: "700 11.5px/1 'Plus Jakarta Sans',system-ui,sans-serif", letterSpacing: ".18em", textTransform: "uppercase", color: "var(--hint)" }}>Didn’t get to it? · {today.yesterday.date}</div>
              {today.yesterday.tasks.map((t) => (
                <div key={t.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "9px 0", cursor: "pointer" }} onClick={t.toggle}>
                  <span style={t.box} />
                  <span style={{ flex: 1, minWidth: 0, font: "700 14px/1.35 'Plus Jakarta Sans',system-ui,sans-serif" }}>{t.title}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="section-title red">My form today</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
            <span style={{ font: "800 44px/1 'Plus Jakarta Sans',system-ui,sans-serif" }}>{today.scoreTxt}</span>
            <span style={{ font: "700 15px/1.4 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--muted)" }}>/ 10 — {today.recovLabel}</span>
          </div>
          <div style={{ font: "700 13.5px/1.55 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--muted)", marginTop: 8 }}>{today.formAdvice}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 16 }}>
            {today.formItems.map((i) => (
              <div key={i.label}>
                <div style={{ font: "700 11.5px/1 'Plus Jakarta Sans',system-ui,sans-serif", letterSpacing: ".18em", textTransform: "uppercase", color: "var(--hint)" }}>{i.label}</div>
                <div style={{ font: "800 17px/1.2 'Plus Jakarta Sans',system-ui,sans-serif", marginTop: 5 }}>{i.val}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 18, flexWrap: "wrap" }}>
            <button onClick={today.goCheckin} className="btn btn-dark">{today.checkinLabel}</button>
            <button onClick={today.share} className="btn btn-green-outline">Share check-in</button>
          </div>
        </section>

        <section>
          <div className="section-title green">Currently reading</div>
          <div onClick={today.goReading} style={{ cursor: "pointer", padding: "16px 0 0" }}>
            <div style={{ font: "800 24px/1.2 'Plus Jakarta Sans',system-ui,sans-serif" }}>{today.bookTitle}</div>
            <div style={{ font: "700 13.5px/1.4 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--muted)", marginTop: 5 }}>{today.bookAuthor}</div>
            <div style={{ display: "flex", gap: 2, alignItems: "center", marginTop: 11, flexWrap: "wrap" }}>
              {today.bookStars.map((s, i) => (
                <span key={i} style={s.st}>★</span>
              ))}
              {today.bookStars.length > 0 && (
                <span style={{ font: "700 13px/1 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--muted)", marginLeft: 8, whiteSpace: "nowrap" }}>{today.bookRating}</span>
              )}
            </div>
            <div style={{ font: "700 13.5px/1.6 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--muted)", marginTop: 11 }}>{today.bookNote}</div>
            <div style={{ font: "700 12.5px/1 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--green-mid)", textDecoration: "underline", marginTop: 14 }}>Open in Reading →</div>
          </div>
        </section>

        <section>
          <div className="section-title green">Quick notes</div>
          <form className="inline-form" onSubmit={today.notes.add}>
            <input ref={getRef("quickNote")} placeholder="Don’t forget to…" />
            <button type="submit" className="btn btn-small">Add</button>
          </form>
          {today.notes.items.map((n) => (
            <div key={n.key} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "9px 0", borderBottom: "1px solid var(--line2)" }}>
              <span onClick={n.remove} title="Done — clear it" style={{ flex: "none", width: 17, height: 17, marginTop: 2, borderRadius: 9, border: "1px solid var(--input-line)", cursor: "pointer" }} />
              <span style={{ flex: 1, minWidth: 0, font: "700 14px/1.4 'Plus Jakarta Sans',system-ui,sans-serif", whiteSpace: "pre-wrap" }}>{n.text}</span>
            </div>
          ))}
          <div className="rows-empty">{today.notes.empty}</div>
        </section>
      </div>
    </div>
  );
}
