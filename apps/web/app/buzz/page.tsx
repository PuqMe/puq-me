'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/app-shell';
import { fetchNearbyUsers, sendWave } from '@/lib/social';
import { loadRadarMetrics, updateRadarMetrics, saveRadarMetrics } from '@/lib/radar-ranking';
import { applySmartRanking, loadBehaviorProfile } from '@/lib/ai-features';

interface BuzzSettings {
  vibrationEnabled: boolean;
  radius: number;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

export default function BuzzPage() {
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(true);
  const [showBuzz, setShowBuzz] = useState(true);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [nearbyUsers, setNearbyUsers] = useState<any[]>([]);
  const [buzzSettings, setBuzzSettings] = useState<BuzzSettings>({
    vibrationEnabled: true,
    radius: 200,
    quietHoursEnabled: true,
    quietHoursStart: "22:00",
    quietHoursEnd: "08:00",
  });

  const containerStyle: React.CSSProperties = {
    backgroundColor: '#07050f',
    minHeight: '100dvh',
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    position: 'relative',
    overflow: 'hidden',
    padding: 'env(safe-area-inset-top, 0px) 0 0 0',
  };

  const mapBackgroundStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    flex: 7,
    backgroundColor: '#07050f',
  };

  const bottomPanelStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    flex: 3,
    backgroundColor: '#07050f',
  };

  const contentStyle: React.CSSProperties = {
    position: 'relative',
    zIndex: 10,
    height: '100dvh',
    display: 'flex',
    flexDirection: 'column',
  };

  const mapWrapperStyle: React.CSSProperties = {
    flex: 1,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const buzzNotificationStyle: React.CSSProperties = {
    position: 'absolute',
    top: '40px',
    left: '20px',
    right: '20px',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    border: '2px solid #10b981',
    borderRadius: '12px',
    padding: '16px',
    backdropFilter: 'blur(10px)',
    animation: 'pulse-glow 2s ease-in-out infinite',
    zIndex: 20,
  };

  const buzzHeaderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  };

  const avatarStyle: React.CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#a855f7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: '18px',
    fontWeight: '600',
    position: 'relative',
  };

  const presenceDotStyle: React.CSSProperties = {
    width: '12px',
    height: '12px',
    backgroundColor: '#10b981',
    borderRadius: '50%',
    position: 'absolute',
    bottom: '-2px',
    right: '-2px',
    border: '2px solid #07050f',
  };

  const buzzTitleStyle: React.CSSProperties = {
    fontSize: 'clamp(1rem, 3vw, 1.125rem)',
    fontWeight: '700',
    color: '#10b981',
    letterSpacing: '0.5px',
  };

  const buzzDetailsStyle: React.CSSProperties = {
    fontSize: 'clamp(0.8rem, 2.5vw, 1rem)',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: '4px',
    fontWeight: '500',
  };

  const buzzStatusStyle: React.CSSProperties = {
    fontSize: 'clamp(0.7rem, 2vw, 0.8rem)',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: '12px',
  };

  const buttonRowStyle: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
  };

  const buzzButtonStyle = (backgroundColor: string): React.CSSProperties => ({
    flex: 1,
    padding: '10px 16px',
    backgroundColor: backgroundColor,
    color: 'rgba(255, 255, 255, 0.95)',
    border: 'none',
    borderRadius: '8px',
    fontSize: 'clamp(0.8rem, 2.5vw, 1rem)',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    minHeight: '44px',
  });

  const buzzSettingsPanelStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)',
    left: '20px',
    right: '20px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(168, 85, 247, 0.2)',
    borderRadius: '12px',
    padding: '16px',
    backdropFilter: 'blur(10px)',
    zIndex: 15,
  };

  const settingRowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '12px',
    marginBottom: '12px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  };

  const settingLabelStyle: React.CSSProperties = {
    fontSize: 'clamp(0.8rem, 2.5vw, 1rem)',
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
  };

  const settingValueStyle: React.CSSProperties = {
    fontSize: 'clamp(0.7rem, 2vw, 0.8rem)',
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: '2px',
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

  const panelFooterStyle: React.CSSProperties = {
    fontSize: 'clamp(0.7rem, 2vw, 0.8rem)',
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: '8px',
    textAlign: 'center',
    fontWeight: '400',
  };

  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes pulse-glow {
      0%, 100% {
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.3);
      }
      50% {
        box-shadow: 0 0 0 8px rgba(16, 185, 129, 0);
      }
    }

    @keyframes radar-pulse {
      0% {
        r: 20px;
        opacity: 0.6;
      }
      100% {
        r: 80px;
        opacity: 0;
      }
    }

    @keyframes glow {
      0%, 100% {
        filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.6));
      }
      50% {
        filter: drop-shadow(0 0 16px rgba(16, 185, 129, 0.8));
      }
    }
  `;

  useEffect(() => {
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("puqme.buzz.settings");
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setBuzzSettings(settings);
        setVibrationEnabled(settings.vibrationEnabled);
        setQuietHoursEnabled(settings.quietHoursEnabled);
      } catch (error) {
        console.error("Failed to load buzz settings:", error);
      }
    }
    setLoading(false);
  }, []);

  // Fetch nearby users and refresh periodically
  useEffect(() => {
    const fetchNearby = async () => {
      try {
        // Load ranking metrics and behavior profile
        const metrics = loadRadarMetrics();
        const behavior = loadBehaviorProfile();

        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              try {
                let users = await fetchNearbyUsers({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  radius: buzzSettings.radius,
                });

                // Apply smart ranking to nearby users
                const itemsToRank = users.map((u: any) => ({ id: String(u.id), score: 75 }));
                const rankedItems = applySmartRanking(itemsToRank, behavior, metrics);

                // Sort by ranked score
                const rankedMap = new Map(rankedItems.map(item => [String(item.id), item.score]));
                users = users.sort((a: any, b: any) => {
                  const scoreA = rankedMap.get(String(a.id)) || 75;
                  const scoreB = rankedMap.get(String(b.id)) || 75;
                  return scoreB - scoreA;
                });

                setNearbyUsers(users);
                // Show buzz notification if a nearby user is found
                if (users.length > 0) {
                  setShowBuzz(true);
                }
              } catch (error) {
                console.error("Failed to fetch nearby users:", error);
              }
            },
            (error) => {
              console.error("Geolocation error:", error);
            }
          );
        }
      } catch (error) {
        console.error("Failed to fetch nearby users:", error);
      }
    };

    fetchNearby();
    // Refresh every 30 seconds to simulate live radar
    const interval = setInterval(fetchNearby, 30000);
    return () => clearInterval(interval);
  }, [buzzSettings.radius]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const handleWave = async () => {
    if (nearbyUsers.length === 0) return;
    setSending(true);
    try {
      // Update metrics for like/engagement
      try {
        const metrics = loadRadarMetrics();
        const updated = updateRadarMetrics(metrics, String(nearbyUsers[0].id), { liked: true });
        saveRadarMetrics(updated);
      } catch (err) {
        console.warn('Failed to update radar metrics:', err);
      }
      // Send wave to the first nearby user
      await sendWave(nearbyUsers[0].id);
      // Trigger vibration if enabled
      if (vibrationEnabled && "vibrate" in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
      setShowBuzz(false);
      showToast("Winken gesendet! 👋");
    } catch (error) {
      console.error("Failed to send wave:", error);
      showToast("Fehler beim Winken");
    } finally {
      setSending(false);
    }
  };

  const updateBuzzSettings = (newSettings: Partial<BuzzSettings>) => {
    const updated = { ...buzzSettings, ...newSettings };
    setBuzzSettings(updated);
    localStorage.setItem("puqme.buzz.settings", JSON.stringify(updated));
    if (newSettings.vibrationEnabled !== undefined) {
      setVibrationEnabled(newSettings.vibrationEnabled);
    }
    if (newSettings.quietHoursEnabled !== undefined) {
      setQuietHoursEnabled(newSettings.quietHoursEnabled);
    }
    showToast("Einstellungen gespeichert");
  };

  return (
    <AppShell>
      <div style={containerStyle}>
        <div style={mapBackgroundStyle} />
        <div style={bottomPanelStyle} />

        <div style={contentStyle}>
          {/* SVG Map Background */}
          <div style={mapWrapperStyle}>
            <svg
              width="100%"
              height="100%"
              style={{ position: 'absolute', top: 0, left: 0 }}
              viewBox="0 0 400 400"
              preserveAspectRatio="xMidYMid slice"
            >
              {/* Grid background */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(168, 85, 247, 0.1)" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="400" height="400" fill="url(#grid)" />

              {/* Radar circles with animation */}
              <circle cx="200" cy="200" r="40" fill="none" stroke="rgba(168, 85, 247, 0.15)" strokeWidth="1" />
              <circle cx="200" cy="200" r="80" fill="none" stroke="rgba(168, 85, 247, 0.1)" strokeWidth="1" />
              <circle cx="200" cy="200" r="120" fill="none" stroke="rgba(168, 85, 247, 0.05)" strokeWidth="1" />

              {/* Animated radar rings */}
              <circle cx="200" cy="200" r="20" fill="none" stroke="rgba(168, 85, 247, 0.3)" strokeWidth="2">
                <animate attributeName="r" from="20" to="120" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.4" to="0" dur="3s" repeatCount="indefinite" />
              </circle>

              {/* Your position dot */}
              <circle cx="200" cy="200" r="8" fill="#a855f7" />
              <circle cx="200" cy="200" r="8" fill="none" stroke="#a855f7" strokeWidth="2" opacity="0.3">
                <animate attributeName="r" from="8" to="24" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite" />
              </circle>

              {/* Approaching person dot */}
              <circle cx="280" cy="150" r="8" fill="#10b981" style={{ animation: 'glow 1.5s ease-in-out infinite' }} />
              <circle cx="280" cy="150" r="12" fill="none" stroke="#10b981" strokeWidth="1.5" opacity="0.4" />
            </svg>

            {/* Buzz Notification */}
            {showBuzz && (
              <div style={buzzNotificationStyle}>
                <div style={buzzHeaderStyle}>
                  <div style={avatarStyle}>
                    M
                    <div style={presenceDotStyle} />
                  </div>
                  <div style={buzzTitleStyle}>📳 Buzz!</div>
                </div>
                <div style={buzzDetailsStyle}>Maya · ☕ Kaffee · 120m entfernt</div>
                <div style={buzzStatusStyle}>Gleicher Intent · Kommt näher</div>
                <div style={buttonRowStyle}>
                  <button
                    onClick={handleWave}
                    disabled={sending}
                    style={{
                      ...buzzButtonStyle('#10b981'),
                      opacity: sending ? 0.6 : 1,
                      cursor: sending ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {sending ? '⏳ Wird gesendet...' : '👋 Winken'}
                  </button>
                  <button
                    onClick={() => setShowBuzz(false)}
                    style={{
                      ...buzzButtonStyle('rgba(255, 255, 255, 0.08)'),
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    Ignorieren
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Settings Panel */}
          <div style={buzzSettingsPanelStyle}>
            <div style={settingRowStyle}>
              <div>
                <div style={settingLabelStyle}>Vibration bei Match</div>
              </div>
              <button
                style={{
                  ...toggleStyle,
                  background: vibrationEnabled ? '#a855f7' : 'rgba(255, 255, 255, 0.1)',
                }}
                onClick={() => updateBuzzSettings({ vibrationEnabled: !vibrationEnabled })}
                aria-label="Toggle vibration"
              />
            </div>

            <div style={settingRowStyle}>
              <div style={settingLabelStyle}>Buzz-Radius: {buzzSettings.radius}m</div>
              <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '18px' }}>›</div>
            </div>

            <div style={{ ...settingRowStyle, borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>
              <div>
                <div style={settingLabelStyle}>
                  Ruhezeiten {buzzSettings.quietHoursStart}-{buzzSettings.quietHoursEnd}
                </div>
              </div>
              <button
                style={{
                  ...toggleStyle,
                  background: quietHoursEnabled ? '#a855f7' : 'rgba(255, 255, 255, 0.1)',
                }}
                onClick={() => updateBuzzSettings({ quietHoursEnabled: !quietHoursEnabled })}
                aria-label="Toggle quiet hours"
              />
            </div>

            <div style={panelFooterStyle}>Kein App-Öffnen nötig · Funktioniert im Hintergrund</div>
          </div>
        </div>

        {/* Action Toast */}
        {toast && (
          <div
            style={{
              position: 'fixed',
              bottom: 'calc(env(safe-area-inset-bottom, 0px) + 100px)',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(168,85,247,0.9)',
              color: '#ffffff',
              padding: '12px 20px',
              borderRadius: '8px',
              fontSize: 'clamp(0.7rem, 2vw, 0.8rem)',
              zIndex: 50,
            }}
          >
            {toast}
          </div>
        )}
      </div>
    </AppShell>
  );
}
