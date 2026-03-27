import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const colorMap = {
  blue: { glow: 'var(--blue-glow)', dim: 'var(--blue-dim)', color: 'var(--blue)' },
  emerald: { glow: 'var(--emerald-glow)', dim: 'var(--emerald-dim)', color: 'var(--emerald)' },
  rose: { glow: 'var(--rose-glow)', dim: 'var(--rose-dim)', color: 'var(--rose)' },
  amber: { glow: 'rgba(245,158,11,0.25)', dim: 'var(--amber-dim)', color: 'var(--amber)' },
  purple: { glow: 'rgba(139,92,246,0.25)', dim: 'var(--purple-dim)', color: 'var(--purple)' },
};

export default function SummaryCard({ icon: Icon, label, value, trend, trendLabel, color = 'blue', 'data-testid': testId }) {
  const c = colorMap[color] || colorMap.blue;
  const isPositive = trend >= 0;

  return (
    <div
      data-testid={testId}
      className="glass-card animate-fadeInUp"
      style={{ padding: '22px', position: 'relative', overflow: 'hidden' }}
    >
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: '-20px', right: '-20px',
        width: '100px', height: '100px',
        background: c.glow,
        borderRadius: '50%',
        filter: 'blur(30px)',
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{
          width: '42px', height: '42px',
          background: c.dim,
          borderRadius: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `1px solid ${c.color}30`,
        }}>
          <Icon size={20} color={c.color} />
        </div>

        {trend !== undefined && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '4px 10px',
            borderRadius: '100px',
            background: isPositive ? 'var(--emerald-dim)' : 'var(--rose-dim)',
            color: isPositive ? 'var(--emerald)' : 'var(--rose)',
            fontSize: '12px', fontWeight: 600,
          }}>
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div style={{ fontSize: '26px', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
        {value}
      </div>
      <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</div>
      {trendLabel && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>{trendLabel}</div>}
    </div>
  );
}
