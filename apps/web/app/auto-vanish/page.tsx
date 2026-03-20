'use client';

import { useState } from 'react';
import { AppShell } from '@/components/app-shell';

export default function AutoVanishPage() {
  const [profileVisible, setProfileVisible] = useState(true);
  const [intentVisible, setIntentVisible] = useState(true);
  const [cardVisible, setCardVisible] = useState(true);

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
    fontSize: '16px',
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
  };

  const timerTextStyle: React.CSSProperties = {
    fontSize: '14px',
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
    fontSize: '14px',
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: '12px',
  };

  const timePickerRowStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    justifyContent: 'space-between',
  };

  const timeInputStyle: React.CSSProperties = {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(168, 85, 247, 0.3)',
    borderRadius: '8px',
    padding: '10px 8px',
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '14px',
    fontWeight: '500',
    textAlign: 'center',
    cursor: 'pointer',
  };

  const timeInputLabelStyle: React.CSSProperties = {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: '4px',
    textAlign: 'center',
  };

  const footerTextStyle: React.CSSProperties = {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: '24px',
    fontWeight: '400',
  };

  const conceptSectionStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    margin: '32px 0',
    padding: '24px 0',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  };

  const conceptCircleStyle = (opacity: number): React.CSSProperties => ({
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#a855f7',
    opacity: opacity,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
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
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '32px',
    transition: 'all 0.3s ease',
  };

  return (
    <AppShell>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <div style={headerTitleStyle}>Auto-Verschwinden</div>
          <div style={headerSubtitleStyle}>Setze wann du und deine Inhalte unsichtbar werden</div>
        </div>

        {/* Profile Visibility Timer */}
        <div style={timerCardStyle('#10b981')}>
          <div style={cardHeaderStyle}>
            <div>
              <div style={cardTitleStyle}>Dein Profil ist sichtbar</div>
              <div style={timerTextStyle}>Noch 4h 30min</div>
            </div>
            <button
              style={toggleStyle}
              onClick={() => setProfileVisible(!profileVisible)}
              aria-label="Toggle profile visibility"
            />
          </div>
          <div style={timerBarStyle('#10b981', 75)} />
        </div>

        {/* Active Intent Timer */}
        <div style={timerCardStyle('#a855f7')}>
          <div style={cardHeaderStyle}>
            <div>
              <div style={cardTitleStyle}>☕ Kaffee trinken</div>
              <div style={timerTextStyle}>Noch 1h 45min</div>
            </div>
            <button
              style={toggleStyle}
              onClick={() => setIntentVisible(!intentVisible)}
              aria-label="Toggle intent visibility"
            />
          </div>
          <div style={timerBarStyle('#a855f7', 58)} />
        </div>

        {/* Micro Card Timer */}
        <div style={timerCardStyle('#f59e0b')}>
          <div style={cardHeaderStyle}>
            <div>
              <div style={cardTitleStyle}>Deine aktuelle Micro Card</div>
              <div style={timerTextStyle}>Noch 45min · 3 Reaktionen</div>
            </div>
            <button
              style={toggleStyle}
              onClick={() => setCardVisible(!cardVisible)}
              aria-label="Toggle card visibility"
            />
          </div>
          <div style={timerBarStyle('#f59e0b', 25)} />
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
