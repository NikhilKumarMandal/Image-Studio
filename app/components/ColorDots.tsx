'use client';

const COLORS = [
  '#ef4444','#f97316','#eab308','#22c55e',
  '#06b6d4','#3b82f6','#8b5cf6','#ec4899',
  '#f43f5e','#000000','#6b7280','#ffffff',
];

interface Props {
  value: string;
  onChange: (c: string) => void;
  label?: string;
}

export default function ColorDots({ value, onChange, label }: Props) {
  return (
    <div>
      {label && (
        <p style={{ fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', fontWeight:600, marginBottom:10 }}>{label}</p>
      )}
      <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
        {COLORS.map(c => (
          <button key={c} onClick={() => onChange(c)}
            style={{
              width:28, height:28, borderRadius:'50%', background:c, border:'none',
              cursor:'pointer', padding:0, outline:'none',
              boxShadow: value === c ? `0 0 0 2px var(--bg-surface), 0 0 0 4px ${c}` : 'none',
              transform: value === c ? 'scale(1.15)' : 'scale(1)',
              transition:'all 0.15s',
            }} />
        ))}
        {/* Current selected if custom */}
        {!COLORS.includes(value) && (
          <button onClick={() => {}}
            style={{ width:28, height:28, borderRadius:'50%', background:value, border:'none', cursor:'pointer', padding:0, boxShadow:`0 0 0 2px var(--bg-surface), 0 0 0 4px ${value}`, transform:'scale(1.15)' }} />
        )}
        {/* Custom picker */}
        <label style={{ width:28, height:28, borderRadius:'50%', overflow:'hidden', cursor:'pointer', background:'conic-gradient(red 0deg, yellow 60deg, lime 120deg, cyan 180deg, blue 240deg, magenta 300deg, red 360deg)', flexShrink:0 }}>
          <input type="color" value={value} onChange={e => onChange(e.target.value)} style={{ opacity:0, width:1, height:1, position:'absolute' }} />
        </label>
      </div>
    </div>
  );
}
