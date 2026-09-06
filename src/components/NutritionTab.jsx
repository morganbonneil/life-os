import { SLOTS } from "../lib/constants";

export default function NutritionTab({ nutri, getRef }) {
  return (
    <div>
      <h1 className="page-title">Nutrition &amp; Groceries</h1>

      <div className="subtabs">
        {nutri.subs.map((s) => (
          <button key={s.key} onClick={s.pick} style={s.st}>{s.label}</button>
        ))}
      </div>

      {nutri.isDay && (
        <div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 14 }}>
            {nutri.days.map((d) => (
              <button key={d.key} onClick={d.pick} style={d.st} className="day-btn">
                <span className="dow">{d.dow}</span>
                <span className="num">{d.num}</span>
                <span className="tag">{d.tag}</span>
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap", marginBottom: 24 }}>
            <span className="hint" style={{ margin: 0 }}>This day is:</span>
            {nutri.dayOverride.options.map((o) => (
              <button key={o.label} onClick={o.pick} style={o.st}>{o.label}</button>
            ))}
          </div>

          <div className="grid">
            <section>
              <div className="section-title green">{nutri.selLabel}</div>
              {nutri.selMeals.map((m) => (
                <div key={m.key} className="row-line">
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
                    <span style={{ font: "700 11.5px/1 'Plus Jakarta Sans',system-ui,sans-serif", letterSpacing: ".18em", textTransform: "uppercase", color: "var(--hint)" }}>{m.slot} · {m.time}</span>
                  </div>
                  <div style={{ font: "700 16px/1.35 'Plus Jakarta Sans',system-ui,sans-serif", marginTop: 6 }}>{m.title}</div>
                  <div style={{ font: "700 12.5px/1.4 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--muted)", marginTop: 4 }}>{m.macros}</div>
                  <div style={{ font: "700 12.5px/1.5 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--faint)", marginTop: 3 }}>{m.ingLine}</div>
                  <div style={{ marginTop: 9 }}>
                    <label className="field-label">Choose this meal for every {m.dayTypeLabel}</label>
                    <select value={m.chooseValue} onChange={(e) => m.choose(e.target.value)} className="ln" style={{ marginTop: 4 }}>
                      {m.chooseOptions.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </section>

            <section>
              <div className="section-title red">Day total</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(90px,1fr))", gap: 18, marginTop: 16 }}>
                {nutri.totals.map((t) => (
                  <div key={t.label}>
                    <div style={{ font: "700 11.5px/1 'Plus Jakarta Sans',system-ui,sans-serif", letterSpacing: ".18em", textTransform: "uppercase", color: "var(--hint)" }}>{t.label}</div>
                    <div style={{ font: "800 25px/1 'Plus Jakarta Sans',system-ui,sans-serif", marginTop: 7 }}>{t.val}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}

      {nutri.isLib && (
        <div className="grid grid-wide">
          <section>
            <div className="section-title green">My meals · {nutri.libCount}</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 14 }}>
              {nutri.libFilters.map((f) => (
                <button key={f.label} onClick={f.pick} style={f.st}>{f.label}</button>
              ))}
            </div>
            {nutri.lib.map((m) => (
              <div key={m.key} className="row-line">
                {!m.editing && (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
                      <span style={{ font: "700 16px/1.35 'Plus Jakarta Sans',system-ui,sans-serif" }}>{m.name}</span>
                      <span style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                        <button onClick={m.edit} className="link-btn" style={{ textDecoration: "none", fontSize: 12.5 }}>Edit</button>
                        <button onClick={m.remove} title="Delete" className="btn-x">✕</button>
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 7 }}>
                      <span style={m.slotTag}>{m.slot} · {m.time}</span>
                      <span style={m.dayTag}>{m.dayTxt}</span>
                    </div>
                    <div style={{ font: "700 12.5px/1.4 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--muted)", marginTop: 7 }}>{m.macros}</div>
                    <div style={{ font: "700 12.5px/1.5 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--faint)", marginTop: 3 }}>{m.ingLine}</div>
                  </>
                )}
                {m.editing && (
                  <form onSubmit={m.saveEdit}>
                    <div className="field" style={{ marginTop: 0 }}>
                      <label>Meal name</label>
                      <input ref={m.refs.name} defaultValue={m.editVals.name} />
                    </div>
                    <div className="field-grid">
                      <div>
                        <label className="field-label">Slot</label>
                        <select ref={m.refs.slot} className="ln" defaultValue={m.editVals.slot}>
                          {SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div><label className="field-label">Time</label><input ref={m.refs.time} type="time" defaultValue={m.editVals.time} className="ln" /></div>
                      <div>
                        <label className="field-label">Day type</label>
                        <select ref={m.refs.day} className="ln" defaultValue={m.editVals.day}>
                          <option value="training">Training day</option><option value="rest">Rest day</option>
                        </select>
                      </div>
                    </div>
                    <div className="field-grid narrow">
                      <div><label className="field-label">Kcal</label><input ref={m.refs.kcal} type="number" defaultValue={m.editVals.kcal} className="ln" /></div>
                      <div><label className="field-label">Prot. g</label><input ref={m.refs.p} type="number" defaultValue={m.editVals.p} className="ln" /></div>
                      <div><label className="field-label">Carb. g</label><input ref={m.refs.c} type="number" defaultValue={m.editVals.c} className="ln" /></div>
                      <div><label className="field-label">Fat g</label><input ref={m.refs.f} type="number" defaultValue={m.editVals.f} className="ln" /></div>
                    </div>
                    <div className="field">
                      <label>Foods — one per line</label>
                      <textarea ref={m.refs.ing} rows={4} defaultValue={m.editVals.ingLines} />
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <button type="submit" className="btn btn-green btn-small">Save changes</button>
                      <button type="button" onClick={m.cancelEdit} className="btn btn-small">Cancel</button>
                    </div>
                  </form>
                )}
              </div>
            ))}
          </section>

          <section>
            <div className="section-title red">New meal</div>
            <form onSubmit={nutri.addMeal}>
              <div className="field">
                <label>Meal name</label>
                <input ref={getRef("mName")} placeholder="Rice, chicken, courgette" />
              </div>
              <div className="field-grid">
                <div>
                  <label>Slot</label>
                  <select ref={getRef("mSlot")} defaultValue="Lunch">
                    {SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label>Time</label>
                  <input ref={getRef("mTime")} type="time" defaultValue="13:30" />
                </div>
                <div>
                  <label>Day type</label>
                  <select ref={getRef("mDay")} defaultValue="training">
                    <option value="training">Training day</option><option value="rest">Rest day</option>
                  </select>
                </div>
              </div>
              <div className="field-grid narrow">
                <div><label>Kcal</label><input ref={getRef("mKcal")} type="number" placeholder="780" /></div>
                <div><label>Prot. g</label><input ref={getRef("mP")} type="number" placeholder="52" /></div>
                <div><label>Carb. g</label><input ref={getRef("mC")} type="number" placeholder="90" /></div>
                <div><label>Fat g</label><input ref={getRef("mF")} type="number" placeholder="18" /></div>
              </div>
              <div className="field">
                <label>Foods — one per line</label>
                <textarea ref={getRef("mIng")} rows={5} placeholder={"Basmati rice 90 g\nChicken breast 180 g\nCourgette 1 pc\nOlive oil 15 ml"} />
                <div className="hint">Format “food quantity unit”. Quantities feed the grocery list.</div>
              </div>
              <button type="submit" className="btn btn-green" style={{ marginTop: 16 }}>Save meal</button>
            </form>
          </section>
        </div>
      )}

      {nutri.isShop && (
        <div className="grid grid-wide">
          <section>
            <div className="section-title-row">
              <span className="section-title green" style={{ border: 0, padding: 0 }}>Grocery list</span>
              <button onClick={nutri.regen} className="link-btn">Regenerate</button>
            </div>
            <div style={{ font: "700 13px/1.5 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--muted)", margin: "10px 0 2px" }}>{nutri.shopMeta}</div>
            {nutri.shop.map((c) => (
              <div key={c.cat} style={{ marginTop: 18 }}>
                <div style={{ font: "700 11.5px/1 'Plus Jakarta Sans',system-ui,sans-serif", letterSpacing: ".18em", textTransform: "uppercase", color: "var(--red)" }}>{c.cat}</div>
                {c.items.map((i) => (
                  <div key={i.key} style={{ display: "flex", gap: 9, alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--line2)" }}>
                    <span onClick={i.toggle} style={i.box}>{i.mark}</span>
                    <span style={i.name}>{i.n}</span>
                    <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }}>
                      <button onClick={i.minus} style={{ border: "1px solid var(--line)", background: "transparent", width: 26, height: 26, borderRadius: 99, font: "700 14px/1 'Plus Jakarta Sans',system-ui,sans-serif", cursor: "pointer", padding: 0 }}>−</button>
                      <span style={{ font: "700 13px/1 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--muted)", minWidth: 62, textAlign: "right", whiteSpace: "nowrap" }}>{i.q}</span>
                      <button onClick={i.plus} style={{ border: "1px solid var(--line)", background: "transparent", width: 26, height: 26, borderRadius: 99, font: "700 14px/1 'Plus Jakarta Sans',system-ui,sans-serif", cursor: "pointer", padding: 0 }}>+</button>
                      <button onClick={i.remove} title="Remove" className="btn-x">✕</button>
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </section>

          <section>
            <div className="section-title red">Add an item</div>
            <form onSubmit={nutri.addItem}>
              <div className="field">
                <label>Item</label>
                <input ref={getRef("sName")} placeholder="Baking paper" />
              </div>
              <div className="field-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(96px,1fr))" }}>
                <div>
                  <label>Quantity</label>
                  <input ref={getRef("sQty")} type="number" step="any" placeholder="1" />
                </div>
                <div>
                  <label>Unit</label>
                  <select ref={getRef("sUnit")} defaultValue="pc">
                    <option value="pc">piece</option><option value="g">g</option><option value="ml">ml</option><option value="kg">kg</option><option value="l">l</option>
                  </select>
                </div>
                <div>
                  <label>Aisle</label>
                  <select ref={getRef("sCat")} defaultValue="Pantry">
                    {nutri.cats.map((c) => <option key={c.v} value={c.v}>{c.v}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="btn" style={{ marginTop: 16 }}>Add to list</button>
            </form>
            <div className="hint" style={{ marginTop: 14 }}>Hand-edited quantities are kept; “Regenerate” returns to the amounts computed from this week’s meals.</div>
          </section>
        </div>
      )}

      {nutri.isHydra && (
        <div className="grid">
          <section>
            <div className="section-title green">Daily target</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
              <button onClick={nutri.waterDown} style={{ border: "1px solid var(--input-line)", background: "transparent", width: 30, height: 30, borderRadius: 99, font: "700 16px/1 'Plus Jakarta Sans',system-ui,sans-serif", cursor: "pointer", padding: 0 }}>−</button>
              <span style={{ font: "800 30px/1 'Plus Jakarta Sans',system-ui,sans-serif" }}>{nutri.waterTarget} L</span>
              <button onClick={nutri.waterUp} style={{ border: "1px solid var(--input-line)", background: "transparent", width: 30, height: 30, borderRadius: 99, font: "700 16px/1 'Plus Jakarta Sans',system-ui,sans-serif", cursor: "pointer", padding: 0 }}>+</button>
              <span style={{ font: "700 13px/1.4 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--muted)" }}>that is {nutri.glassCount} glasses of 250 ml</span>
            </div>
            <div style={{ font: "700 14px/1.5 'Plus Jakarta Sans',system-ui,sans-serif", color: "var(--muted)", marginTop: 14 }}>Today — {nutri.drunk} L. {nutri.nextRemind}</div>
          </section>

          <section>
            <div className="section-title red">Reminders</div>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 16 }}>
              {nutri.slots.map((s) => (
                <button key={s.t} onClick={s.remove} style={s.st}>{s.t} ✕</button>
              ))}
            </div>
            <form className="inline-form" onSubmit={nutri.addSlot}>
              <input ref={getRef("slot")} type="time" style={{ border: 0, borderBottom: "1px solid var(--input-line)", background: "transparent", padding: "7px 2px", font: "700 14px/1.2 'Plus Jakarta Sans',system-ui,sans-serif" }} />
              <button type="submit" className="btn btn-small">Add a reminder</button>
            </form>
            <div className="hint" style={{ marginTop: 18 }}>{nutri.notifStatus}</div>
            <button onClick={nutri.askNotif} className="btn btn-small" style={{ marginTop: 10 }}>{nutri.askLabel}</button>
          </section>
        </div>
      )}
    </div>
  );
}
