'use client';

import { useState } from 'react';
import { AppShell } from '@/components/app-shell';

export default function VisibilityPage() {
  const [visibilityMode, setVisibilityMode] = useState('global');
  const [visibilityRadius, setVisibilityRadius] = useState(50);
  const [activationMode, setActivationMode] = useState('until-disabled');
  const [timeValues, setTimeValues] = useState({ years: 0, months: 0, days: 0, hours: 0, minutes: 0 });

  const visibilityModes = [
    { id: 'global', title: 'Global', description: 'Alle können dich sehen' },
    { id: 'region', title: 'Region', description: 'Stadt, Bezirk, Straße' },
    { id: 'phantom', title: 'Phantom', description: 'Siehst andere, aber bist unsichtbar' },
    { id: 'zero', title: 'Zero', description: 'Komplett unsichtbar, keine Daten' },
    { id: 'friends', title: 'Freunde', description: 'Nur deine Freunde sehen dich' },
    { id: 'select-friends', title: 'Nur diese Freunde', description: 'Wähle einzelne Freunde' },
    { id: 'except-friends', title: 'Außer meine Freunde', description: 'Alle außer Freunde' },
    { id: 'group', title: 'Gruppe', description: 'Nur eine bestimmte Gruppe' },
  ];

  const handleTimeChange = (key: keyof typeof timeValues, value: number) => {
    setTimeValues(prev => ({
      ...prev,
      [key]: Math.max(0, value),
    }));
  };

  const styles = {
    container: {
      backgroundColor: '#07050f',
      color: '#ffffff',
      minHeight: '100vh',
      padding: '1.5rem',
    },
    header: {
      marginBottom: '2rem',
    },
    heading: {
      fontSize: '1.875rem',
      fontWeight: '700',
      marginBottom: '0.5rem',
    },
    subtitle: {
      fontSize: '0.875rem',
      color: '#999999',
    },
    section: {
      marginBottom: '2rem',
    },
    sectionLabel: {
      fontSize: '0.875rem',
      fontWeight: '600',
      marginBottom: '1rem',
      color: '#cccccc',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
    },
    radioGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.75rem',
      marginBottom: '1.5rem',
    },
    radioOption: (active: boolean) => ({
      padding: '1rem',
      borderRadius: '0.75rem',
      border: active ? '2px solid #a855f7' : '1px solid #333333',
      backgroundColor: active ? 'rgba(168, 85, 247, 0.1)' : '#1a1a1a',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    }),
    radio: (active: boolean) => ({
      width: '1.25rem',
      height: '1.25rem',
      borderRadius: '50%',
      border: '2px solid ' + (active ? '#a855f7' : '#666666'),
      backgroundColor: active ? '#a855f7' : 'transparent',
      flexShrink: 0,
    }),
    optionContent: {
      flex: 1,
    },
    optionTitle: {
      fontSize: '0.9rem',
      fontWeight: '600',
      marginBottom: '0.25rem',
      color: '#ffffff',
    },
    optionDescription: {
      fontSize: '0.8rem',
      color: '#999999',
    },
    dashedButton: {
      padding: '0.75rem 1.5rem',
      borderRadius: '0.75rem',
      border: '1.5px dashed #666666',
      backgroundColor: 'transparent',
      color: '#a855f7',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '600',
      marginBottom: '1.5rem',
      transition: 'all 0.2s ease',
    },
    divider: {
      height: '1px',
      backgroundColor: '#333333',
      margin: '2rem 0',
    },
    sliderContainer: {
      marginBottom: '2rem',
    },
    sliderValues: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '0.75rem',
      fontSize: '0.875rem',
      color: '#cccccc',
    },
    slider: {
      width: '100%',
      height: '0.5rem',
      borderRadius: '0.25rem',
      backgroundColor: '#333333',
      outline: 'none',
      appearance: 'none' as const,
    },
    toggleContainer: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '1.5rem',
      backgroundColor: '#1a1a1a',
      padding: '0.75rem',
      borderRadius: '0.75rem',
    },
    toggleButton: (active: boolean) => ({
      flex: 1,
      padding: '0.75rem 1rem',
      borderRadius: '0.5rem',
      border: 'none',
      backgroundColor: active ? '#a855f7' : 'transparent',
      color: active ? '#ffffff' : '#999999',
      cursor: 'pointer',
      fontSize: '0.85rem',
      fontWeight: '600',
      transition: 'all 0.2s ease',
    }),
    timePickerContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap: '0.75rem',
      marginBottom: '1.5rem',
    },
    timeInput: (disabled: boolean) => ({
      padding: '0.75rem',
      borderRadius: '0.5rem',
      border: '1px solid #333333',
      backgroundColor: disabled ? '#0a0a0a' : '#1a1a1a',
      color: disabled ? '#666666' : '#a855f7',
      textAlign: 'center' as const,
      fontSize: '0.875rem',
      fontWeight: '600',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
    }),
    timeLabel: {
      fontSize: '0.7rem',
      color: '#999999',
      textAlign: 'center' as const,
      marginTop: '0.5rem',
      fontWeight: '500',
    },
    saveButton: {
      padding: '0.75rem 2rem',
      borderRadius: '0.75rem',
      border: 'none',
      backgroundColor: '#a855f7',
      color: '#ffffff',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      width: '100%',
      transition: 'background-color 0.2s ease',
    },
  };

  return (
    <AppShell>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.heading}>Wer kann dich sehen?</h1>
          <p style={styles.subtitle}>Volle Kontrolle über deine Sichtbarkeit</p>
        </div>

        {/* Visibility Mode Section */}
        <div style={styles.section}>
          <div style={styles.sectionLabel}>Sichtbarkeits-Modus</div>
          <div style={styles.radioGroup}>
            {visibilityModes.map(mode => (
              <button
                key={mode.id}
                onClick={() => setVisibilityMode(mode.id)}
                style={{
                  ...styles.radioOption(visibilityMode === mode.id),
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  border: visibilityMode === mode.id ? '2px solid #a855f7' : '1px solid #333333',
                  backgroundColor: visibilityMode === mode.id ? 'rgba(168, 85, 247, 0.1)' : '#1a1a1a',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                }}
              >
                <div style={styles.radio(visibilityMode === mode.id)} />
                <div style={styles.optionContent}>
                  <div style={styles.optionTitle}>{mode.title}</div>
                  <div style={styles.optionDescription}>{mode.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Create New Group Button */}
        <button
          style={{
            ...styles.dashedButton,
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#a855f7')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#666666')}
        >
          + Neue Gruppe erstellen
        </button>

        <div style={styles.divider} />

        {/* Visibility Radius Section */}
        <div style={styles.sliderContainer}>
          <div style={styles.sectionLabel}>Sichtbarkeits-Radius</div>
          <div style={styles.sliderValues}>
            <span>{visibilityRadius} km</span>
            <span>Bis 10.000 km</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="10000"
            value={visibilityRadius}
            onChange={e => setVisibilityRadius(parseFloat(e.target.value))}
            step="0.1"
            style={{
              ...styles.slider,
              backgroundImage: `linear-gradient(to right, #a855f7 0%, #a855f7 ${(visibilityRadius / 10000) * 100}%, #333333 ${(visibilityRadius / 10000) * 100}%, #333333 100%)`,
            }}
          />
        </div>

        {/* Activation Duration Section */}
        <div style={styles.section}>
          <div style={styles.sectionLabel}>Aktivierungsdauer</div>
          <div style={styles.toggleContainer}>
            <button
              onClick={() => setActivationMode('until-disabled')}
              style={styles.toggleButton(activationMode === 'until-disabled')}
            >
              Bis deaktiviert
            </button>
            <button
              onClick={() => setActivationMode('manual')}
              style={styles.toggleButton(activationMode === 'manual')}
            >
              Manuell
            </button>
          </div>
        </div>

        {/* Time Picker Section */}
        {activationMode === 'manual' && (
          <div style={styles.section}>
            <div style={styles.timePickerContainer}>
              <div>
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={timeValues.years}
                  onChange={e => handleTimeChange('years', parseInt(e.target.value) || 0)}
                  style={styles.timeInput(false)}
                />
                <div style={styles.timeLabel}>Jahre</div>
              </div>
              <div>
                <input
                  type="number"
                  min="0"
                  max="11"
                  value={timeValues.months}
                  onChange={e => handleTimeChange('months', parseInt(e.target.value) || 0)}
                  style={styles.timeInput(false)}
                />
                <div style={styles.timeLabel}>Monate</div>
              </div>
              <div>
                <input
                  type="number"
                  min="0"
                  max="31"
                  value={timeValues.days}
                  onChange={e => handleTimeChange('days', parseInt(e.target.value) || 0)}
                  style={styles.timeInput(false)}
                />
                <div style={styles.timeLabel}>Tage</div>
              </div>
              <div>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={timeValues.hours}
                  onChange={e => handleTimeChange('hours', parseInt(e.target.value) || 0)}
                  style={styles.timeInput(false)}
                />
                <div style={styles.timeLabel}>Stunden</div>
              </div>
              <div>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={timeValues.minutes}
                  onChange={e => handleTimeChange('minutes', parseInt(e.target.value) || 0)}
                  style={styles.timeInput(false)}
                />
                <div style={styles.timeLabel}>Minuten</div>
              </div>
            </div>
          </div>
        )}

        {activationMode === 'until-disabled' && (
          <div style={styles.section}>
            <div style={styles.timePickerContainer}>
              <div>
                <input
                  type="number"
                  disabled
                  value={0}
                  style={styles.timeInput(true)}
                />
                <div style={styles.timeLabel}>Jahre</div>
              </div>
              <div>
                <input
                  type="number"
                  disabled
                  value={0}
                  style={styles.timeInput(true)}
                />
                <div style={styles.timeLabel}>Monate</div>
              </div>
              <div>
                <input
                  type="number"
                  disabled
                  value={0}
                  style={styles.timeInput(true)}
                />
                <div style={styles.timeLabel}>Tage</div>
              </div>
              <div>
                <input
                  type="number"
                  disabled
                  value={0}
                  style={styles.timeInput(true)}
                />
                <div style={styles.timeLabel}>Stunden</div>
              </div>
              <div>
                <input
                  type="number"
                  disabled
                  value={0}
                  style={styles.timeInput(true)}
                />
                <div style={styles.timeLabel}>Minuten</div>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={() => console.log('Visibility settings saved')}
          style={{
            ...styles.saveButton,
            marginBottom: '2rem',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#9333ea')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#a855f7')}
        >
          Speichern
        </button>
      </div>
    </AppShell>
  );
}
