'use client';

import { useState } from 'react';
import AppShell from '@/components/app-shell';

export default function InterestsPage() {
  const [searchGender, setSearchGender] = useState('women');
  const [hobbies, setHobbies] = useState(['cooking']);
  const [ageRange, setAgeRange] = useState([21, 35]);
  const [heightRange, setHeightRange] = useState([160, 180]);
  const [maxDistance, setMaxDistance] = useState(50);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [globalView, setGlobalView] = useState(false);
  const [datingIntent, setDatingIntent] = useState('relationship');

  const genderOptions = [
    { id: 'women', label: 'Frauen' },
    { id: 'men', label: 'Männer' },
    { id: 'non-binary', label: 'Nicht-binär' },
    { id: 'all', label: 'Alle' },
    { id: 'prefer-not', label: 'Möchte ich nicht angeben' },
  ];

  const hobbyOptions = [
    'Reisen',
    'Musik',
    'Kochen',
    'Sport',
    'Gaming',
    'Fotografie',
    'Lesen',
    'Kunst',
  ];

  const toggleHobby = (hobby: string) => {
    setHobbies(prev =>
      prev.includes(hobby)
        ? prev.filter(h => h !== hobby)
        : [...prev, hobby]
    );
  };

  const handleAgeChange = (index: number, value: number) => {
    const newRange = [...ageRange];
    newRange[index] = value;
    if (index === 0 && value <= newRange[1]) {
      setAgeRange(newRange);
    } else if (index === 1 && value >= newRange[0]) {
      setAgeRange(newRange);
    }
  };

  const handleHeightChange = (index: number, value: number) => {
    const newRange = [...heightRange];
    newRange[index] = value;
    if (index === 0 && value <= newRange[1]) {
      setHeightRange(newRange);
    } else if (index === 1 && value >= newRange[0]) {
      setHeightRange(newRange);
    }
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
    chipContainer: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '0.75rem',
      marginBottom: '1rem',
    },
    chip: (active: boolean) => ({
      padding: '0.5rem 1rem',
      borderRadius: '9999px',
      border: active ? 'none' : '1px solid #333333',
      backgroundColor: active ? '#a855f7' : 'transparent',
      color: active ? '#ffffff' : '#cccccc',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: active ? '#9333ea' : '#1a1a1a',
      },
    }),
    dashedChip: {
      padding: '0.5rem 1rem',
      borderRadius: '9999px',
      border: '1.5px dashed #666666',
      backgroundColor: 'transparent',
      color: '#999999',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500',
      transition: 'all 0.2s ease',
    },
    rangeContainer: {
      marginBottom: '1.5rem',
    },
    rangeValues: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '0.75rem',
      fontSize: '0.875rem',
      color: '#cccccc',
    },
    rangeInputs: {
      display: 'flex',
      gap: '1rem',
    },
    rangeInput: {
      flex: 1,
      padding: '0.5rem',
      borderRadius: '0.5rem',
      border: '1px solid #333333',
      backgroundColor: '#1a1a1a',
      color: '#a855f7',
      fontSize: '0.875rem',
      textAlign: 'center' as const,
    },
    sliderContainer: {
      marginBottom: '1.5rem',
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
    filterRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem',
      backgroundColor: '#1a1a1a',
      borderRadius: '0.75rem',
      marginBottom: '1rem',
    },
    filterLabel: {
      fontSize: '0.875rem',
      fontWeight: '500',
    },
    toggle: (active: boolean) => ({
      width: '2.5rem',
      height: '1.25rem',
      borderRadius: '9999px',
      backgroundColor: active ? '#a855f7' : '#333333',
      cursor: 'pointer',
      position: 'relative' as const,
      transition: 'background-color 0.2s ease',
      padding: '0.15rem',
      display: 'flex',
      alignItems: 'center',
    }),
    toggleCircle: (active: boolean) => ({
      width: '1rem',
      height: '1rem',
      borderRadius: '50%',
      backgroundColor: '#ffffff',
      transition: 'transform 0.2s ease',
      transform: active ? 'translateX(1.25rem)' : 'translateX(0)',
    }),
    button: {
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
          <h1 style={styles.heading}>Wenn suchst du?</h1>
          <p style={styles.subtitle}>Definiere deinen idealen Match</p>
        </div>

        {/* Ich suche Section */}
        <div style={styles.section}>
          <div style={styles.sectionLabel}>Ich suche</div>
          <div style={styles.chipContainer}>
            {genderOptions.map(option => (
              <button
                key={option.id}
                onClick={() => setSearchGender(option.id)}
                style={{
                  ...styles.chip(searchGender === option.id),
                  padding: '0.5rem 1rem',
                  borderRadius: '9999px',
                  border: searchGender === option.id ? 'none' : '1px solid #333333',
                  backgroundColor: searchGender === option.id ? '#a855f7' : 'transparent',
                  color: searchGender === option.id ? '#ffffff' : '#cccccc',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hobbys Section */}
        <div style={styles.section}>
          <div style={styles.sectionLabel}>Hobbys</div>
          <div style={styles.chipContainer}>
            {hobbyOptions.map(hobby => (
              <button
                key={hobby}
                onClick={() => toggleHobby(hobby)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '9999px',
                  border: hobbies.includes(hobby) ? 'none' : '1px solid #333333',
                  backgroundColor: hobbies.includes(hobby) ? '#a855f7' : 'transparent',
                  color: hobbies.includes(hobby) ? '#ffffff' : '#cccccc',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                }}
              >
                {hobby}
              </button>
            ))}
            <button
              style={{
                ...styles.dashedChip,
              }}
            >
              + Mehr
            </button>
          </div>
        </div>

        {/* Alter Section */}
        <div style={styles.section}>
          <div style={styles.sectionLabel}>Alter</div>
          <div style={styles.rangeValues}>
            <span>Min {ageRange[0]} Jahre</span>
            <span>Max {ageRange[1]} Jahre</span>
          </div>
          <div style={styles.rangeInputs}>
            <input
              type="number"
              min="16"
              max="99"
              value={ageRange[0]}
              onChange={e => handleAgeChange(0, parseInt(e.target.value))}
              style={styles.rangeInput}
            />
            <input
              type="number"
              min="16"
              max="99"
              value={ageRange[1]}
              onChange={e => handleAgeChange(1, parseInt(e.target.value))}
              style={styles.rangeInput}
            />
          </div>
        </div>

        {/* Größe Section */}
        <div style={styles.section}>
          <div style={styles.sectionLabel}>Größe</div>
          <div style={styles.rangeValues}>
            <span>Min {heightRange[0]}cm</span>
            <span>Max {heightRange[1]}cm</span>
          </div>
          <div style={styles.rangeInputs}>
            <input
              type="number"
              min="140"
              max="200"
              value={heightRange[0]}
              onChange={e => handleHeightChange(0, parseInt(e.target.value))}
              style={styles.rangeInput}
            />
            <input
              type="number"
              min="140"
              max="200"
              value={heightRange[1]}
              onChange={e => handleHeightChange(1, parseInt(e.target.value))}
              style={styles.rangeInput}
            />
          </div>
        </div>

        {/* Maximale Entfernung Section */}
        <div style={styles.section}>
          <div style={styles.sectionLabel}>Maximale Entfernung</div>
          <div style={styles.sliderValues}>
            <span>{maxDistance} km</span>
            <span>Bis 10.000 km</span>
          </div>
          <input
            type="range"
            min="1"
            max="10000"
            value={maxDistance}
            onChange={e => setMaxDistance(parseInt(e.target.value))}
            style={{
              ...styles.slider,
              backgroundImage: `linear-gradient(to right, #a855f7 0%, #a855f7 ${(maxDistance / 10000) * 100}%, #333333 ${(maxDistance / 10000) * 100}%, #333333 100%)`,
            }}
          />
        </div>

        {/* Weitere Filter Section */}
        <div style={styles.section}>
          <div style={styles.sectionLabel}>Weitere Filter</div>

          <div style={styles.filterRow}>
            <span style={styles.filterLabel}>Nur verifizierte Profile</span>
            <button
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              style={styles.toggle(verifiedOnly)}
            >
              <div style={styles.toggleCircle(verifiedOnly)} />
            </button>
          </div>

          <div style={styles.filterRow}>
            <span style={styles.filterLabel}>Global anzeigen</span>
            <button
              onClick={() => setGlobalView(!globalView)}
              style={styles.toggle(globalView)}
            >
              <div style={styles.toggleCircle(globalView)} />
            </button>
          </div>

          <div style={styles.filterRow}>
            <span style={styles.filterLabel}>Dating-Absicht: Beziehung</span>
            <select
              value={datingIntent}
              onChange={e => setDatingIntent(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid #333333',
                backgroundColor: '#1a1a1a',
                color: '#a855f7',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              <option value="relationship">Beziehung</option>
              <option value="casual">Casual Dating</option>
              <option value="friends">Freunde</option>
            </select>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={() => console.log('Preferences saved')}
          style={{
            ...styles.button,
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
