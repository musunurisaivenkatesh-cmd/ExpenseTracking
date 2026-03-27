import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, PlusCircle, BarChart2, Sparkles,
  Mail, User, LogOut, Menu, X, TrendingUp, IndianRupee
} from 'lucide-react';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';

const navItems = [
  { path: '/',         icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/add',      icon: PlusCircle,      label: 'Add Transaction' },
  { path: '/summary',  icon: BarChart2,        label: 'Summary' },
  { path: '/income',   icon: IndianRupee,      label: 'Monthly Income' },
  { path: '/ai-tips',  icon: Sparkles,         label: 'AI Tips' },
  { path: '/contact',  icon: Mail,             label: 'Contact' },
  { path: '/account',  icon: User,             label: 'Account' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div className="bg-mesh" />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            zIndex: 40, display: 'none'
          }}
          className="mobile-overlay"
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: '240px',
        minHeight: '100vh',
        background: 'rgba(255,255,255,0.03)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 50,
        backdropFilter: 'blur(20px)',
        transition: 'transform 0.3s ease',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', padding: '0 8px' }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, var(--blue), var(--purple))',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px var(--blue-glow)',
          }}>
            <TrendingUp size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>FinTrack</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Finance Tracker</div>
          </div>
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                data-testid={`nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '11px 14px',
                  borderRadius: 'var(--radius-sm)',
                  color: active ? '#fff' : 'var(--text-secondary)',
                  fontWeight: active ? 600 : 500,
                  fontSize: '14px',
                  background: active ? 'linear-gradient(135deg, var(--blue), rgba(59,130,246,0.7))' : 'transparent',
                  boxShadow: active ? '0 0 20px var(--blue-glow)' : 'none',
                  transition: 'var(--transition)',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          <Link
            to="/account"
            style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', marginBottom: '8px',
              textDecoration: 'none', borderRadius: 'var(--radius-sm)', transition: 'var(--transition)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{
              width: '34px', height: '34px',
              background: 'linear-gradient(135deg, var(--blue), var(--purple))',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>
              {getInitials(user?.name)}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            data-testid="btn-logout"
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 14px', borderRadius: 'var(--radius-sm)',
              border: 'none', background: 'transparent',
              color: 'var(--rose)', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              transition: 'var(--transition)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--rose-dim)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: '240px', flex: 1, minHeight: '100vh', padding: '32px', maxWidth: 'calc(100vw - 240px)', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '32px', right: '32px', zIndex: 100 }}>
          <ThemeToggle />
        </div>
        {children}
      </main>
    </div>
  );
}
