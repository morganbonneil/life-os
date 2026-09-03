export default function TrackingTab({ track, getRef }) {
  return (
    <div>
      <h1 className="page-title">Tracking</h1>

      <div className="subtabs">
        {track.subs.map((s) => (
          <button key={s.key} onClick={s.pick} style={s.st}>{s.label}</button>
        ))}
      </div>

      {track.isBooks && (
        <div className="grid grid-wider">
          <section>
            <div className="section-title-row">
              <span className="section-title green" style={{ border: 0, padding: 0 }}>Reading</span>
              <span className="count">{track.bookMeta}</span>
            </div>
            {track.books.map((b) => (
              <div key={b.key} style={{ padding: "16px 0", borderBottom: "1px solid var(--line2)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
                  <span style={{ font: "800 17px/1.3 'Plus Jakarta Sans',system-ui,sans-serif" }}>{b.t}</span>
                  <button onClick={b.cycle} style={b.tag}>{b.status}</button>
                  <button onClick={b.remove} title="Delete" className="btn-x">✕</button>
                </div>
                <div style={{ font: "700 12.5px/1.4 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--faint)", marginTop: 4 }}>{b.a}</div>
                <div style={{ display: "flex", gap: 2, alignItems: "center", marginTop: 9, flexWrap: "wrap" }}>
                  {b.stars.map((s, i) => (
                    <button key={i} onClick={s.pick} title={s.title} style={s.st}>★</button>
                  ))}
                  <span style={{ font: "700 13px/1 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--muted)", marginLeft: 8, whiteSpace: "nowrap" }}>{b.ratingTxt}</span>
                </div>
                <form onSubmit={b.saveReview} style={{ marginTop: 11 }}>
                  <textarea ref={b.refReview} rows={3} defaultValue={b.review} placeholder="What you thought of it…" style={{ width: "100%", border: "1px solid var(--line)", background: "var(--bg)", borderRadius: 14, padding: 9, font: "700 14px/1.55 'Plus Jakarta Sans',system-ui,sans-serif", resize: "vertical" }} />
                  <button type="submit" className="btn btn-small" style={{ marginTop: 8 }}>Save review</button>
                </form>
                <div style={{ marginTop: 12 }}>
                  <div className="field-label" style={{ marginBottom: 0 }}>Quotes &amp; passages</div>
                  {b.quotes.map((q) => (
                    <div key={q.key} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 0", borderBottom: "1px solid var(--line2)" }}>
                      <span style={q.st}>{q.text}</span>
                      <button onClick={q.remove} title="Delete" className="btn-x" style={{ fontSize: 12.5 }}>✕</button>
                    </div>
                  ))}
                  <form className="inline-form" onSubmit={b.addQuote}>
                    <input ref={b.refQuote} placeholder="A passage that stayed with you…" />
                    <button type="submit" className="btn btn-small" style={{ padding: "7px 11px", fontSize: 12.5 }}>Add</button>
                  </form>
                </div>
              </div>
            ))}
          </section>

          <section>
            <div className="section-title red">Add a book</div>
            <form onSubmit={track.addBook}>
              <div className="field">
                <label>Title</label>
                <input ref={getRef("bTitle")} placeholder="Peak" />
              </div>
              <div className="field-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))" }}>
                <div><label className="field-label">Author</label><input ref={getRef("bAuthor")} placeholder="Anders Ericsson" className="ln" /></div>
                <div>
                  <label className="field-label">Status</label>
                  <select ref={getRef("bStatus")} className="ln" defaultValue="To read">
                    <option value="To read">To read</option><option value="Reading">Reading</option><option value="Finished">Finished</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-green" style={{ marginTop: 16 }}>Add to the shelf</button>
            </form>
          </section>
        </div>
      )}

      {track.isSkills && (
        <div className="grid grid-wide">
          <section>
            <div className="section-title-row">
              <span className="section-title green" style={{ border: 0, padding: 0 }}>Skills</span>
              <span style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {track.skillTabs.map((f) => (
                  <button key={f.label} onClick={f.pick} style={f.st}>{f.label}</button>
                ))}
              </span>
            </div>
            {track.skills.map((s) => (
              <div key={s.key} style={{ padding: "13px 0", borderBottom: "1px solid var(--line2)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
                  <span style={s.nameSt}>{s.n}</span>
                  <button onClick={s.cycle} style={s.tag}>{s.statusTxt}</button>
                  <button onClick={s.remove} title="Delete" className="btn-x">✕</button>
                </div>
                <div style={{ font: "700 13px/1.55 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--muted)", marginTop: 4 }}>{s.note}</div>
                <div style={{ font: "700 11.5px/1 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--faint)", marginTop: 6 }}>{s.dateTxt}</div>
              </div>
            ))}
            <div className="rows-empty">{track.skillEmpty}</div>
          </section>

          <section>
            <div className="section-title red">New skill</div>
            <form onSubmit={track.addSkill}>
              <div className="field">
                <label>Skill</label>
                <input ref={getRef("skName")} placeholder="Race video analysis" />
              </div>
              <div className="field-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))" }}>
                <div>
                  <label className="field-label">Status</label>
                  <select ref={getRef("skStatus")} className="ln" defaultValue="learned">
                    <option value="learned">Learned</option><option value="planned">Planned</option>
                  </select>
                </div>
                <div><label className="field-label">Date</label><input ref={getRef("skDate")} type="date" className="ln" /></div>
              </div>
              <div className="field">
                <label>Note</label>
                <textarea ref={getRef("skNote")} rows={3} placeholder="What it covers, where you got it…" />
              </div>
              <button type="submit" className="btn btn-green" style={{ marginTop: 16 }}>Save skill</button>
            </form>
          </section>
        </div>
      )}

      {track.isLearn && (
        <div className="grid grid-wide">
          <section>
            <div className="section-title red">Learning of the day · {track.learnDate}</div>
            <form onSubmit={track.addLearning}>
              <textarea ref={getRef("lText")} rows={7} placeholder="One thing you learned today…" style={{ width: "100%", marginTop: 14, border: "1px solid var(--line)", background: "var(--bg)", borderRadius: 14, padding: 12, font: "700 15px/1.6 'Plus Jakarta Sans',system-ui,sans-serif", resize: "vertical" }} />
              <button type="submit" className="btn btn-green" style={{ marginTop: 10 }}>Save learning</button>
            </form>
            <div style={{ font: "700 13px/1.55 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--muted)", marginTop: 14 }}>{track.learnStreak}</div>
          </section>

          <section>
            <div className="section-title-row">
              <span className="section-title green" style={{ border: 0, padding: 0 }}>All learnings</span>
              <span className="count">{track.learnCount}</span>
            </div>
            {track.learnings.map((l) => (
              <div key={l.key} style={{ padding: "14px 0", borderBottom: "1px solid var(--line2)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
                  <span style={{ font: "700 11.5px/1 'Plus Jakarta Sans',system-ui,sans-serif", letterSpacing: ".16em", textTransform: "uppercase", color: "var(--faint)" }}>{l.date}</span>
                  <button onClick={l.remove} title="Delete" className="btn-x">✕</button>
                </div>
                <div style={l.textSt}>{l.text}</div>
              </div>
            ))}
            <div className="rows-empty">{track.learnEmpty}</div>
          </section>
        </div>
      )}
    </div>
  );
}
