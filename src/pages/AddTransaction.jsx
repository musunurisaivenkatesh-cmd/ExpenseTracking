import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { expensesAPI, incomeAPI } from '../api/client';
import Layout from '../components/Layout';
import { PlusCircle, IndianRupee, Tag, Calendar, FileText, CheckCircle } from 'lucide-react';

const EXPENSE_CATEGORIES = [
  'Food & Dining','Transportation','Housing','Entertainment',
  'Healthcare','Shopping','Education','Utilities',
  'Travel','Personal Care','Subscriptions','Other'
];
const INCOME_TYPES = ['Fixed Salary','Freelance','Business','Investment','Rental','Gift','Other'];

export default function AddTransaction() {
  const [tab, setTab] = useState('expense');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0];

  const [expenseForm, setExpenseForm] = useState({
    amount: '', category: 'Food & Dining', description: '', date: today, is_recurring: false
  });
  const [incomeForm, setIncomeForm] = useState({
    amount: '', income_type: 'Fixed Salary', description: '', date: today, is_monthly: true
  });

  const handleExpenseChange = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setExpenseForm(p => ({ ...p, [field]: val }));
  };
  const handleIncomeChange = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setIncomeForm(p => ({ ...p, [field]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'expense') {
        await expensesAPI.create({ ...expenseForm, amount: parseFloat(expenseForm.amount) });
      } else {
        await incomeAPI.create({ ...incomeForm, amount: parseFloat(incomeForm.amount) });
      }
      setSuccess(true);
      setTimeout(() => navigate('/'), 1800);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Layout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
          <div className="glass-card animate-fadeInUp" style={{ padding: '48px', textAlign: 'center', maxWidth: '380px' }}>
            <div style={{
              width: '72px', height: '72px', margin: '0 auto 20px',
              background: 'var(--emerald-dim)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 30px var(--emerald-glow)',
            }}>
              <CheckCircle size={36} color="var(--emerald)" />
            </div>
            <h2 style={{ margin: '0 0 8px' }}>Transaction Saved!</h2>
            <p>Redirecting to dashboard...</p>
            <div className="spinner" style={{ margin: '20px auto 0', width: '24px', height: '24px' }} />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', margin: '0 0 4px' }}>Add Transaction</h1>
          <p style={{ margin: 0 }}>Record a new expense or income</p>
        </div>

        {/* Tab Toggle */}
        <div className="tab-group" style={{ marginBottom: '24px', width: '100%' }}>
          <button className={`tab-pill ${tab === 'expense' ? 'active' : ''}`} onClick={() => setTab('expense')} data-testid="tab-expense">Expense</button>
          <button className={`tab-pill ${tab === 'income' ? 'active' : ''}`} onClick={() => setTab('income')} data-testid="tab-income">Income</button>
        </div>

        <div className="glass-card" style={{ padding: '32px' }}>
          {error && (
            <div style={{ marginBottom: '20px', padding: '12px 16px', background: 'var(--rose-dim)', border: '1px solid rgba(244,63,94,0.25)', borderRadius: 'var(--radius-sm)', color: 'var(--rose)', fontSize: '13px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Amount */}
            <div className="input-group">
              <label className="input-label">Amount (₹)</label>
              <div style={{ position: 'relative' }}>
                <IndianRupee size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  className="input-field"
                  placeholder="0.00"
                  value={tab === 'expense' ? expenseForm.amount : incomeForm.amount}
                  onChange={tab === 'expense' ? handleExpenseChange('amount') : handleIncomeChange('amount')}
                  required
                  data-testid="input-amount"
                  style={{ paddingLeft: '40px', fontSize: '18px', fontWeight: 600 }}
                />
              </div>
            </div>

            {/* Category / Type */}
            {tab === 'expense' ? (
              <div className="input-group">
                <label className="input-label">Category</label>
                <div style={{ position: 'relative' }}>
                  <Tag size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                  <select
                    className="input-field"
                    value={expenseForm.category}
                    onChange={handleExpenseChange('category')}
                    data-testid="select-category"
                    style={{ paddingLeft: '40px', cursor: 'pointer' }}
                  >
                    {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            ) : (
              <div className="input-group">
                <label className="input-label">Income Type</label>
                <div style={{ position: 'relative' }}>
                  <Tag size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                  <select
                    className="input-field"
                    value={incomeForm.income_type}
                    onChange={handleIncomeChange('income_type')}
                    data-testid="select-income-type"
                    style={{ paddingLeft: '40px', cursor: 'pointer' }}
                  >
                    {INCOME_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="input-group">
              <label className="input-label">Description</label>
              <div style={{ position: 'relative' }}>
                <FileText size={16} style={{ position: 'absolute', left: '14px', top: '16px', color: 'var(--text-muted)' }} />
                <textarea
                  className="input-field"
                  placeholder={tab === 'expense' ? 'e.g., Lunch at restaurant' : 'e.g., Monthly salary'}
                  value={tab === 'expense' ? expenseForm.description : incomeForm.description}
                  onChange={tab === 'expense' ? handleExpenseChange('description') : handleIncomeChange('description')}
                  required
                  data-testid="input-description"
                  rows={2}
                  style={{ paddingLeft: '40px', resize: 'vertical' }}
                />
              </div>
            </div>

            {/* Date */}
            <div className="input-group">
              <label className="input-label">Date</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="date"
                  className="input-field"
                  value={tab === 'expense' ? expenseForm.date : incomeForm.date}
                  onChange={tab === 'expense' ? handleExpenseChange('date') : handleIncomeChange('date')}
                  required
                  data-testid="input-date"
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            {/* Toggle options */}
            {tab === 'expense' ? (
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={expenseForm.is_recurring}
                  onChange={handleExpenseChange('is_recurring')}
                  data-testid="checkbox-recurring"
                  style={{ width: '16px', height: '16px', accentColor: 'var(--blue)', cursor: 'pointer' }}
                />
                Mark as recurring expense
              </label>
            ) : (
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={incomeForm.is_monthly}
                  onChange={handleIncomeChange('is_monthly')}
                  data-testid="checkbox-monthly"
                  style={{ width: '16px', height: '16px', accentColor: 'var(--blue)', cursor: 'pointer' }}
                />
                Monthly recurring income
              </label>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => navigate('/')}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`btn ${tab === 'expense' ? 'btn-primary' : 'btn-success'}`}
                disabled={loading}
                data-testid="btn-submit"
                style={{ flex: 2, justifyContent: 'center' }}
              >
                {loading ? <><div className="spinner" style={{ width: '16px', height: '16px' }} /> Saving...</> : <><PlusCircle size={16} /> Add {tab === 'expense' ? 'Expense' : 'Income'}</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
