import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { expensesAPI, incomeAPI } from '../api/client';
import SummaryCard from '../components/SummaryCard';
import ChartToggle from '../components/ChartToggle';
import AIWidget from '../components/AIWidget';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import {
  Wallet, TrendingDown, TrendingUp, PiggyBank,
  ArrowUpCircle, ArrowDownCircle, PlusCircle, Clock
} from 'lucide-react';

const CATEGORY_COLORS = {
  'Food & Dining': '#F59E0B', 'Transportation': '#3B82F6', 'Housing': '#8B5CF6',
  'Entertainment': '#EC4899', 'Healthcare': '#10B981', 'Shopping': '#F43F5E',
  'Education': '#06B6D4', 'Utilities': '#84CC16', 'Travel': '#FB923C',
  'Personal Care': '#A78BFA', 'Subscriptions': '#34D399', 'Other': '#6B7280'
};

function formatCurrency(n) {
  return `₹${(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

function getMonthLabel(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function Dashboard() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentMonth = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [expRes, incRes, catRes] = await Promise.all([
          expensesAPI.getAll({ month: currentMonth }),
          incomeAPI.getAll({ month: currentMonth }),
          expensesAPI.byCategory({ month: currentMonth }),
        ]);
        setExpenses(expRes.data);
        setIncome(incRes.data);
        setCategoryData(catRes.data.map(d => ({ ...d, category: d.category })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalIncome = income.reduce((s, i) => s + i.amount, 0);
  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : '0.0';

  const recentTransactions = [
    ...expenses.map(e => ({ ...e, type: 'expense' })),
    ...income.map(i => ({ ...i, type: 'income' }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

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
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', margin: '0 0 4px' }}>Good day, {user?.name?.split(' ')[0]} 👋</h1>
            <p style={{ margin: 0, fontSize: '14px' }}>
              Here's your financial overview for{' '}
              <strong style={{ color: 'var(--blue)' }}>
                {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </strong>
            </p>
          </div>
          <Link to="/add" className="btn btn-primary" data-testid="btn-add-transaction" style={{ textDecoration: 'none' }}>
            <PlusCircle size={16} /> Add Transaction
          </Link>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          <SummaryCard icon={Wallet} label="Monthly Balance" value={formatCurrency(balance)} color={balance >= 0 ? 'emerald' : 'rose'} data-testid="card-balance" />
          <SummaryCard icon={TrendingUp} label="Total Income" value={formatCurrency(totalIncome)} color="blue" data-testid="card-income" />
          <SummaryCard icon={TrendingDown} label="Total Expenses" value={formatCurrency(totalExpenses)} color="rose" data-testid="card-expenses" />
          <SummaryCard icon={PiggyBank} label="Savings Rate" value={`${savingsRate}%`} color="amber" data-testid="card-savings" />
        </div>

        {/* Charts + AI Tips Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', marginBottom: '24px', alignItems: 'start' }}>
          <ChartToggle data={categoryData} title="Expenses by Category" />
          <AIWidget />
        </div>

        {/* Recent Transactions */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={18} color="var(--text-muted)" />
              <h3 style={{ margin: 0, fontSize: '16px' }}>Recent Transactions</h3>
            </div>
            <Link to="/summary" style={{ fontSize: '13px', color: 'var(--blue)', fontWeight: 600, textDecoration: 'none' }}>View All →</Link>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: '40px' }}>💸</div>
              <p>No transactions this month</p>
              <Link to="/add" className="btn btn-primary" style={{ marginTop: '8px', textDecoration: 'none' }}>
                <PlusCircle size={14} /> Add First Transaction
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {recentTransactions.map((txn, i) => (
                <div
                  key={txn.id || i}
                  data-testid={`transaction-item-${i}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'var(--transition)',
                    cursor: 'default',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    width: '38px', height: '38px', flexShrink: 0,
                    background: txn.type === 'income' ? 'var(--emerald-dim)' : 'var(--rose-dim)',
                    borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {txn.type === 'income'
                      ? <ArrowUpCircle size={18} color="var(--emerald)" />
                      : <ArrowDownCircle size={18} color="var(--rose)" />
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {txn.description}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {txn.type === 'expense' ? txn.category : txn.income_type} · {getMonthLabel(txn.date)}
                    </div>
                  </div>
                  <div style={{
                    fontWeight: 700, fontSize: '15px',
                    color: txn.type === 'income' ? 'var(--emerald)' : 'var(--rose)',
                    flexShrink: 0,
                  }}>
                    {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
