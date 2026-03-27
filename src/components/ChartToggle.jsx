import { useState } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#3B82F6','#10B981','#F43F5E','#F59E0B','#8B5CF6','#06B6D4','#EC4899','#84CC16'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(5,5,5,0.95)',
      border: '1px solid var(--border)',
      borderRadius: '10px',
      padding: '12px 16px',
      backdropFilter: 'blur(20px)',
    }}>
      {label && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color || p.fill }} />
          <span style={{ color: 'var(--text-secondary)' }}>{p.name || p.dataKey}:</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            ₹{(p.value || 0).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function ChartToggle({ data = [], title = 'Overview' }) {
  const [chartType, setChartType] = useState('pie');

  // Find the top category to highlight it visually
  const sortedData = [...data].sort((a,b) => b.total - a.total);
  const topCategory = sortedData[0]?.category;

  if (!data.length) {
    return (
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', margin: 0 }}>{title}</h3>
        </div>
        <div className="empty-state" style={{ padding: '40px' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
          <p>No data to display yet</p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Add some transactions to see your chart</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h3 style={{ fontSize: '16px', margin: 0 }}>{title}</h3>
        <div className="tab-group" style={{ width: 'auto' }}>
          <button className={`tab-pill ${chartType === 'pie' ? 'active' : ''}`} onClick={() => setChartType('pie')} data-testid="chart-toggle-pie">Pie</button>
          <button className={`tab-pill ${chartType === 'bar' ? 'active' : ''}`} onClick={() => setChartType('bar')} data-testid="chart-toggle-bar">Bar</button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        {chartType === 'pie' ? (
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="category"
              cx="50%" cy="50%"
              outerRadius={110}
              innerRadius={55}
              labelLine={false}
              label={CustomPieLabel}
            >
              {data.map((entry, i) => (
                <Cell 
                  key={i} 
                  fill={COLORS[i % COLORS.length]} 
                  stroke={entry.category === topCategory ? 'white' : 'none'}
                  strokeWidth={entry.category === topCategory ? 2 : 0}
                  style={{
                    filter: entry.category === topCategory ? 'drop-shadow(0 0 8px rgba(255,255,255,0.3))' : 'none',
                    outline: 'none'
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{value}</span>}
            />
          </PieChart>
        ) : (
          <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="category" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="total" radius={[6, 6, 0, 0]}>
              {data.map((entry, i) => (
                <Cell 
                  key={i} 
                  fill={COLORS[i % COLORS.length]} 
                  fillOpacity={entry.category === topCategory ? 1 : 0.6}
                  stroke={entry.category === topCategory ? 'white' : 'none'}
                  strokeWidth={entry.category === topCategory ? 1 : 0}
                />
              ))}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
