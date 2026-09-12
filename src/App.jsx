import { useEffect, useState } from "react";
import { useLifeOS } from "./hooks/useLifeOS";
import { usePush } from "./lib/push";
import BottomNav from "./components/BottomNav.jsx";
import ToastStack from "./components/ToastStack.jsx";
import TodayTab from "./components/TodayTab.jsx";
import NutritionTab from "./components/NutritionTab.jsx";
import SprintTab from "./components/SprintTab.jsx";
import GoalsTab from "./components/GoalsTab.jsx";
import TrackingTab from "./components/TrackingTab.jsx";
import SettingsTab from "./components/SettingsTab.jsx";

function Splash({ onDone }) {
  const [hiding, setHiding] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setHiding(true), 2200);
    const t2 = setTimeout(onDone, 2700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className={"splash" + (hiding ? " splash-hide" : "")} onClick={onDone}>
      <span>C’est toi qui décides</span>
    </div>
  );
}

export default function App() {
  const { vals, ref, exportData, importData, resetDemo, syncMode, themePref, setThemePref } = useLifeOS();
  const push = usePush();
  const [showSplash, setShowSplash] = useState(true);

  return (
    <div className="app">
      {showSplash && <Splash onDone={() => setShowSplash(false)} />}
      <BottomNav tabs={vals.tabs} />
      <ToastStack toasts={vals.toasts} />

      <div className="shell">
        {vals.isToday && <TodayTab today={vals.today} getRef={ref} />}
        {vals.isNutri && <NutritionTab nutri={vals.nutri} getRef={ref} />}
        {vals.isSprint && <SprintTab sprint={vals.sprint} getRef={ref} />}
        {vals.isGoals && <GoalsTab goals={vals.goals} getRef={ref} />}
        {vals.isTrack && <TrackingTab track={vals.track} getRef={ref} />}
        {vals.isSettings && (
          <SettingsTab
            themePref={themePref}
            setThemePref={setThemePref}
            exportData={exportData}
            importData={importData}
            resetDemo={resetDemo}
            syncMode={syncMode}
            push={push}
            settings={vals.settings}
          />
        )}

        <div style={{ height: 40 }} />
      </div>
    </div>
  );
}
