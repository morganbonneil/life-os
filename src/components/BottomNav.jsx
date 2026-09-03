export default function BottomNav({ tabs }) {
  return (
    <nav className="bottom-nav">
      {tabs.map((t) => (
        <button key={t.num} onClick={t.pick} style={t.st}>
          <span className="num">{t.num}</span>
          <span className="label">{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
