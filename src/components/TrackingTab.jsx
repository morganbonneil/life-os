export default function TrackingTab({ track, getRef }) {
  return (
    <div>
      <h1 className="page-title">Tracking</h1>

      <div className="subtabs">
        {track.subs.map((s) => (
          <button key={s.key} onClick={s.pick} style={s.st}>{s.label}</button>
        ))}
      </div>

      {track.isBooks && !track.bookDetail && (
        <div>
          <div className="section-title-row" style={{ marginBottom: 16 }}>
            <span className="section-title green" style={{ border: 0, padding: 0 }}>Reading</span>
            <span className="count">{track.bookMeta}</span>
          </div>
          <div className="book-grid">
            {track.bookTiles.map((b) => (
              <div key={b.key} onClick={b.open} className="book-tile">
                {b.cover ? (
                  <img src={b.cover} alt="" className="book-tile-cover" />
                ) : (
                  <div className="book-tile-cover book-tile-cover-empty">no cover</div>
                )}
                <div className="book-tile-title">{b.t}</div>
              </div>
            ))}
            <div className="book-tile book-tile-add" onClick={() => document.getElementById("bTitle")?.focus()}>
              <div className="book-tile-cover book-tile-cover-empty">+ add</div>
              <div className="book-tile-title">New book</div>
            </div>
          </div>

          <div className="grid grid-wide" style={{ marginTop: 24 }}>
            <section>
              <div className="section-title red">Add a book</div>
              <form onSubmit={track.addBook}>
                <div className="field">
                  <label>Title</label>
                  <input id="bTitle" ref={getRef("bTitle")} placeholder="Peak" />
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
        </div>
      )}

      {track.isBooks && track.bookDetail && (
        <div className="grid grid-wider">
          <section style={{ gridColumn: "1 / -1" }}>
            <button onClick={track.bookDetail.back} className="link-btn" style={{ textDecoration: "none" }}>← All books</button>
            <div style={{ display: "flex", gap: 16, marginTop: 14 }}>
              {track.bookDetail.cover ? (
                <img
                  src={track.bookDetail.cover} alt="" onClick={track.bookDetail.pickCover}
                  style={{ width: 84, height: 126, flex: "none", objectFit: "cover", borderRadius: 10, boxShadow: "0 4px 12px var(--shadow)", cursor: "pointer" }}
                />
              ) : (
                <div
                  onClick={track.bookDetail.pickCover} title="Add a cover photo"
                  style={{ width: 84, height: 126, flex: "none", borderRadius: 10, border: "1px dashed var(--input-line)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", font: "700 11px/1.2 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--faint)", textAlign: "center", padding: 4 }}
                >
                  + cover
                </div>
              )}
              <input
                ref={track.bookDetail.coverInputRef} type="file" accept="image/*" style={{ display: "none" }}
                onChange={(e) => { const f = e.target.files && e.target.files[0]; track.bookDetail.setCover(f); e.target.value = ""; }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
                  <span style={{ font: "800 20px/1.3 'Plus Jakarta Sans',system-ui,sans-serif" }}>{track.bookDetail.t}</span>
                  <button onClick={track.bookDetail.cycle} style={track.bookDetail.tag}>{track.bookDetail.status}</button>
                  <button onClick={track.bookDetail.remove} title="Delete" className="btn-x">✕</button>
                </div>
                <div style={{ font: "700 13px/1.4 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--faint)", marginTop: 4 }}>{track.bookDetail.a}</div>
                <div style={{ display: "flex", gap: 2, alignItems: "center", marginTop: 9, flexWrap: "wrap" }}>
                  {track.bookDetail.stars.map((s, i) => (
                    <button key={i} onClick={s.pick} title={s.title} style={s.st}>★</button>
                  ))}
                  <span style={{ font: "700 13px/1 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--muted)", marginLeft: 8, whiteSpace: "nowrap" }}>{track.bookDetail.ratingTxt}</span>
                </div>
                {track.bookDetail.cover && <button onClick={track.bookDetail.removeCover} className="link-btn" style={{ textDecoration: "none", marginTop: 8, fontSize: 11.5 }}>Remove cover</button>}
              </div>
            </div>
            <form onSubmit={track.bookDetail.saveReview} style={{ marginTop: 16 }}>
              <textarea ref={track.bookDetail.refReview} rows={3} defaultValue={track.bookDetail.review} placeholder="What you thought of it…" style={{ width: "100%", border: "1px solid var(--line)", background: "var(--bg)", borderRadius: 14, padding: 9, font: "700 14px/1.55 'Plus Jakarta Sans',system-ui,sans-serif", resize: "vertical" }} />
              <button type="submit" className="btn btn-small" style={{ marginTop: 8 }}>Save review</button>
            </form>
            <div style={{ marginTop: 14 }}>
              <div className="field-label" style={{ marginBottom: 0 }}>Quotes &amp; passages</div>
              {track.bookDetail.quotes.map((q) => (
                <div key={q.key} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 0", borderBottom: "1px solid var(--line2)" }}>
                  <span style={q.st}>{q.text}</span>
                  <button onClick={q.remove} title="Delete" className="btn-x" style={{ fontSize: 12.5 }}>✕</button>
                </div>
              ))}
              <form className="inline-form" onSubmit={track.bookDetail.addQuote}>
                <input ref={track.bookDetail.refQuote} placeholder="A passage that stayed with you…" />
                <button type="submit" className="btn btn-small" style={{ padding: "7px 11px", fontSize: 12.5 }}>Add</button>
              </form>
            </div>
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

      {track.isLearn && !track.learningDetail && (
        <div className="grid grid-wide">
          <section>
            <div className="section-title red">Learning of the day · {track.learnDate}</div>
            <form onSubmit={track.addLearning}>
              <div className="field" style={{ marginTop: 0 }}>
                <label>Title</label>
                <input ref={getRef("lTitle")} placeholder="What it's about, in a few words" />
              </div>
              <div className="field">
                <label>Details</label>
                <textarea ref={getRef("lText")} rows={5} placeholder="One thing you learned today…" style={{ width: "100%", border: "1px solid var(--line)", background: "var(--bg)", borderRadius: 14, padding: 12, font: "700 15px/1.6 'Plus Jakarta Sans',system-ui,sans-serif", resize: "vertical" }} />
              </div>
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
              <div key={l.key} style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline", padding: "12px 0", borderBottom: "1px solid var(--line2)" }}>
                <span onClick={l.open} style={{ font: "700 14.5px/1.35 'Plus Jakarta Sans',system-ui,sans-serif", cursor: "pointer", textDecoration: "underline" }}>{l.title}</span>
                <span style={{ font: "700 11.5px/1 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--faint)", whiteSpace: "nowrap" }}>{l.date}</span>
              </div>
            ))}
            <div className="rows-empty">{track.learnEmpty}</div>
          </section>
        </div>
      )}

      {track.isLearn && track.learningDetail && (
        <div className="grid grid-wide">
          <section style={{ gridColumn: "1 / -1" }}>
            <div className="section-title-row">
              <button onClick={track.learningDetail.back} className="link-btn" style={{ textDecoration: "none" }}>← All learnings</button>
              <button onClick={track.learningDetail.remove} title="Delete" className="btn-x">✕</button>
            </div>
            <div style={{ font: "800 20px/1.3 'Plus Jakarta Sans',system-ui,sans-serif", marginTop: 14 }}>{track.learningDetail.title}</div>
            <div style={{ font: "700 11.5px/1 'Plus Jakarta Sans',system-ui,sans-serif", letterSpacing: ".16em", textTransform: "uppercase", color: "var(--faint)", marginTop: 6 }}>{track.learningDetail.date}</div>
            <div style={Object.assign({}, track.learningDetail.textSt, { marginTop: 14 })}>{track.learningDetail.text}</div>
          </section>
        </div>
      )}

      {track.isFlash && (
        <div className="grid grid-wide">
          {track.flash.view === "study" && track.flash.study && !track.flash.study.summary && (
            <section style={{ gridColumn: "1 / -1", maxWidth: 420 }}>
              <div className="section-title-row">
                <span className="section-title green" style={{ border: 0, padding: 0 }}>{track.flash.study.phaseLabel}</span>
                <span className="count">{track.flash.study.pos} / {track.flash.study.total}</span>
              </div>
              <div
                className="flashcard"
                onClick={!track.flash.study.flipped ? track.flash.study.flip : undefined}
              >
                <div style={{ font: "800 26px/1.3 'Plus Jakarta Sans',system-ui,sans-serif", textAlign: "center" }}>
                  {track.flash.study.flipped ? track.flash.study.back : track.flash.study.front}
                </div>
                {!track.flash.study.flipped && <div className="hint" style={{ marginTop: 14, textAlign: "center" }}>Tap to reveal</div>}
              </div>
              {track.flash.study.flipped ? (
                <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                  <button onClick={track.flash.study.again} className="btn" style={{ flex: 1 }}>Again</button>
                  <button onClick={track.flash.study.good} className="btn btn-green" style={{ flex: 1 }}>Got it</button>
                </div>
              ) : (
                <button onClick={track.flash.study.flip} className="btn btn-dark" style={{ marginTop: 18, width: "100%" }}>Show answer</button>
              )}
              <button onClick={track.flash.study.end} className="link-btn" style={{ marginTop: 16, display: "block" }}>End session</button>
            </section>
          )}

          {track.flash.view === "study" && track.flash.study && track.flash.study.summary && (
            <section style={{ gridColumn: "1 / -1", maxWidth: 420 }}>
              <div className="section-title green" style={{ border: 0, padding: 0 }}>Pass done</div>
              <div style={{ display: "flex", gap: 24, marginTop: 18 }}>
                <div>
                  <div style={{ font: "800 34px/1 'Plus Jakarta Sans',system-ui,sans-serif" }}>{track.flash.study.knownCount}</div>
                  <div style={{ font: "700 12px/1 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--faint)", marginTop: 4 }}>known</div>
                </div>
                <div>
                  <div style={{ font: "800 34px/1 'Plus Jakarta Sans',system-ui,sans-serif" }}>{track.flash.study.unknownCount}</div>
                  <div style={{ font: "700 12px/1 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--faint)", marginTop: 4 }}>to revisit</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 22 }}>
                {track.flash.study.reviewUnknown && <button onClick={track.flash.study.reviewUnknown} className="btn btn-green">Review the unknowns ({track.flash.study.unknownCount})</button>}
                {track.flash.study.reviewKnown && <button onClick={track.flash.study.reviewKnown} className="btn btn-green-outline">Review the knowns ({track.flash.study.knownCount})</button>}
                <button onClick={track.flash.study.end} className="btn">Finish</button>
              </div>
            </section>
          )}

          {track.flash.view === "deck" && track.flash.deck && (
            <>
              <section>
                <div className="section-title-row">
                  <button onClick={track.flash.deck.back} className="link-btn" style={{ textDecoration: "none" }}>← Decks</button>
                  <span className="count">{track.flash.deck.total} cards · {track.flash.deck.due} due · {track.flash.deck.mastered} mastered</span>
                </div>
                <div style={{ font: "800 22px/1.25 'Plus Jakarta Sans',system-ui,sans-serif", marginTop: 12 }}>{track.flash.deck.name}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                  <button onClick={track.flash.deck.studyDue} className="btn btn-green" disabled={!track.flash.deck.due}>Study due ({track.flash.deck.due})</button>
                  <button onClick={track.flash.deck.studyAll} className="btn btn-green-outline" disabled={!track.flash.deck.total}>Practice all ({track.flash.deck.total})</button>
                </div>
                {track.flash.deck.cards.map((c) => (
                  <div key={c.key} style={{ padding: "13px 0", borderBottom: "1px solid var(--line2)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
                      <span style={{ font: "700 15px/1.35 'Plus Jakarta Sans',system-ui,sans-serif" }}>{c.front} → {c.back}</span>
                      <button onClick={c.remove} title="Delete" className="btn-x">✕</button>
                    </div>
                    <div style={{ font: "700 11.5px/1.3 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--faint)", marginTop: 4 }}>{c.meta}</div>
                  </div>
                ))}
                <div className="rows-empty">{track.flash.deck.cardsEmpty}</div>
              </section>

              <section>
                <div className="section-title red">New card</div>
                <form onSubmit={track.flash.deck.addCard}>
                  <div className="field">
                    <label>Front — the language you’re learning</label>
                    <input ref={getRef("fcFront")} placeholder="por favor" />
                  </div>
                  <div className="field">
                    <label>Back — the translation</label>
                    <input ref={getRef("fcBack")} placeholder="please" />
                  </div>
                  <button type="submit" className="btn btn-green" style={{ marginTop: 16 }}>Add card</button>
                </form>
              </section>
            </>
          )}

          {track.flash.view === "decks" && (
            <>
              <section>
                <div className="section-title-row">
                  <button onClick={track.flash.backToLanguages} className="link-btn" style={{ textDecoration: "none" }}>← Languages</button>
                  <span className="section-title green" style={{ border: 0, padding: 0 }}>{track.flash.language}</span>
                </div>
                {track.flash.decks.map((dk) => (
                  <div key={dk.key} style={{ padding: "14px 0", borderBottom: "1px solid var(--line2)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
                      <span onClick={dk.open} style={{ font: "800 17px/1.3 'Plus Jakarta Sans',system-ui,sans-serif", cursor: "pointer" }}>{dk.name}</span>
                      <button onClick={dk.remove} title="Delete" className="btn-x">✕</button>
                    </div>
                    <div style={{ font: "700 12.5px/1.4 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--muted)", marginTop: 4 }}>{dk.total} cards · {dk.due} due today</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                      <button onClick={dk.open} className="btn btn-small">Open</button>
                      <button onClick={dk.studyDue} className="btn btn-green btn-small" disabled={!dk.due}>Study due ({dk.due})</button>
                    </div>
                  </div>
                ))}
                <div className="rows-empty">{track.flash.decksEmpty}</div>
              </section>

              <section>
                <div className="section-title red">New deck in {track.flash.language}</div>
                <form onSubmit={track.flash.addDeck}>
                  <div className="field">
                    <label>Deck name</label>
                    <input ref={getRef("fdName")} placeholder="Verbs" />
                  </div>
                  <button type="submit" className="btn btn-green" style={{ marginTop: 16 }}>Create deck</button>
                </form>
              </section>
            </>
          )}

          {track.flash.view === "languages" && (
            <>
              <section>
                <div className="section-title green">Languages</div>
                {track.flash.languages.map((l) => (
                  <div key={l.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid var(--line2)" }}>
                    <span onClick={l.open} style={{ font: "800 17px/1.3 'Plus Jakarta Sans',system-ui,sans-serif", cursor: "pointer" }}>{l.language}</span>
                    <span style={{ font: "700 12.5px/1.4 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--muted)" }}>{l.total} cards · {l.due} due</span>
                  </div>
                ))}
                <div className="rows-empty">{track.flash.languagesEmpty}</div>
              </section>

              <section>
                <div className="section-title red">New deck</div>
                <form onSubmit={track.flash.addDeck}>
                  <div className="field">
                    <label>Language</label>
                    <input ref={getRef("fdLang")} placeholder="Italian" />
                  </div>
                  <div className="field">
                    <label>Deck name</label>
                    <input ref={getRef("fdName")} placeholder="Essentials" />
                  </div>
                  <button type="submit" className="btn btn-green" style={{ marginTop: 16 }}>Create deck</button>
                </form>
              </section>
            </>
          )}
        </div>
      )}
    </div>
  );
}
