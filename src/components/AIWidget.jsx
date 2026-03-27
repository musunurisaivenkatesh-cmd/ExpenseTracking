import { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, ChevronRight } from 'lucide-react';
import { aiAPI } from '../api/client';
import { Link } from 'react-router-dom';

export default function AIWidget() {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTips = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await aiAPI.getTips({ include_financial_context: true });
      setTips(res.data.tips?.slice(0, 3) || []);
    } catch (e) {
      setError('Could not load AI tips');
      setTips([
        'Track your daily expenses to identify patterns.',
        'Aim to save at least 20% of your monthly income.',
        'Review subscriptions monthly to cut unused ones.',
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTips(); }, []);

  return (
    <div className="glass-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
      {/* Glow */}
      <div style={{
        position: 'absolute', top: '-30px', right: '-30px',
        width: '150px', height: '150px',
        background: 'radial-gradient(circle, rgba(139,92,246,0.15), transparent)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px',
            background: 'var(--purple-dim)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={16} color="var(--purple)" />
          </div>
          <div>
            <h3 style={{ fontSize: '14px', margin: 0 }}>AI Financial Tips</h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>Personalized for you</p>
          </div>
        </div>
        <button
          onClick={fetchTips}
          disabled={loading}
          data-testid="btn-refresh-tips"
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', padding: '6px', borderRadius: '8px',
            transition: 'var(--transition)',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--purple)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <RefreshCw size={15} style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }} />
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              height: '52px', borderRadius: '8px',
              background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
            }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {tips.map((tip, i) => (
            <div
              key={i}
              style={{
                padding: '12px 14px',
                background: 'var(--purple-dim)',
                borderRadius: '10px',
                border: '1px solid rgba(139,92,246,0.15)',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                animation: `fadeInUp 0.3s ease ${i * 0.1}s both`,
              }}
            >
              <span style={{ color: 'var(--purple)', marginRight: '8px', fontWeight: 700 }}>{i + 1}.</span>
              {tip}
            </div>
          ))}
        </div>
      )}

      <Link
        to="/ai-tips"
        data-testid="link-ai-tips"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          marginTop: '16px', padding: '10px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid rgba(139,92,246,0.2)',
          background: 'var(--purple-dim)',
          color: 'var(--purple)',
          fontSize: '13px', fontWeight: 600,
          transition: 'var(--transition)',
          textDecoration: 'none',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.2)'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--purple-dim)'}
      >
        Open AI Chat <ChevronRight size={14} />
      </Link>
    </div>
  );
}
