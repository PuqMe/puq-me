'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/app-shell';
import { updateMyVisibility } from '@/lib/profile';

interface VanishSettings {
  profileTimer: { enabled: boolean; duration: number; activatedAt?: number };
  intentTimer: { enabled: boolean; duration: number; activatedAt?: number };
  cardTimer: { enabled: boolean; duration: number; activatedAt?: number };
}

const defaultSettings: VanishSettings = {
  profileTimer: { enabled: true, duration: 4.5 * 60 * 60 * 1000 }, // 4h 30min
  intentTimer: { enabled: true, duration: 1.75 * 60 * 60 * 1000 }, // 1h 45min
  cardTimer: { enabled: true, duration: 45 * 60 * 1000 }, // 45min
};

export default function AutoVanishPage() {
  const [profileVisible, setProfileVisible] = useState(true);
  const [intentVisible, setIntentVisible] = useState(true);
  const [cardVisible, setCardVisible] = useState(true);
  const [settings, setSettings] = useState<VanishSettings>(defaultSettings);
  const [timers, setTimers] = useState({
    profile: { hours: 4, minutes: 30 },
    intent: { hours: 1, minutes: 45 },
    card: { hours: 0, minutes: 45 },
  });
  const [toast, setToast] = useState<string | null>(null);

  // Load settings from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('puqme.vanish.settings');
    if (stored) {
      const parsedSettings = JSON.parse(stored) as VanishSettings;
      setSettings(parsedSettings);
    }
  }, []);

  // Update timer display every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => ({
        ...prev,
        profile: calculateTimeRemaining(settings.profileTimer),
        intent: calculateTimeRemaining(settings.intentTimer),
        card: calculateTimeRemaining(settings.cardTimer),
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [settings]);

  const calculateTimeRemaining = (timer: VanishSettings['profileTimer']) => {
    if (!timer.activatedAt) {
      return { hours: Math.floor(timer.duration / 3600000), minutes: Math.floor((timer.duration % 3600000) / 60000) };
    }

    const elapsed = Date.now() - timer.activatedAt;
    const remaining = Math.max(0, timer.duration - elapsed);
    const hours = Math.floor(remaining / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);

    // Auto-disable if timer reached zero
    if (remaining <= 0 && timer === settings.profileTimer && profileVisible) {
      handleProfileToggle();
    }

    return { hours, minutes };
  };

  const handleProfileToggle = async () => {
    const newState = !profileVisible;
    setProfileVisible(newState);

    const newSettings = {
      ...settings,
      profileTimer: {
        ...settings.profileTimer,
        enabled: newState,
        activatedAt: newState ? Date.now() : undefined,
      },
    };
    setSettings(newSettings);
    localStorage.setItem('puqme.vanish.settings', JSON.stringify(newSettings));

    try {
      await updateMyVisibility(newState);
      showToast(newState ? 'Profil wird sichtbar' : 'Profil wird unsichtbar');
    } catch (error) {
      console.error('Failed to update visibility:', error);
      showToast('Fehler beim Aktualisieren');
    }
  };

  const handleIntentToggle = () => {
    const newState = !intentVisible;
    setIntentVisible(newState);

    const newSettings = {
      ...settings,
      intentTimer: {
        ...settings.intentTimer,
        enabled: newState,
        activatedAt: newState ? Date.now() : undefined,
      },
    };
    setSettings(newSettings);
    localStorage.setItem('puqme.vanish.settings', JSON.stringify(newSettings));
    showToast(newState ? 'Intention aktiviert' : 'Intention deaktiviert');
  };

  const handleCardToggle = () => {
    const newState = !cardVisible;
    setCardVisible(newState);

    const newSettings = {
      ...settings,
      cardTimer: {
        ...settings.cardTimer,
        enabled: newState,
        activatedAt: newState ? Date.now() : undefined,
      },
    };
    setSettings(newSettings);
    localStorage.setItem('puqme.vanish.settings', JSON.stringify(newSettings));
    showToast(newState ? 'Micro Card aktiviert' : 'Micro Card deaktiviert');
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const getTimerPercentage = (hours: number, minutes: number, maxDuration: number) => {
    const totalMs = hours * 3600000 + minutes * 60000;
    return Math.min(100, (totalMs / maxDuration) * 100);
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
    fontSize: 'clamp(1.5rem, 4vw, 2rem)',
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: '8px',
  };

  const headerSubtitleStyle: React.CSSProperties = {
    fontSize: 'clamp(0.8rem, 2.5vw, 1rem)',
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '400',
  };

  const timerCardStyle = (borderColor: string): React.CSSProperties => ({
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: `2px solid ${borderColor}`,
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px',
    backdropFilter: 'blur(10px)',
  });

  const cardHeaderStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  };

  const cardTitleStyle: React.CSSProperties = {
    fontSize: 'clamp(0.8rem, 2.5vw, 1rem)',
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
  };

  const timerTextStyle: React.CSSProperties = {
    fontSize: 'clamp(0.8rem, 2.5vw, 1rem)',
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
  };

  const toggleStyle: React.CSSProperties = {
    width: '44px',
    height: '24px',
    borderRadius: '12px',
    backgroundColor: '#a855f7',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    minHeight: '44px',
  };

  const timerBarContainerStyle: React.CSSProperties = {
    width: '100%',
    height: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '3px',
    overflow: 'hidden',
    marginTop: '12px',
  };

  const timerBarStyle = (fillColor: string, percentage: number): React.CSSProperties => ({
    height: '100%',
    width: `${percentage}%`,
    backgroundColor: fillColor,
    transition: 'width 0.3s ease',
  });

  const dividerStyle: React.CSSProperties = {
    height: '1px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    margin: '32px 0',
  };

  const nextActivationStyle: React.CSSProperties = {
    marginTop: '32px',
    marginBottom: '32px',
  };

  const nextActivationLabelStyle: React.CSSProperties = {
    fontSize: 'clamp(0.8rem, 2.5vw, 1rem)',
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: '12px',
  };

  const timePickerRowStyle: React.CSSProperties = {
    display: 'grid',
    gap: '8px',
    gridTemplateColumns: 'repeat(auto-fill, minmax(55px, 1fr))',
  };

  const timeInputStyle: React.CSSProperties = {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(168, 85, 247, 0.3)',
    borderRadius: '8px',
    padding: '10px 8px',
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 'clamp(0.8rem, 2.5vw, 1rem)',
    fontWeight: '500',
    textAlign: 'center',
    cursor: 'pointer',
    minHeight: '44px',
  };

  const timeInputLabelStyle: React.CSSProperties = {
    fontSize: 'clamp(0.7rem, 2vw, 0.8rem)',
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: '4px',
    textAlign: 'center',
  };

  const footerTextStyle: React.CSSProperties = {
    fontSize: 'clamp(0.8rem, 2.5vw, 1rem)',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: '24px',
    fontWeight: '400',
  };

  const conceptSectionStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    flexWrap: 'wrap',
    margin: '32px 0',
    padding: '24px 0',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    gap: '12px',
  };

  const conceptCircleStyle = (opacity: number): React.CSSProperties => ({
    width: '48px',
    height: '48px',
    minWidth: '48px',
    borderRadius: '50%',
    backgroundColor: '#a855f7',
    opacity: opacity,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'clamp(0.7rem, 2vw, 0.8rem)',
    fontWeight: '600',
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.8)',
  });

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px',
    backgroundColor: '#a855f7',
    color: 'rgba(255, 255, 255, 0.95)',
    border: 'none',
    borderRadius: '10px',
    fontSize: 'clamp(0.8rem, 2.5vw, 1rem)',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '32px',
    transition: 'all 0.3s ease',
    minHeight: '44px',
  };

  return (
    <AppShell>
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 'calc(env(safe-area-inset-top, 0px) + 1rem)',
            right: 'calc(env(safe-area-inset-right, 0px) + 1rem)',
            backgroundColor: '#10b981',
            color: '#ffffff',
            padding: '1rem 1.5rem',
            borderRadius: '0.5rem',
            zIndex: 1000,
            fontWeight: 600,
            fontSize: 'clamp(0.8rem, 2.5vw, 1rem)',
          }}
        >
          {toast}
        </div>
      )}
      <div style={containerStyle}>
        <div style={headerStyle}>
          <div style={headerTitleStyle}>Auto-Verschwinden</div>
          <div style={headerSubtitleStyle}>Setze wann du und deine Inhalte unsichtbar werden</div>
        </div>

        {/* Profile Visibility Timer */}
        <div style={timerCardStyle('#10b981')}>
          <div style={cardHeaderStyle}>
            <div>
              <div style={cardTitleStyle}>Dein Profil ist {profileVisible ? 'sichtbar' : 'unsichtbar'}</div>
              <div style={timerTextStyle}>Noch {timers.profile.hours}h {timers.profile.minutes}min</div>
            </div>
            <button
              style={toggleStyle}
              onClick={handleProfileToggle}
              aria-label="Toggle profile visibility"
            />
          </div>
          <div style={timerBarStyle('#10b981', getTimerPercentage(timers.profile.hours, timers.profile.minutes, settings.profileTimer.duration))} />
        </div>

        {/* Active Intent Timer */}
        <div style={timerCardStyle('#a855f7')}>
          <div style={cardHeaderStyle}>
            <div>
              <div style={cardTitleStyle}>☕ {intentVisible ? 'Kaffee trinken' : 'Intention inaktiv'}</div>
              <div style={timerTextStyle}>Noch {timers.intent.hours}h {timers.intent.minutes}min</div>
            </div>
            <button
              style={toggleStyle}
              onClick={handleIntentToggle}
              aria-label="Toggle intent visibility"
            />
          </div>
          <div style={timerBarStyle('#a855f7', getTimerPercentage(timers.intent.hours, timers.intent.minutes, settings.intentTimer.duration))} />
        </div>

        {/* Micro Card Timer */}
        <div style={timerCardStyle('#f59e0b')}>
          <div style={cardHeaderStyle}>
            <div>
              <div style={cardTitleStyle}>Deine {cardVisible ? 'aktuelle' : 'inaktive'} Micro Card</div>
              <div style={timerTextStyle}>Noch {timers.card.hours}h {timers.card.minutes}min · 3 Reaktionen</div>
            </div>
            <button
              style={toggleStyle}
              onClick={handleCardToggle}
              aria-label="Toggle card visibility"
            />
          </div>
          <div style={timerBarStyle('#f59e0b', getTimerPercentage(timers.card.hours, timers.card.minutes, settings.cardTimer.duration))} />
        </div>

        <div style={dividerStyle} />

        {/* Next Activation */}
        <div style={nextActivationStyle}>
          <div style={nextActivationLabelStyle}>Nächste Aktivierung</div>
          <div style={timePickerRowStyle}>
            <div style={{ flex: 1 }}>
              <input type="number" style={timeInputStyle} placeholder="0" min="0" max="99" />
              <div style={timeInputLabelStyle}>Jahre</div>
            </div>
            <div style={{ flex: 1 }}>
              <input type="number" style={timeInputStyle} placeholder="0" min="0" max="12" />
              <div style={timeInputLabelStyle}>Monate</div>
            </div>
            <div style={{ flex: 1 }}>
              <input type="number" style={timeInputStyle} placeholder="0" min="0" max="31" />
              <div style={timeInputLabelStyle}>Tage</div>
            </div>
            <div style={{ flex: 1 }}>
              <input type="number" style={timeInputStyle} placeholder="0" min="0" max="23" />
              <div style={timeInputLabelStyle}>Stunden</div>
            </div>
            <div style={{ flex: 1 }}>
              <input type="number" style={timeInputStyle} placeholder="0" min="0" max="59" />
              <div style={timeInputLabelStyle}>Minuten</div>
            </div>
          </div>
        </div>

        {/* Concept Visualization */}
        <div style={conceptSectionStyle}>
          <div style={conceptCircleStyle(1)}>
            <div>Aktiv</div>
          </div>
          <div style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.3)' }}>→</div>
          <div style={conceptCircleStyle(0.7)}>
            <div>Abwesend</div>
          </div>
          <div style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.3)' }}>→</div>
          <div style={conceptCircleStyle(0.4)}>
            <div>Verblasst</div>
          </div>
          <div style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.3)' }}>→</div>
          <div style={conceptCircleStyle(0.1)}>
            <div>Weg</div>
          </div>
        </div>

        <div style={footerTextStyle}>Sichtbar für 6 Stunden · Dann komplett unsichtbar</div>

        <button style={buttonStyle}>Aktivieren</button>
      </div>
    </AppShell>
  );
}
