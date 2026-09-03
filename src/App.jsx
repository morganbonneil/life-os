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

export default function App() {
  const { vals, ref, exportData, importData, resetDemo, syncMode, themePref, setThemePref, hydrationSlots } = useLifeOS();
  const push = usePush(hydrationSlots);

  return (
    <div className="app">
      <BottomNav tabs={vals.tabs} />
      <ToastStack toasts={vals.toasts} />

      <div className="shell">
        <div className="week-bar">
          <div className="week">Week {vals.head.week}</div>
          <div className="date">{vals.head.date}</div>
        </div>
        <div className="week-rule" />

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
          />
        )}

        <div style={{ height: 40 }} />
      </div>
    </div>
  );
}
