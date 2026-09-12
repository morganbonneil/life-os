import { useLayoutEffect, useRef } from "react";

// Icons — plain stroke-only 24x24 glyphs, one per tab, in TAB_DEFS order.
const ICONS = {
  today: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <path d="M8 12l2.5 2.5L16 9" />
    </>
  ),
  nutrition: (
    <>
      <path d="M6 3v7a2 2 0 0 0 4 0V3" />
      <path d="M8 3v18" />
      <path d="M17 3c-2 0-3 2-3 4v4a2 2 0 0 0 2 2v9" />
    </>
  ),
  sprint: (
    <>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l3 2" />
      <path d="M9 2h6" />
    </>
  ),
  goals: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r=".6" fill="currentColor" />
    </>
  ),
  track: (
    <>
      <path d="M4 5.5c3-1 6-1 8 1 2-2 5-2 8-1v13c-3-1-6-1-8 1-2-2-5-2-8-1z" />
      <path d="M12 6.5v13" />
    </>
  ),
  settings: (
    <>
      <line x1="4" y1="7" x2="20" y2="7" />
      <circle cx="9" cy="7" r="2" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <circle cx="15" cy="12" r="2" />
      <line x1="4" y1="17" x2="20" y2="17" />
      <circle cx="7" cy="17" r="2" />
    </>
  ),
};

// Animated tab bar — a wavy pill-shaped menu with a colored bump that slides
// beneath the active icon. Adapted from the "AnimatedTabBar" component
// (react + inline SVG clip-path, no external UI framework needed); every
// item shares the same accent color rather than the original demo's
// per-item rainbow, so the active bump is always the app's own accent.
export default function BottomNav({ tabs }) {
  const menuRef = useRef(null);
  const menuBorderRef = useRef(null);
  const itemRefs = useRef([]);
  const activeIndex = tabs.findIndex((t) => t.active);

  const offsetMenuBorder = () => {
    const activeItem = itemRefs.current[activeIndex];
    const menu = menuRef.current;
    const menuBorder = menuBorderRef.current;
    if (activeItem && menu && menuBorder) {
      const itemBox = activeItem.getBoundingClientRect();
      const menuBox = menu.getBoundingClientRect();
      const left = Math.floor(itemBox.left - menuBox.left - (menuBorder.offsetWidth - itemBox.width) / 2);
      menuBorder.style.transform = "translate3d(" + left + "px, 0, 0)";
    }
  };

  useLayoutEffect(() => {
    offsetMenuBorder();
    const handleResize = () => {
      if (menuRef.current) menuRef.current.style.setProperty("--timeOut", "none");
      offsetMenuBorder();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, tabs.length]);

  return (
    <nav className="bottom-nav">
      <svg className="menu-clip-defs" aria-hidden="true">
        <clipPath id="menu-clip-path" clipPathUnits="objectBoundingBox">
          <path d="M 0.033021 1.000000 c 0.028093,0.002198,0.069492,-0.008791,0.114835,-0.087912 c 0.028093,-0.050549,0.048793,-0.109890,0.089207,-0.230769 c 0.052735,-0.156044,0.058157,-0.202198,0.101528,-0.314286 c 0.024643,-0.063736,0.045343,-0.114286,0.074914,-0.153846 c 0.034993,-0.046154,0.065550,-0.050549,0.086742,-0.046154 c 0.020700,-0.004396,0.051750,0.002198,0.086742,0.046154 c 0.030064,0.039560,0.050271,0.090110,0.074914,0.153846 c 0.043371,0.109890,0.048793,0.156044,0.101528,0.314286 c 0.040907,0.120879,0.061114,0.180220,0.089207,0.230769 c 0.045343,0.079121,0.086742,0.092308,0.114835,0.087912 H 0.033021 z" />
        </clipPath>
      </svg>
      <menu className="menu" ref={menuRef}>
        <div className="menu__bg" />
        {tabs.map((t, i) => (
          <button
            key={t.key}
            ref={(el) => (itemRefs.current[i] = el)}
            className={"menu__item" + (t.active ? " active" : "")}
            onClick={t.pick}
            aria-label={t.label}
            title={t.label}
          >
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              {ICONS[t.key]}
            </svg>
          </button>
        ))}
        <div className="menu__border" ref={menuBorderRef} />
      </menu>
    </nav>
  );
}
