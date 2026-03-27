import { useState, useEffect } from 'react';
import { expensesAPI, incomeAPI } from '../api/client';
import Layout from '../components/Layout';
import ChartToggle from '../components/ChartToggle';
import { Trash2, ArrowDownCircle, ArrowUpCircle, Filter } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

function formatCurrency(n) {
  return `₹${(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(5,5,5,0.95)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px', backdropFilter: 'blur(20px)' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '6px' }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '13px', alignItems: 'center' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color }} />
          <span style={{ color: 'var(--text-secondary)' }}>{p.name}:</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>₹{(p.value || 0).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

export default function Summary() {
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState([]);
  const [monthlyIncome, setMonthlyIncome] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('expenses');
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [expRes, incRes, catRes, mExpRes, mIncRes] = await Promise.all([
        expensesAPI.getAll(),
        incomeAPI.getAll(),
        expensesAPI.byCategory(),
        expensesAPI.monthly(),
        incomeAPI.monthly(),
      ]);
      setExpenses(expRes.data);
      setIncome(incRes.data);
      setCategoryData(catRes.data);

      // Merge monthly data for comparison chart
      const expMap = Object.fromEntries(mExpRes.data.map(m => [m.month, m.total]));
      const incMap = Object.fromEntries(mIncRes.data.map(m => [m.month, m.total]));
      const allMonths = [...new Set([...Object.keys(expMap), ...Object.keys(incMap)])].sort();
      const merged = allMonths.map(m => ({
        month: m.slice(5).replace('-', '/'),
        income: incMap[m] || 0,
        expenses: expMap[m] || 0,
        savings: (incMap[m] || 0) - (expMap[m] || 0),
      }));
      setMonthlyExpenses(mExpRes.data.sort((a, b) => a.month.localeCompare(b.month)));
      setMonthlyIncome(mIncRes.data.sort((a, b) => a.month.localeCompare(b.month)));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, type) => {
    setDeleteLoading(id);
    try {
      if (type === 'expense') await expensesAPI.delete(id);
      else await incomeAPI.delete(id);
      await fetchAll();
    } catch (e) {
      console.error(e);
    } finally {
      setDeleteLoading(null);
    }
  };

  const buildMergedChartData = () => {
    const expMap = Object.fromEntries(monthlyExpenses.map(m => [m.month, m.total]));
    const incMap = Object.fromEntries(monthlyIncome.map(m => [m.month, m.total]));
    const allMonths = [...new Set([...Object.keys(expMap), ...Object.keys(incMap)])].sort();
    return allMonths.map(m => ({
      month: new Date(m + '-01').toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
      income: incMap[m] || 0,
      expenses: expMap[m] || 0,
    }));
  };

  const mergedChart = buildMergedChartData();
  const activeList = activeTab === 'expenses' ? expenses : income;

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
      <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', margin: '0 0 4px' }}>Financial Summary</h1>
          <p style={{ margin: 0 }}>Full overview of your transactions and trends</p>
        </div>

        {/* Monthly Comparison Chart */}
        <div className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '20px' }}>Income vs Expenses</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={mergedChart} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Legend formatter={v => <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{v}</span>} />
              <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} name="Income" />
              <Bar dataKey="expenses" fill="#F43F5E" radius={[4, 4, 0, 0]} name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Insight + Pie Chart */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '20px', marginBottom: '20px', alignItems: 'start' }}>
          <ChartToggle data={categoryData} title="All-time Expense Categories" />
          
          <div className="glass-card" style={{ padding: '24px', height: '100%' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '20px' }}>Expense Insights</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <p style={{ fontSize: '12px', margin: '0 0 4px', color: 'var(--text-muted)' }}>AVG. MONTHLY SPENDING</p>
                <h2 style={{ fontSize: '24px', color: 'var(--rose)' }}>
                  {(() => {
                    const currentMonth = new Date().toISOString().slice(0, 7);
                    const currentMonthExpenses = expenses.filter(e => e.date.startsWith(currentMonth));
                    const avg = currentMonthExpenses.length > 0 
                      ? currentMonthExpenses.reduce((s, e) => s + e.amount, 0) / currentMonthExpenses.length 
                      : 0;
                    return formatCurrency(avg);
                  })()}
                </h2>
              </div>

              {(() => {
                const currentMonth = new Date().toISOString().slice(0, 7);
                const currentMonthExpenses = expenses.filter(e => e.date.startsWith(currentMonth));
                const currentMonthTotal = currentMonthExpenses.reduce((s, e) => s + e.amount, 0);
                
                const currentMonthCatMap = {};
                currentMonthExpenses.forEach(e => {
                  currentMonthCatMap[e.category] = (currentMonthCatMap[e.category] || 0) + e.amount;
                });
                const currentMonthCatData = Object.entries(currentMonthCatMap)
                  .map(([category, total]) => ({ category, total }))
                  .sort((a, b) => b.total - a.total);
                const highest = currentMonthCatData[0] || { category: 'N/A', total: 0 };
                const percentage = currentMonthTotal > 0 ? ((highest.total / currentMonthTotal) * 100).toFixed(1) : 0;

                return (
                  <>
                    <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--rose-dim)', border: '1px solid rgba(244,63,94,0.2)' }}>
                      <p style={{ fontSize: '11px', fontWeight: 700, margin: '0 0 8px', color: 'var(--rose)', letterSpacing: '1px' }}>⚠️ HIGHEST SPENDING SECTOR</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '18px', margin: 0 }}>{highest.category}</h3>
                        <span style={{ fontSize: '14px', fontWeight: 700 }}>{formatCurrency(highest.total)}</span>
                      </div>
                      <p style={{ fontSize: '12px', marginTop: '8px', color: 'var(--text-secondary)' }}>This category accounts for {percentage}% of your spending this month.</p>
                    </div>

                    <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--blue-dim)', border: '1px solid rgba(59,130,246,0.2)' }}>
                      <p style={{ fontSize: '11px', fontWeight: 700, margin: '0 0 8px', color: 'var(--blue)', letterSpacing: '1px' }}>TRANSACTION INTENSITY</p>
                      <h3 style={{ fontSize: '18px', margin: 0 }}>{currentMonthExpenses.length} Records</h3>
                      <p style={{ fontSize: '12px', marginTop: '4px', color: 'var(--text-secondary)' }}>
                        You have recorded {currentMonthExpenses.length} transactions in {new Date().toLocaleDateString('en-IN', { month: 'long' })}.
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Transaction List */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>Transaction History</h3>
            <div className="tab-group" style={{ width: 'auto' }}>
              <button className={`tab-pill ${activeTab === 'expenses' ? 'active' : ''}`} onClick={() => setActiveTab('expenses')} data-testid="tab-all-expenses">Expenses</button>
              <button className={`tab-pill ${activeTab === 'income' ? 'active' : ''}`} onClick={() => setActiveTab('income')} data-testid="tab-all-income">Income</button>
            </div>
          </div>

          {activeList.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: '36px' }}>📋</div>
              <p>No {activeTab} recorded yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {activeList.map((txn, i) => (
                <div
                  key={txn.id}
                  data-testid={`summary-txn-${i}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '12px 14px', borderRadius: 'var(--radius-sm)',
                    transition: 'var(--transition)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    width: '36px', height: '36px', flexShrink: 0,
                    background: activeTab === 'income' ? 'var(--emerald-dim)' : 'var(--rose-dim)',
                    borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {activeTab === 'income'
                      ? <ArrowUpCircle size={16} color="var(--emerald)" />
                      : <ArrowDownCircle size={16} color="var(--rose)" />
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{txn.description}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {activeTab === 'expense' ? txn.category : txn.income_type} · {txn.date}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: activeTab === 'income' ? 'var(--emerald)' : 'var(--rose)', flexShrink: 0 }}>
                    {activeTab === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                  </div>
                  <button
                    onClick={() => handleDelete(txn.id, activeTab === 'expenses' ? 'expense' : 'income')}
                    disabled={deleteLoading === txn.id}
                    data-testid={`btn-delete-${i}`}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted)', padding: '6px', borderRadius: '6px',
                      transition: 'var(--transition)',
                      display: 'flex', alignItems: 'center',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--rose)'; e.currentTarget.style.background = 'var(--rose-dim)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none'; }}
                  >
                    {deleteLoading === txn.id ? <div className="spinner" style={{ width: '14px', height: '14px' }} /> : <Trash2 size={15} />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
