import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, TrendingUp, Mail, Lock, User } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError("Passwords don't match."); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputRow = (label, field, type, placeholder, icon, extra = {}) => (
    <div className="input-group">
      <label className="input-label">{label}</label>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>{icon}</div>
        <input
          type={type}
          className="input-field"
          placeholder={placeholder}
          value={form[field]}
          onChange={handleChange(field)}
          required
          data-testid={`input-${field}`}
          style={{ paddingLeft: '40px', ...extra }}
        />
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', background: 'var(--bg-base)', position: 'relative',
    }}>
      <div className="bg-mesh" />
      <div style={{ position: 'absolute', top: '24px', right: '32px', zIndex: 100 }}>
        <ThemeToggle />
      </div>
      <div style={{ position: 'fixed', top: '15%', right: '10%', width: '280px', height: '280px', background: 'radial-gradient(circle, rgba(16,185,129,0.1), transparent)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '15%', left: '10%', width: '260px', height: '260px', background: 'radial-gradient(circle, rgba(59,130,246,0.1), transparent)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }} />

      <div className="glass-card animate-fadeInUp" style={{ width: '100%', maxWidth: '440px', padding: '40px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px', height: '56px',
            background: 'linear-gradient(135deg, var(--emerald), var(--blue))',
            borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 30px var(--emerald-glow)', marginBottom: '16px',
          }}>
            <TrendingUp size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: '28px', margin: '0 0 6px' }}>Create Account</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>Start tracking your finances today</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{ padding: '12px 16px', background: 'var(--rose-dim)', border: '1px solid rgba(244,63,94,0.25)', borderRadius: 'var(--radius-sm)', color: 'var(--rose)', fontSize: '13px' }}>
              {error}
            </div>
          )}

          {inputRow('Full Name', 'name', 'text', 'John Doe', <User size={16} />)}
          {inputRow('Email', 'email', 'email', 'you@example.com', <Mail size={16} />)}

          <div className="input-group">
            <label className="input-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type={showPw ? 'text' : 'password'}
                className="input-field"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange('password')}
                required
                data-testid="input-password"
                style={{ paddingLeft: '40px', paddingRight: '44px' }}
              />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {inputRow('Confirm Password', 'confirm', 'password', 'Repeat your password', <Lock size={16} />)}

          <button
            type="submit"
            className="btn btn-success"
            disabled={loading}
            data-testid="btn-register"
            style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px', marginTop: '4px' }}
          >
            {loading ? <><div className="spinner" style={{ width: '16px', height: '16px' }} /> Creating account...</> : 'Create Account'}
          </button>
        </form>

        <div className="divider" style={{ margin: '24px 0' }} />
        <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--blue)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
