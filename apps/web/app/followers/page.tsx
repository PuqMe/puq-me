'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/app-shell';
import { fetchCircleEncounters } from '@/lib/social';
import { fetchMyProfile } from '@/lib/profile';

interface Follower {
  id: string;
  name: string;
  city: string;
  followsSince: string;
  gradientFrom: string;
  gradientTo: string;
  isFollowing: boolean;
}

const gradientColors = [
  { from: '#ff69b4', to: '#ff6b6b' },
  { from: '#00d4ff', to: '#0099cc' },
  { from: '#a855f7', to: '#7c3aed' },
  { from: '#22c55e', to: '#16a34a' },
  { from: '#fbbf24', to: '#f59e0b' },
  { from: '#ef4444', to: '#dc2626' },
];

const demoFollowers: Follower[] = [
  {
    id: '1',
    name: 'Lisa M.',
    city: 'Berlin',
    followsSince: '2 Wochen',
    gradientFrom: '#ff69b4',
    gradientTo: '#ff6b6b',
    isFollowing: false,
  },
  {
    id: '2',
    name: 'Maya K.',
    city: 'München',
    followsSince: '1 Monat',
    gradientFrom: '#00d4ff',
    gradientTo: '#0099cc',
    isFollowing: true,
  },
  {
    id: '3',
    name: 'Tom S.',
    city: 'Köln',
    followsSince: '3 Wochen',
    gradientFrom: '#a855f7',
    gradientTo: '#7c3aed',
    isFollowing: true,
  },
  {
    id: '4',
    name: 'Anna W.',
    city: 'Hamburg',
    followsSince: '1 Woche',
    gradientFrom: '#22c55e',
    gradientTo: '#16a34a',
    isFollowing: false,
  },
  {
    id: '5',
    name: 'Jonas B.',
    city: 'Frankfurt',
    followsSince: '4 Wochen',
    gradientFrom: '#fbbf24',
    gradientTo: '#f59e0b',
    isFollowing: false,
  },
  {
    id: '6',
    name: 'Sophie R.',
    city: 'Stuttgart',
    followsSince: '10 Tage',
    gradientFrom: '#ef4444',
    gradientTo: '#dc2626',
    isFollowing: true,
  },
];

export default function FollowersPage() {
  const [activeTab, setActiveTab] = useState('followers');
  const [followers, setFollowers] = useState<Follower[]>(demoFollowers);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const loadFollowers = async () => {
      try {
        const [encountersData, profileData] = await Promise.all([
          fetchCircleEncounters('24h'),
          fetchMyProfile(),
        ]);

        const followerMap = new Map<string, Follower>();

        // Build from encounter users
        if (encountersData?.items) {
          encountersData.items.forEach((encounter, index) => {
            const colors = gradientColors[index % gradientColors.length];
            followerMap.set(encounter.userId, {
              id: encounter.userId,
              name: encounter.displayName,
              city: encounter.area,
              followsSince: new Date(encounter.timestamp).toLocaleDateString('de-DE'),
              gradientFrom: colors.from,
              gradientTo: colors.to,
              isFollowing: encounter.mutual,
            });
          });
        }

        // Load follow state from localStorage
        const storedState = localStorage.getItem('puqme.followers');
        const followState: Record<string, { following: boolean }> = storedState ? JSON.parse(storedState) : {};

        // Merge with stored state
        const mergedFollowers = Array.from(followerMap.values()).map(f => ({
          ...f,
          isFollowing: followState[f.id]?.following ?? f.isFollowing,
        }));

        // Use real data if available, fallback to demo
        setFollowers(mergedFollowers.length > 0 ? mergedFollowers : demoFollowers);
      } catch (error) {
        console.error('Failed to load followers:', error);
        setFollowers(demoFollowers);
      } finally {
        setLoading(false);
      }
    };

    loadFollowers();
  }, []);

  const toggleFollowing = (id: string) => {
    setFollowers(prev =>
      prev.map(f => (f.id === id ? { ...f, isFollowing: !f.isFollowing } : f))
    );

    // Save to localStorage
    const followerState = localStorage.getItem('puqme.followers');
    const state: Record<string, { following: boolean }> = followerState ? JSON.parse(followerState) : {};
    state[id] = { following: !state[id]?.following };
    localStorage.setItem('puqme.followers', JSON.stringify(state));

    // Show toast
    const follower = followers.find(f => f.id === id);
    setToast({
      message: state[id].following ? `Du folgst ${follower?.name}` : `Du folgst ${follower?.name} nicht mehr`,
      type: 'success',
    });
    setTimeout(() => setToast(null), 3000);
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
    statsContainer: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1.5rem',
      marginBottom: '2rem',
    },
    statCard: {
      backgroundColor: '#1a1a1a',
      padding: '1.5rem',
      borderRadius: '0.75rem',
      textAlign: 'center' as const,
    },
    statNumber: {
      fontSize: '2.5rem',
      fontWeight: '700',
      color: '#a855f7',
      marginBottom: '0.5rem',
    },
    statLabel: {
      fontSize: '0.875rem',
      color: '#999999',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
    },
    tabsContainer: {
      display: 'flex',
      gap: '0',
      marginBottom: '2rem',
      borderBottom: '1px solid #333333',
    },
    tab: (active: boolean) => ({
      flex: 1,
      padding: '1rem',
      textAlign: 'center' as const,
      fontSize: '0.9rem',
      fontWeight: '600',
      color: active ? '#a855f7' : '#666666',
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      borderBottom: active ? '2px solid #a855f7' : 'none',
      transition: 'all 0.2s ease',
      marginBottom: '-1px',
      position: 'relative' as const,
    }),
    badge: {
      display: 'inline-block',
      marginLeft: '0.5rem',
      padding: '0.25rem 0.5rem',
      borderRadius: '9999px',
      backgroundColor: '#a855f7',
      color: '#ffffff',
      fontSize: '0.75rem',
      fontWeight: '600',
    },
    followersList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1rem',
      marginBottom: '2rem',
    },
    followerCard: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '1rem',
      backgroundColor: '#1a1a1a',
      borderRadius: '0.75rem',
    },
    avatar: {
      width: '3rem',
      height: '3rem',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ffffff',
      fontSize: '1.25rem',
      fontWeight: '700',
      flexShrink: 0,
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: '0.95rem',
      fontWeight: '700',
      marginBottom: '0.25rem',
    },
    userMeta: {
      fontSize: '0.8rem',
      color: '#999999',
    },
    actionButton: (isFollowing: boolean) => ({
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      border: isFollowing ? '1px solid #333333' : 'none',
      backgroundColor: isFollowing ? 'rgba(255, 255, 255, 0.05)' : '#a855f7',
      color: isFollowing ? '#cccccc' : '#ffffff',
      cursor: 'pointer',
      fontSize: '0.8rem',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      backdropFilter: isFollowing ? 'blur(10px)' : 'none',
    }),
    showMoreButton: {
      padding: '0.75rem 1.5rem',
      borderRadius: '0.75rem',
      border: '1px solid #a855f7',
      backgroundColor: 'transparent',
      color: '#a855f7',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '600',
      width: '100%',
      transition: 'all 0.2s ease',
    },
  };

  return (
    <AppShell>
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            backgroundColor: toast.type === 'success' ? '#10b981' : '#ef4444',
            color: '#ffffff',
            padding: '1rem 1.5rem',
            borderRadius: '0.5rem',
            zIndex: 1000,
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
        >
          {toast.message}
        </div>
      )}
      <div style={styles.container}>
        {/* Stats Header */}
        <div style={styles.statsContainer}>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{followers.length}</div>
            <div style={styles.statLabel}>Follower</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{followers.filter(f => f.isFollowing).length}</div>
            <div style={styles.statLabel}>Following</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={styles.tabsContainer}>
          <button
            onClick={() => setActiveTab('followers')}
            style={styles.tab(activeTab === 'followers')}
          >
            Follower
            <span style={styles.badge}>{followers.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('following')}
            style={styles.tab(activeTab === 'following')}
          >
            Following
            <span style={styles.badge}>{followers.filter(f => f.isFollowing).length}</span>
          </button>
        </div>

        {/* Followers List */}
        {activeTab === 'followers' && (
          <div style={styles.followersList}>
            {followers.map(follower => (
              <div key={follower.id} style={styles.followerCard}>
                <div
                  style={{
                    ...styles.avatar,
                    backgroundImage: `linear-gradient(135deg, ${follower.gradientFrom}, ${follower.gradientTo})`,
                  }}
                >
                  {follower.name.charAt(0)}
                </div>
                <div style={styles.userInfo}>
                  <div style={styles.userName}>{follower.name}</div>
                  <div style={styles.userMeta}>
                    {follower.city} · Folgt dir seit {follower.followsSince}
                  </div>
                </div>
                <button
                  onClick={() => toggleFollowing(follower.id)}
                  style={styles.actionButton(follower.isFollowing)}
                  onMouseEnter={e => {
                    if (!follower.isFollowing) {
                      e.currentTarget.style.backgroundColor = '#9333ea';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!follower.isFollowing) {
                      e.currentTarget.style.backgroundColor = '#a855f7';
                    }
                  }}
                >
                  {follower.isFollowing ? 'Folgst du' : 'Folgen'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Following List */}
        {activeTab === 'following' && (
          <div style={styles.followersList}>
            {followers.filter(f => f.isFollowing).map(follower => (
              <div key={follower.id} style={styles.followerCard}>
                <div
                  style={{
                    ...styles.avatar,
                    backgroundImage: `linear-gradient(135deg, ${follower.gradientFrom}, ${follower.gradientTo})`,
                  }}
                >
                  {follower.name.charAt(0)}
                </div>
                <div style={styles.userInfo}>
                  <div style={styles.userName}>{follower.name}</div>
                  <div style={styles.userMeta}>{follower.city}</div>
                </div>
                <button
                  onClick={() => toggleFollowing(follower.id)}
                  style={styles.actionButton(follower.isFollowing)}
                  onMouseEnter={e => {
                    if (!follower.isFollowing) {
                      e.currentTarget.style.backgroundColor = '#9333ea';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!follower.isFollowing) {
                      e.currentTarget.style.backgroundColor = '#a855f7';
                    }
                  }}
                >
                  {follower.isFollowing ? 'Folgst du' : 'Folgen'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Show More Button */}
        <button
          style={{
            ...styles.showMoreButton,
            marginBottom: '2rem',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          Alle anzeigen
        </button>
      </div>
    </AppShell>
  );
}
