import { useState, useEffect } from 'react';
import { incomeAPI, expensesAPI } from '../api/client';
import Layout from '../components/Layout';
import SummaryCard from '../components/SummaryCard';
import { IndianRupee, PlusCircle, TrendingUp, Calendar, CheckCircle, AlertCircle, Award, Tag, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CHART_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#F43F5E', '#8B5CF6', '#06B6D4'];
const EXPENSE_CATEGORIES = [
  'Food & Dining','Transportation','Housing','Entertainment',
  'Healthcare','Shopping','Education','Utilities',
  'Travel','Personal Care','Subscriptions','Other'
];

function formatCurrency(n) {
  return `₹${(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(5,5,5,0.95)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px', backdropFilter: 'blur(20px)' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '6px' }}>{label}</p>
      <div style={{ display: 'flex', gap: '8px', fontSize: '13px', alignItems: 'center' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: payload[0].color }} />
        <span style={{ color: 'var(--text-secondary)' }}>Total Income:</span>
        <span style={{ color: 'var(--emerald)', fontWeight: 600 }}>₹{(payload[0].value || 0).toLocaleString()}</span>
      </div>
    </div>
  );
};

export default function IncomeTracker() {
  const [monthlyData, setMonthlyData] = useState([]);
  const [allIncome, setAllIncome] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick Add Form
  const [amount, setAmount] = useState('');
  const [monthStr, setMonthStr] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [addLoading, setAddLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  // YoY Comparison State
  const [compareMonth, setCompareMonth] = useState(new Date().toISOString().slice(0, 7));
  const [compareCat, setCompareCat] = useState('Food & Dining');
  const [comparisonResults, setComparisonResults] = useState(null);

  useEffect(() => { 
    fetchIncome(); 
    handleComparison();
  }, [compareMonth, compareCat]);

  const fetchIncome = async () => {
    setLoading(true);
    try {
      const [mRes, allRes] = await Promise.all([
        incomeAPI.monthly(),
        incomeAPI.getAll()
      ]);
      const formatted = mRes.data.map(d => ({
        rawMonth: d.month,
        monthLabel: new Date(d.month + '-01').toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
        total: d.total,
        count: d.count
      })).sort((a,b) => a.rawMonth.localeCompare(b.rawMonth));
      setMonthlyData(formatted);
      setAllIncome(allRes.data);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setAddLoading(true); setMsg(null);
    try {
      await incomeAPI.create({
        amount: parseFloat(amount),
        income_type: 'Other', // General monthly
        description: 'Monthly Income Update',
        date: monthStr + '-01',
        is_monthly: false
      });
      setMsg({ type: 'success', text: 'Income added successfully!' });
      setAmount('');
      await fetchIncome();
    } catch (e) {
      setMsg({ type: 'error', text: 'Failed to add income.' });
    } finally {
      setAddLoading(false);
      setTimeout(() => setMsg(null), 3000);
    }
  };

  const handleComparison = async () => {
    try {
      const date = new Date(compareMonth + '-01');
      const prevDate = new Date(date);
      prevDate.setMonth(date.getMonth() - 1);
      const prevMonthStr = prevDate.toISOString().slice(0, 7);

      const [currRes, prevRes] = await Promise.all([
        expensesAPI.getAll({ month: compareMonth }),
        expensesAPI.getAll({ month: prevMonthStr })
      ]);

      const currTotal = currRes.data
        .filter(e => e.category === compareCat)
        .reduce((sum, e) => sum + e.amount, 0);

      const prevTotal = prevRes.data
        .filter(e => e.category === compareCat)
        .reduce((sum, e) => sum + e.amount, 0);

      setComparisonResults({
        current: currTotal,
        previous: prevTotal,
        diff: currTotal - prevTotal,
        percent: prevTotal > 0 ? ((currTotal - prevTotal) / prevTotal * 100).toFixed(1) : (currTotal > 0 ? '100+' : '0'),
        prevMonthName: prevDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const totalAllTime = monthlyData.reduce((acc, curr) => acc + curr.total, 0);
  
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthIncome = allIncome.filter(i => i.date.startsWith(currentMonth));
  const avgMonthly = currentMonthIncome.length > 0 
    ? currentMonthIncome.reduce((s, i) => s + i.amount, 0) / currentMonthIncome.length 
    : 0;

  const bestMonthObj = [...monthlyData].sort((a,b) => b.total - a.total)[0];
  const bestMonthVal = bestMonthObj ? bestMonthObj.total : 0;

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div className="spinner" style={{ width: '40px', height: '40px' }} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', margin: '0 0 4px' }}>Monthly Income Tracker</h1>
          <p style={{ margin: 0 }}>Track your historical income and monthly average</p>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          <SummaryCard icon={IndianRupee} label="Average Monthly Income" value={formatCurrency(avgMonthly)} color="blue" />
          <SummaryCard icon={TrendingUp} label="Total Earned (All Time)" value={formatCurrency(totalAllTime)} color="emerald" />
          <SummaryCard icon={Award} label="Best Month" value={formatCurrency(bestMonthVal)} color="amber" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}>
          
          {/* Chart */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '20px' }}>Historical Income</h3>
            {monthlyData.length === 0 ? (
               <div className="empty-state">
                 <div style={{ fontSize: '36px' }}>📊</div>
                 <p>No income recorded yet.</p>
               </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="monthLabel" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                    {monthlyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Quick Add Form */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <PlusCircle size={18} color="var(--emerald)" />
              <h3 style={{ margin: 0, fontSize: '16px' }}>Quick Add Income</h3>
            </div>
            
            {msg && (
              <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: msg.type === 'success' ? 'var(--emerald-dim)' : 'var(--rose-dim)', color: msg.type === 'success' ? 'var(--emerald)' : 'var(--rose)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {msg.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                {msg.text}
              </div>
            )}

            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="input-group">
                <label className="input-label">Amount (₹)</label>
                <div style={{ position: 'relative' }}>
                  <IndianRupee size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="number" min="0.01" step="0.01" required
                    className="input-field" placeholder="0.00"
                    value={amount} onChange={e => setAmount(e.target.value)}
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Month</label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="month" required
                    className="input-field"
                    value={monthStr} onChange={e => setMonthStr(e.target.value)}
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-success" disabled={addLoading} style={{ justifyContent: 'center', marginTop: '4px' }}>
                {addLoading ? <><div className="spinner" style={{ width: '14px', height: '14px' }} /> Saving...</> : 'Add Monthly Income'}
              </button>
            </form>
          </div>

        </div>

        {/* YoY Comparison Section */}
        <div className="glass-card" style={{ padding: '24px', marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <TrendingUp size={18} color="var(--purple)" />
              <h3 style={{ margin: 0, fontSize: '18px' }}>Month-over-Month Expense Comparison</h3>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: '160px' }}>
                <Calendar size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="month" 
                  className="input-field" 
                  value={compareMonth} 
                  onChange={e => setCompareMonth(e.target.value)}
                  style={{ padding: '8px 8px 8px 34px', fontSize: '13px' }}
                />
              </div>
              <div style={{ position: 'relative', width: '180px' }}>
                <Tag size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                <select 
                  className="input-field" 
                  value={compareCat} 
                  onChange={e => setCompareCat(e.target.value)}
                  style={{ padding: '8px 8px 8px 34px', fontSize: '13px', cursor: 'pointer' }}
                >
                  {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          {comparisonResults && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div style={{ padding: '20px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                <p style={{ margin: '0 0 8px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>{new Date(compareMonth + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
                <h2 style={{ margin: 0, fontSize: '24px' }}>{formatCurrency(comparisonResults.current)}</h2>
              </div>

              <div style={{ padding: '20px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                <p style={{ margin: '0 0 8px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>{comparisonResults.prevMonthName}</p>
                <h2 style={{ margin: 0, fontSize: '24px', opacity: 0.8 }}>{formatCurrency(comparisonResults.previous)}</h2>
              </div>

              <div style={{ 
                padding: '20px', borderRadius: '14px', 
                background: comparisonResults.diff > 0 ? 'var(--rose-dim)' : (comparisonResults.diff < 0 ? 'var(--emerald-dim)' : 'rgba(255,255,255,0.03)'),
                border: comparisonResults.diff > 0 ? '1px solid rgba(244,63,94,0.2)' : (comparisonResults.diff < 0 ? '1px solid rgba(16,185,129,0.2)' : '1px solid var(--border)')
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>MONTHLY DIFFERENCE</p>
                  <div style={{ 
                    padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800,
                    background: comparisonResults.diff > 0 ? 'var(--rose)' : (comparisonResults.diff < 0 ? 'var(--emerald)' : 'var(--text-muted)'),
                    color: '#fff'
                  }}>
                    {comparisonResults.diff > 0 ? '+' : ''}{comparisonResults.percent}%
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ margin: 0, fontSize: '24px', color: comparisonResults.diff > 0 ? 'var(--rose)' : (comparisonResults.diff < 0 ? 'var(--emerald)' : 'inherit') }}>
                    {formatCurrency(Math.abs(comparisonResults.diff))}
                  </h2>
                  {comparisonResults.diff > 0 ? <ArrowUpRight size={24} color="var(--rose)" /> : (comparisonResults.diff < 0 ? <ArrowDownRight size={24} color="var(--emerald)" /> : <Minus size={20} />)}
                </div>
                <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {comparisonResults.diff > 0 
                    ? `You spent ${formatCurrency(comparisonResults.diff)} more than last month.` 
                    : (comparisonResults.diff < 0 
                      ? `Great! You saved ${formatCurrency(Math.abs(comparisonResults.diff))} compared to last month.`
                      : 'Spending is identical to last month.')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
