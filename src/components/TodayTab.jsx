export default function TodayTab({ today, getRef }) {
  return (
    <div>
      <h1 className="page-title">Today</h1>

      <button onClick={today.goCheckin} className="btn btn-dark" style={{ display: "block", width: "100%", padding: "18px", font: "700 17px/1 -apple-system,BlinkMacSystemFont,'SF Pro Text',system-ui,sans-serif", marginBottom: 22 }}>
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
                <span style={{ display: "block", font: "600 11.5px/1.3 -apple-system,BlinkMacSystemFont,'SF Pro Text',system-ui,sans-serif", color: "var(--faint)", marginTop: 3 }}>{t.link}</span>
                {t.isTimed && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                    <input
                      type="number" min="0" defaultValue={t.minutesToday || ""} placeholder="0"
                      onBlur={(e) => t.logMinutes(Math.max(0, Math.round(+e.target.value || 0)))}
                      style={{ width: 64, border: "1px solid var(--input-line)", borderRadius: 8, padding: "6px 8px", font: "600 14px/1 -apple-system,BlinkMacSystemFont,'SF Pro Text',system-ui,sans-serif", background: "var(--bg)", color: "var(--text)" }}
                    />
                    <span style={{ font: "600 12px/1.3 -apple-system,BlinkMacSystemFont,'SF Pro Text',system-ui,sans-serif", color: "var(--faint)" }}>min today · target {t.timeTarget} min</span>
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
              <div style={{ font: "600 11.5px/1 -apple-system,BlinkMacSystemFont,'SF Pro Text',system-ui,sans-serif", letterSpacing: ".18em", textTransform: "uppercase", color: "var(--hint)" }}>Didn’t get to it? · {today.yesterday.date}</div>
              {today.yesterday.tasks.map((t) => (
                <div key={t.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "9px 0", cursor: "pointer" }} onClick={t.toggle}>
                  <span style={t.box} />
                  <span style={{ flex: 1, minWidth: 0, font: "600 14px/1.35 -apple-system,BlinkMacSystemFont,'SF Pro Text',system-ui,sans-serif" }}>{t.title}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="section-title green">Currently reading</div>
          <div className="book-grid" style={{ marginTop: 16 }}>
            {today.readingBooks.map((b) => (
              <div key={b.key} onClick={b.open} className="book-tile">
                {b.cover ? (
                  <img src={b.cover} alt="" className="book-tile-cover" />
                ) : (
                  <div className="book-tile-cover book-tile-cover-empty">no cover</div>
                )}
                <div className="book-tile-title">{b.t}</div>
              </div>
            ))}
          </div>
          <div className="rows-empty">{today.readingEmpty}</div>
        </section>

        <section>
          <div className="section-title green">Complementary to-do</div>
          <div style={{ font: "600 12.5px/1.4 -apple-system,BlinkMacSystemFont,'SF Pro Text',system-ui,sans-serif", color: "var(--muted)", marginBottom: 10 }}>Little things that pop up — no due date, no obligation to do them today.</div>
          <form className="inline-form" onSubmit={today.notes.add}>
            <input ref={getRef("quickNote")} placeholder="Don’t forget to…" />
            <button type="submit" className="btn btn-small">Add</button>
          </form>
          {today.notes.items.map((n) => (
            <div key={n.key} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "9px 0", borderBottom: "1px solid var(--line2)" }}>
              <span onClick={n.remove} title="Done — clear it" style={{ flex: "none", width: 17, height: 17, marginTop: 2, borderRadius: 9, border: "1px solid var(--input-line)", cursor: "pointer" }} />
              <span style={{ flex: 1, minWidth: 0, font: "600 14px/1.4 -apple-system,BlinkMacSystemFont,'SF Pro Text',system-ui,sans-serif", whiteSpace: "pre-wrap" }}>{n.text}</span>
            </div>
          ))}
          <div className="rows-empty">{today.notes.empty}</div>
        </section>
      </div>
    </div>
  );
}
