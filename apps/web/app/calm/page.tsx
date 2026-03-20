'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/app-shell';
import { fetchCircleEncounters } from '@/lib/social';

interface CalmSettings {
  dailyLimit: { enabled: boolean; limit: number };
  nightRest: { enabled: boolean };
  weeklyReport: { enabled: boolean };
}

const defaultSettings: CalmSettings = {
  dailyLimit: { enabled: true, limit: 3 },
  nightRest: { enabled: true },
  weeklyReport: { enabled: false },
};

interface DayData {
  day: string;
  value: number;
  height: number;
}

export default function CalmPage() {
  const [dailyLimitEnabled, setDailyLimitEnabled] = useState(true);
  const [nightRestEnabled, setNightRestEnabled] = useState(true);
  const [weeklyReportEnabled, setWeeklyReportEnabled] = useState(false);
  const [settings, setSettings] = useState<CalmSettings>(defaultSettings);
  const [stats, setStats] = useState({ encounters: 0, conversations: 0, timeMinutes: 0 });
  const [weekData, setWeekData] = useState<DayData[]>([
    { day: 'Mo', value: 2, height: 40 },
    { day: 'Di', value: 4, height: 80 },
    { day: 'Mi', value: 3, height: 60 },
    { day: 'Do', value: 5, height: 100 },
    { day: 'Fr', value: 6, height: 120 },
    { day: 'Sa', value: 4, height: 80 },
    { day: 'So', value: 3, height: 60 },
  ]);
  const [loading, setLoading] = useState(true);
  const [showNudge, setShowNudge] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('puqme.calm.settings');
    if (stored) {
      const parsedSettings = JSON.parse(stored) as CalmSettings;
      setSettings(parsedSettings);
      setDailyLimitEnabled(parsedSettings.dailyLimit.enabled);
      setNightRestEnabled(parsedSettings.nightRest.enabled);
      setWeeklyReportEnabled(parsedSettings.weeklyReport.enabled);
    }
  }, []);

  // Fetch encounter data on mount
  useEffect(() => {
    const loadEncounterData = async () => {
      try {
        // Fetch today's encounters
        const todayData = await fetchCircleEncounters('24h');
        if (todayData?.items) {
          const encounters = todayData.items.length;
          const conversations = todayData.items.filter(e => e.mutual).length;
          const totalMinutes = Math.floor(Math.random() * 60) + 1; // Placeholder calculation

          setStats({
            encounters,
            conversations,
            timeMinutes: totalMinutes,
          });

          // Check if should show nudge
          if (settings.dailyLimit.enabled && encounters >= settings.dailyLimit.limit) {
            setShowNudge(true);
          }
        }

        // Fetch 7-day data for chart
        const weekData = await fetchCircleEncounters('7d');
        if (weekData?.items) {
          const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
          const dayCounts = new Array(7).fill(0);

          weekData.items.forEach(encounter => {
            const date = new Date(encounter.timestamp);
            const dayIndex = (date.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
            dayCounts[dayIndex]++;
          });

          const newWeekData = days.map((day, idx) => ({
            day,
            value: dayCounts[idx],
            height: Math.min(120, dayCounts[idx] * 20),
          }));

          setWeekData(newWeekData);
        }
      } catch (error) {
        console.error('Failed to load encounter data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEncounterData();
  }, [settings.dailyLimit.limit, settings.dailyLimit.enabled]);

  const handleDailyLimitToggle = () => {
    const newState = !dailyLimitEnabled;
    setDailyLimitEnabled(newState);

    const newSettings = {
      ...settings,
      dailyLimit: { ...settings.dailyLimit, enabled: newState },
    };
    setSettings(newSettings);
    localStorage.setItem('puqme.calm.settings', JSON.stringify(newSettings));
  };

  const handleNightRestToggle = () => {
    const newState = !nightRestEnabled;
    setNightRestEnabled(newState);

    const newSettings = {
      ...settings,
      nightRest: { enabled: newState },
    };
    setSettings(newSettings);
    localStorage.setItem('puqme.calm.settings', JSON.stringify(newSettings));
  };

  const handleWeeklyReportToggle = () => {
    const newState = !weeklyReportEnabled;
    setWeeklyReportEnabled(newState);

    const newSettings = {
      ...settings,
      weeklyReport: { enabled: newState },
    };
    setSettings(newSettings);
    localStorage.setItem('puqme.calm.settings', JSON.stringify(newSettings));
  };

  const containerStyle: React.CSSProperties = {
    backgroundColor: '#07050f',
    minHeight: '100vh',
    color: 'rgba(255, 255, 255, 0.9)',
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  };

  const headerStyle: React.CSSProperties = {
    marginBottom: '32px',
    marginTop: '20px',
  };

  const headerTitleStyle: React.CSSProperties = {
    fontSize: '32px',
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: '8px',
  };

  const headerSubtitleStyle: React.CSSProperties = {
    fontSize: '16px',
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '400',
  };

  const statRowStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '32px',
  };

  const statCardStyle = (accentColor: string): React.CSSProperties => ({
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: `1px solid ${accentColor}`,
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center',
    backdropFilter: 'blur(10px)',
  });

  const statNumberStyle: React.CSSProperties = {
    fontSize: '32px',
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: '4px',
  };

  const statLabelStyle: React.CSSProperties = {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  };

  const calmMessageCardStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)',
    border: '2px solid #10b981',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '32px',
    backdropFilter: 'blur(10px)',
  };

  const calmTitleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: '8px',
  };

  const calmTextStyle: React.CSSProperties = {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: '1.5',
  };

  const weeklyChartStyle: React.CSSProperties = {
    marginBottom: '32px',
  };

  const chartTitleStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: '16px',
  };

  const chartContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: '120px',
    gap: '8px',
  };

  const chartBarWrapperStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
  };

  const chartBarStyle = (height: number, isToday: boolean): React.CSSProperties => ({
    width: '100%',
    height: `${height}px`,
    backgroundColor: isToday ? '#a855f7' : 'rgba(168, 85, 247, 0.4)',
    borderRadius: '4px 4px 0 0',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  });

  const chartLabelStyle: React.CSSProperties = {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: '8px',
    fontWeight: '500',
  };

  const dividerStyle: React.CSSProperties = {
    height: '1px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    margin: '32px 0',
  };

  const settingsSectionStyle: React.CSSProperties = {
    marginBottom: '32px',
  };

  const settingsTitleStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: '12px',
  };

  const settingRowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  };

  const settingLabelStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
  };

  const settingDescriptionStyle: React.CSSProperties = {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: '4px',
  };

  const toggleStyle: React.CSSProperties = {
    width: '44px',
    height: '24px',
    borderRadius: '12px',
    backgroundColor: '#a855f7',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  };

  const footerTextStyle: React.CSSProperties = {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '400',
    marginBottom: '32px',
    marginTop: '24px',
  };

  return (
    <AppShell>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <div style={headerTitleStyle}>Gut gemacht heute!</div>
          <div style={headerSubtitleStyle}>Deine echten Begegnungen zählen</div>
        </div>

        {/* Stats Cards */}
        <div style={statRowStyle}>
          <div style={statCardStyle('#10b981')}>
            <div style={statNumberStyle}>{loading ? '-' : stats.encounters}</div>
            <div style={statLabelStyle}>Begegnungen</div>
          </div>
          <div style={statCardStyle('#a855f7')}>
            <div style={statNumberStyle}>{loading ? '-' : stats.conversations}</div>
            <div style={statLabelStyle}>Gespräch</div>
          </div>
          <div style={statCardStyle('#3b82f6')}>
            <div style={statNumberStyle}>{loading ? '-' : stats.timeMinutes}</div>
            <div style={statLabelStyle}>Minuten</div>
          </div>
        </div>

        {/* Calm Message Card */}
        {showNudge && (
          <div style={calmMessageCardStyle}>
            <div style={calmTitleStyle}>🌿 Genug für heute?</div>
            <div style={calmTextStyle}>
              Du hast heute schon echte Verbindungen geknüpft. Vielleicht ist das genug für heute – für dein Wohlbefinden.
            </div>
          </div>
        )}

        {/* Weekly Chart */}
        <div style={weeklyChartStyle}>
          <div style={chartTitleStyle}>Diese Woche</div>
          <div style={chartContainerStyle}>
            {weekData.map((item, index) => (
              <div key={item.day} style={chartBarWrapperStyle}>
                <div
                  style={chartBarStyle(item.height, item.day === 'So')}
                  title={`${item.day}: ${item.value} Begegnungen`}
                />
                <div style={chartLabelStyle}>{item.day}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={dividerStyle} />

        {/* Calm Mode Settings */}
        <div style={settingsSectionStyle}>
          <div style={settingsTitleStyle}>Calm Mode</div>

          <div style={settingRowStyle}>
            <div>
              <div style={settingLabelStyle}>Tägliches Limit</div>
              <div style={settingDescriptionStyle}>Erinnerung nach {settings.dailyLimit.limit} Begegnungen</div>
            </div>
            <button
              style={toggleStyle}
              onClick={handleDailyLimitToggle}
              aria-label="Toggle daily limit"
            />
          </div>

          <div style={settingRowStyle}>
            <div>
              <div style={settingLabelStyle}>Nachtruhe</div>
              <div style={settingDescriptionStyle}>Ab 22:00 automatisch unsichtbar</div>
            </div>
            <button
              style={toggleStyle}
              onClick={handleNightRestToggle}
              aria-label="Toggle night rest"
            />
          </div>

          <div style={{ ...settingRowStyle, borderBottom: 'none' }}>
            <div>
              <div style={settingLabelStyle}>Wochenbericht</div>
              <div style={settingDescriptionStyle}>Sonntags deine echten Begegnungen</div>
            </div>
            <button
              style={toggleStyle}
              onClick={handleWeeklyReportToggle}
              aria-label="Toggle weekly report"
            />
          </div>
        </div>

        <div style={footerTextStyle}>PuQ.me sagt dir wann genug ist — ehrlich.</div>
      </div>
    </AppShell>
  );
}
