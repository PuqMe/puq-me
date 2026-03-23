'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/app-shell';
import { fetchMyCircles, createCircle, FriendCircle } from '@/lib/social';

interface GroupCard {
  id: string;
  emoji: string;
  title: string;
  location: string;
  distance?: string;
  time?: string;
  timer?: number;
  members: number;
  spots: number;
  memberInitials: string[];
}

export default function GroupsPage() {
  const fallbackGroups: GroupCard[] = [
    {
      id: 'featured',
      emoji: '🏐',
      title: 'Volleyball im Park',
      location: 'Tiergarten',
      time: 'Heute 16:00',
      timer: 45,
      members: 3,
      spots: 2,
      memberInitials: ['M', 'T', 'A'],
    },
    {
      id: 'coffee',
      emoji: '☕',
      title: 'Kaffee-Runde',
      location: 'Ernst Café',
      distance: '300m',
      members: 2,
      spots: 2,
      memberInitials: ['S', 'L'],
    },
    {
      id: 'running',
      emoji: '🏃',
      title: '5km Lauf-Gruppe',
      location: 'Tiergarten',
      distance: '1.5km',
      members: 3,
      spots: 3,
      memberInitials: ['J', 'K'],
    },
  ];

  const [groups, setGroups] = useState<GroupCard[]>(fallbackGroups);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const featuredGroup = groups[0] ?? {
    id: 'featured',
    emoji: '🏐',
    title: 'Volleyball im Park',
    location: 'Tiergarten',
    time: 'Heute 16:00',
    timer: 45,
    members: 3,
    spots: 2,
    memberInitials: ['M', 'T', 'A'],
  };
  const nearbyGroups = groups.slice(1);

  useEffect(() => {
    async function loadCircles() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchMyCircles();
        if (response && response.items && response.items.length > 0) {
          // Transform FriendCircle to GroupCard format
          const transformedGroups = response.items.map((circle: FriendCircle, idx: number) => ({
            id: circle.circleId,
            emoji: circle.emoji,
            title: circle.name,
            location: `${circle.members.length} Mitglieder`,
            members: circle.members.length,
            spots: Math.max(0, 6 - circle.members.length),
            memberInitials: circle.members.slice(0, 4).map(m => m.displayName.charAt(0).toUpperCase()),
          }));
          setGroups(transformedGroups);
        } else {
          setGroups(fallbackGroups);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load circles");
        setGroups(fallbackGroups);
      } finally {
        setIsLoading(false);
      }
    }

    loadCircles();
  }, []);

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
      fontSize: 'clamp(1.5rem, 4vw, 2rem)',
      fontWeight: '700',
      marginBottom: '0.5rem',
    },
    subtitle: {
      fontSize: 'clamp(0.7rem, 2vw, 0.8rem)',
      color: '#999999',
    },
    featuredCard: {
      borderRadius: '1rem',
      border: '2px solid #a855f7',
      backgroundColor: '#1a1a1a',
      padding: '1.5rem',
      marginBottom: '2rem',
    },
    groupHeader: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '1rem',
      marginBottom: '1rem',
    },
    emoji: {
      fontSize: '2rem',
      flexShrink: 0,
    },
    groupTitle: {
      fontSize: 'clamp(0.8rem, 2.5vw, 1rem)',
      fontWeight: '700',
      marginBottom: '0.25rem',
    },
    groupLocation: {
      fontSize: 'clamp(0.7rem, 2vw, 0.8rem)',
      color: '#999999',
      marginBottom: '0.5rem',
    },
    groupTime: {
      fontSize: 'clamp(0.7rem, 2vw, 0.8rem)',
      color: '#a855f7',
      fontWeight: '600',
    },
    timerBar: {
      width: '100%',
      height: '0.4rem',
      backgroundColor: '#333333',
      borderRadius: '0.2rem',
      overflow: 'hidden',
      marginBottom: '1rem',
    },
    timerFill: (percentage: number) => ({
      height: '100%',
      backgroundColor: '#a855f7',
      width: `${percentage}%`,
      transition: 'width 0.3s ease',
    }),
    groupStats: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
      padding: '1rem',
      backgroundColor: 'rgba(168, 85, 247, 0.05)',
      borderRadius: '0.5rem',
    },
    statsText: {
      fontSize: 'clamp(0.8rem, 2.5vw, 1rem)',
      fontWeight: '600',
    },
    membersList: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '1.5rem',
    },
    memberAvatar: (bgColor: string) => ({
      width: '2.75rem',
      height: '2.75rem',
      borderRadius: '50%',
      backgroundColor: bgColor,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 'clamp(0.7rem, 2vw, 0.8rem)',
      fontWeight: '700',
      color: '#ffffff',
      flexShrink: 0,
    }),
    emptySpot: {
      width: '2.75rem',
      height: '2.75rem',
      borderRadius: '50%',
      border: '2px dashed #666666',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1rem',
      color: '#666666',
      flexShrink: 0,
    },
    actionButtons: {
      display: 'flex',
      gap: '0.75rem',
    },
    primaryButton: {
      flex: 1,
      padding: '0.75rem 1rem',
      borderRadius: '0.5rem',
      border: 'none',
      backgroundColor: '#a855f7',
      color: '#ffffff',
      cursor: 'pointer',
      fontSize: 'clamp(0.8rem, 2.5vw, 1rem)',
      fontWeight: '600',
      transition: 'background-color 0.2s ease',
      minHeight: '44px',
    },
    secondaryButton: {
      width: '2.75rem',
      height: '2.75rem',
      padding: '0',
      borderRadius: '0.5rem',
      border: '1px solid #333333',
      backgroundColor: 'transparent',
      color: '#a855f7',
      cursor: 'pointer',
      fontSize: '1.25rem',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    divider: {
      height: '1px',
      backgroundColor: '#333333',
      margin: '2rem 0',
    },
    sectionLabel: {
      fontSize: 'clamp(0.7rem, 2vw, 0.8rem)',
      fontWeight: '600',
      marginBottom: '1rem',
      color: '#cccccc',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
    },
    nearbyCards: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1rem',
      marginBottom: '2rem',
    },
    smallCard: {
      borderRadius: '0.75rem',
      border: '1px solid #333333',
      backgroundColor: '#1a1a1a',
      padding: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    smallEmoji: {
      fontSize: '1.5rem',
      flexShrink: 0,
    },
    smallCardInfo: {
      flex: 1,
    },
    smallCardTitle: {
      fontSize: 'clamp(0.8rem, 2.5vw, 1rem)',
      fontWeight: '700',
      marginBottom: '0.25rem',
    },
    smallCardMeta: {
      fontSize: 'clamp(0.7rem, 2vw, 0.8rem)',
      color: '#999999',
      marginBottom: '0.25rem',
    },
    smallCardStats: {
      fontSize: 'clamp(0.7rem, 2vw, 0.8rem)',
      color: '#a855f7',
      fontWeight: '600',
    },
    createButton: {
      padding: '0.75rem 1.5rem',
      borderRadius: '0.75rem',
      border: '1.5px dashed #666666',
      backgroundColor: 'transparent',
      color: '#a855f7',
      cursor: 'pointer',
      fontSize: 'clamp(0.8rem, 2.5vw, 1rem)',
      fontWeight: '600',
      width: '100%',
      transition: 'all 0.2s ease',
      marginBottom: '2rem',
      minHeight: '44px',
    },
  };

  const memberColors = ['#ff69b4', '#00d4ff', '#22c55e', '#a855f7', '#fbbf24', '#ef4444'];

  return (
    <AppShell title="Zusammen aktiv">
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.heading}>Zusammen aktiv</h1>
          <p style={styles.subtitle}>
            Erstelle Gruppen-Aktivitäten — andere können beitreten
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '60px 0',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: '3px solid rgba(168,85,247,0.2)',
                borderTopColor: '#a855f7',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#fca5a5',
              fontSize: '13px',
              marginBottom: '20px',
            }}
          >
            {error}
          </div>
        )}

        {/* Featured Group Card */}
        {!isLoading && (
        <div style={styles.featuredCard}>
          <div style={styles.groupHeader}>
            <div style={styles.emoji}>{featuredGroup.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={styles.groupTitle}>{featuredGroup.title}</div>
              <div style={styles.groupLocation}>{featuredGroup.location}</div>
              <div style={styles.groupTime}>{featuredGroup.time}</div>
            </div>
          </div>

          {/* Timer Bar */}
          <div style={styles.timerBar}>
            <div style={styles.timerFill(Math.max(0, Math.min(100, (45 / 120) * 100)))} />
          </div>

          {/* Stats */}
          <div style={styles.groupStats}>
            <span style={styles.statsText}>
              {featuredGroup.members} dabei · {featuredGroup.spots} Plätze frei
            </span>
          </div>

          {/* Members */}
          <div style={styles.membersList}>
            {featuredGroup.memberInitials.map((initial, idx) => (
              <div
                key={idx}
                style={styles.memberAvatar(memberColors[idx % memberColors.length] || '#a855f7')}
              >
                {initial}
              </div>
            ))}
            <div style={styles.emptySpot}>+</div>
            <div style={styles.emptySpot}>+</div>
          </div>

          {/* Action Buttons */}
          <div style={styles.actionButtons}>
            <button
              style={styles.primaryButton}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#9333ea')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#a855f7')}
            >
              Mitmachen
            </button>
            <button
              style={styles.secondaryButton}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#a855f7';
                e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.1)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#333333';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              💬
            </button>
          </div>
        </div>
        )}

        {!isLoading && (
        <div style={styles.divider} />
        )}

        {/* Nearby Groups Section */}
        {!isLoading && (
        <div style={styles.sectionLabel}>Weitere Gruppen in der Nähe</div>
        )}

        {!isLoading && (
        <div style={styles.nearbyCards}>
          {nearbyGroups.map(group => (
            <div key={group.id} style={styles.smallCard}>
              <div style={styles.smallEmoji}>{group.emoji}</div>
              <div style={styles.smallCardInfo}>
                <div style={styles.smallCardTitle}>{group.title}</div>
                <div style={styles.smallCardMeta}>
                  {group.location}
                  {group.distance && ` · ${group.distance}`}
                </div>
                <div style={styles.smallCardStats}>
                  {group.members}/{group.spots} Mitglieder
                </div>
              </div>
            </div>
          ))}
        </div>
        )}

        {/* Create Button */}
        {!isLoading && (
        <button
          style={styles.createButton}
          disabled={isCreating}
          onClick={async () => {
            const name = prompt("Gruppen-Name:");
            if (!name) return;
            const emoji = prompt("Emoji (z.B. 🏐, ☕, 🏃):", "🎯");
            if (!emoji) return;

            setIsCreating(true);
            try {
              const newCircle = await createCircle(name, emoji || "🎯");
              if (newCircle) {
                const newGroup: GroupCard = {
                  id: newCircle.circleId,
                  emoji: newCircle.emoji,
                  title: newCircle.name,
                  location: `${newCircle.members.length} Mitglieder`,
                  members: newCircle.members.length,
                  spots: Math.max(0, 6 - newCircle.members.length),
                  memberInitials: newCircle.members.slice(0, 4).map(m => m.displayName.charAt(0).toUpperCase()),
                };
                setGroups([newGroup, ...groups]);
              }
            } catch (err) {
              setError(err instanceof Error ? err.message : "Failed to create circle");
            } finally {
              setIsCreating(false);
            }
          }}
          onMouseEnter={e => {
            if (!isCreating) {
              e.currentTarget.style.borderColor = '#a855f7';
              e.currentTarget.style.color = '#ffffff';
            }
          }}
          onMouseLeave={e => {
            if (!isCreating) {
              e.currentTarget.style.borderColor = '#666666';
              e.currentTarget.style.color = '#a855f7';
            }
          }}
        >
          {isCreating ? "Erstelle..." : "+ Neue Gruppen-Aktivität"}
        </button>
        )}
      </div>
    </AppShell>
  );
}
