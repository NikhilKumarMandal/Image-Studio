'use client';
import { useState } from 'react';
import { AppState, TweetCard, TweetTheme } from '../types';
import { parseTweetUrl } from '../socialRenderer';
import Slider from './Slider';

interface Props { state: AppState; onChange: (p: Partial<AppState>) => void; }

const THEMES: { id: TweetTheme; label: string }[] = [
  { id: 'dark',  label: '🌑 Dark'  },
  { id: 'dim',   label: '🌘 Dim'   },
  { id: 'light', label: '☀️ Light' },
];

const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function SocialCardPanel({ state, onChange }: Props) {
  const [theme,    setTheme]    = useState<TweetTheme>('dark');
  const [urlInput, setUrlInput] = useState('');
  const [fetching, setFetching] = useState(false);
  const [fetchErr, setFetchErr] = useState('');

  const card = state.tweetCard;

  function patchCard(p: Partial<TweetCard>) {
    if (card) onChange({ tweetCard: { ...card, ...p } });
  }

  function removeCard() { onChange({ tweetCard: null }); }

  // ── Chip style ──────────────────────────────────────────────────
  const chip = (active: boolean): React.CSSProperties => ({
    padding: '6px 8px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
    fontFamily: 'DM Sans,sans-serif', transition: 'all 0.12s',
    textAlign: 'center' as const,
    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
    background: active ? 'var(--accent-dim)' : 'var(--bg-elevated)',
    color: active ? 'var(--accent)' : 'var(--text-secondary)',
    fontWeight: active ? 600 : 400,
    flex: 1,
  });

  const inp: React.CSSProperties = { width: '100%', padding: '8px 10px', fontSize: 12 };
  const lbl: React.CSSProperties = { fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 };

  // ── Fetch tweet from fxtwitter ──────────────────────────────────
  async function fetchTweet() {
    const id = parseTweetUrl(urlInput);
    if (!id) { setFetchErr('Enter a valid X/Twitter URL or numeric tweet ID.'); return; }

    setFetching(true); setFetchErr('');
    try {
      const res = await fetch(`https://api.fxtwitter.com/status/${id}`, {
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      const t = data?.tweet;
      if (!t) throw new Error('No tweet data returned');

      // Build avatar URL - fxtwitter returns profile_image_url
      const rawAvatar = t.author?.avatar_url || t.author?.profile_image_url || '';
      const avatarUrl = rawAvatar ? rawAvatar.replace('_normal', '_200x200') : '';

      const newCard: TweetCard = {
        id,
        theme,
        avatarUrl,
        authorName:   t.author?.name        || 'Unknown',
        authorHandle: t.author?.screen_name || 'unknown',
        verified:     t.author?.verified    ?? false,
        content:      t.text                || '',
        date: t.created_at
          ? new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : today,
        likes:   t.likes     ?? 0,
        reposts: t.retweets  ?? 0,
        replies: t.replies   ?? 0,
        x: 0.5, y: 0.5, scale: 0.9,
      };
      onChange({ tweetCard: newCard });
    } catch (e: any) {
      setFetchErr(`Fetch failed: ${e.message}. Use "Add blank card" below to fill manually.`);
    } finally {
      setFetching(false);
    }
  }

  // ── Add blank card ──────────────────────────────────────────────
  function addBlank() {
    onChange({
      tweetCard: {
        id: Date.now().toString(), theme,
        authorName: 'Your Name', authorHandle: 'yourhandle',
        verified: false,
        content: 'Paste your tweet content here.\nEdit everything in the panel below.',
        date: today, likes: 0, reposts: 0, replies: 0,
        x: 0.5, y: 0.5, scale: 0.9,
      }
    });
  }

  // ══════════════════════════════════════════════════════════════
  // EDITING EXISTING CARD
  // ══════════════════════════════════════════════════════════════
  if (card) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 14px' }}>

      {/* Card badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 11px', background: 'rgba(29,155,240,0.08)', border: '1px solid rgba(29,155,240,0.22)', borderRadius: 8 }}>
        <div style={{ width: 30, height: 30, borderRadius: 7, background: '#1d9bf0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 14, lineHeight: 1 }}>X</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.authorName}</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>@{card.authorHandle}</p>
        </div>
        <button onClick={removeCard}
          style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 18, padding: 0, lineHeight: 1, flexShrink: 0 }}>✕</button>
      </div>

      {/* Tweet content */}
      <div>
        <label style={lbl}>Tweet content</label>
        <textarea value={card.content} onChange={e => patchCard({ content: e.target.value })} rows={5}
          style={{ ...inp, resize: 'vertical', lineHeight: 1.65, fontSize: 13 }} />
      </div>

      {/* Author name + handle */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div>
          <label style={lbl}>Name</label>
          <input type="text" value={card.authorName} onChange={e => patchCard({ authorName: e.target.value })} style={inp} />
        </div>
        <div>
          <label style={lbl}>Handle</label>
          <input type="text" value={card.authorHandle} onChange={e => patchCard({ authorHandle: e.target.value })} style={inp} />
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
        {([['Likes','likes'],['Reposts','reposts'],['Replies','replies']] as [string, keyof TweetCard][]).map(([l, k]) => (
          <div key={k}>
            <label style={lbl}>{l}</label>
            <input type="number" min={0} value={(card as any)[k] ?? 0}
              onChange={e => patchCard({ [k]: Number(e.target.value) } as any)}
              style={{ ...inp, fontFamily: 'DM Mono,monospace' }} />
          </div>
        ))}
      </div>

      {/* Date + verified */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, alignItems: 'end' }}>
        <div>
          <label style={lbl}>Date</label>
          <input type="text" value={card.date} onChange={e => patchCard({ date: e.target.value })} style={inp} />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12, color: 'var(--text-secondary)', paddingBottom: 8, whiteSpace: 'nowrap' }}>
          <input type="checkbox" checked={card.verified} onChange={e => patchCard({ verified: e.target.checked })} />
          Verified ✓
        </label>
      </div>

      {/* Theme */}
      <div>
        <label style={{ ...lbl, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, fontSize: 10 }}>Theme</label>
        <div style={{ display: 'flex', gap: 5 }}>
          {THEMES.map(t => <button key={t.id} onClick={() => patchCard({ theme: t.id })} style={{ ...chip(card.theme === t.id), fontSize: 10 }}>{t.label}</button>)}
        </div>
      </div>

      {/* Position & size */}
      <div>
        <label style={{ ...lbl, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, fontSize: 10 }}>Position & Size</label>
        <Slider label="Scale" value={Math.round(card.scale * 100)} min={40} max={150} unit="%" onChange={v => patchCard({ scale: v / 100 })} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6 }}>
          <div>
            <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>X — {Math.round(card.x * 100)}%</label>
            <input type="range" min={0.05} max={0.95} step={0.01} value={card.x} onChange={e => patchCard({ x: +e.target.value })} style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Y — {Math.round(card.y * 100)}%</label>
            <input type="range" min={0.05} max={0.95} step={0.01} value={card.y} onChange={e => patchCard({ y: +e.target.value })} style={{ width: '100%' }} />
          </div>
        </div>
      </div>

      <button onClick={removeCard}
        style={{ width: '100%', padding: '8px', borderRadius: 7, border: '1px solid var(--danger)', background: 'transparent', color: 'var(--danger)', fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', marginTop: 2 }}>
        🗑 Remove Tweet Card
      </button>
    </div>
  );

  // ══════════════════════════════════════════════════════════════
  // CREATE NEW CARD
  // ══════════════════════════════════════════════════════════════
  return (
    <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Fetch from URL */}
      <div
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <p
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "var(--text-primary)",
              margin: 0,
            }}
          >
            Fetch from X / Twitter
          </p>
        </div>



        {/* Input Row */}
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          <input
            type="text"
            value={urlInput}
            onChange={(e) => {
              setUrlInput(e.target.value);
              setFetchErr("");
            }}
            onKeyDown={(e) => e.key === "Enter" && fetchTweet()}
            placeholder="https://x.com/user/status/... or Tweet ID"
            style={{
              flex: 1,
              padding: "10px 12px",
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--bg)",
              color: "var(--text-primary)",
              fontFamily: "DM Mono, monospace",
              outline: "none",
            }}
          />

          <button
            onClick={fetchTweet}
            disabled={fetching}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              border: "none",
              background: "#1d9bf0",
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
              cursor: fetching ? "wait" : "pointer",
              opacity: fetching ? 0.65 : 1,
              transition: "all 0.15s ease",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            {fetching ? "Fetching..." : "Fetch"}
          </button>
        </div>

        {/* Error */}
        {fetchErr && (
          <div
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: 8,
              padding: "10px 12px",
            }}
          >
            <p
              style={{
                fontSize: 12,
                color: "#f87171",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              ⚠ {fetchErr}
            </p>
          </div>
        )}
      </div>

  
    </div>
  );
}
