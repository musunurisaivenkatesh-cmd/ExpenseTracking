import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/client';
import Layout from '../components/Layout';
import {
  User, Mail, Key, Shield, Bell, LogOut,
  Check, AlertCircle, Edit3, Save
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Account() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);

  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState(null);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      const res = await authAPI.updateProfile(profileForm);
      updateUser(res.data);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.detail || 'Update failed.' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const statsItems = [
    { label: 'Member Since', value: user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'N/A' },
    { label: 'Account Type', value: 'Free Plan' },
    { label: 'Status', value: 'Active' },
  ];

  return (
    <Layout>
      <div style={{ maxWidth: '720px', margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', margin: '0 0 4px' }}>Account Settings</h1>
          <p style={{ margin: 0 }}>Manage your profile and preferences</p>
        </div>

        {/* Profile Avatar Card */}
        <div className="glass-card" style={{ padding: '28px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '72px', height: '72px', flexShrink: 0,
            background: 'linear-gradient(135deg, var(--blue), var(--purple))',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '26px', fontWeight: 700, color: '#fff',
            boxShadow: '0 0 30px var(--blue-glow)',
          }}>
            {getInitials(user?.name)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '20px', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-primary)' }}>{user?.name}</div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>{user?.email}</div>
            <div style={{ display: 'flex', gap: '20px', marginTop: '12px' }}>
              {statsItems.map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{label}</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Edit Profile */}
        <div className="glass-card" style={{ padding: '28px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px' }}>
            <div style={{ width: '32px', height: '32px', background: 'var(--blue-dim)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Edit3 size={15} color="var(--blue)" />
            </div>
            <h3 style={{ margin: 0, fontSize: '16px' }}>Edit Profile</h3>
          </div>

          {profileMsg && (
            <div style={{
              marginBottom: '16px', padding: '12px 16px', borderRadius: 'var(--radius-sm)',
              background: profileMsg.type === 'success' ? 'var(--emerald-dim)' : 'var(--rose-dim)',
              border: `1px solid ${profileMsg.type === 'success' ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.25)'}`,
              color: profileMsg.type === 'success' ? 'var(--emerald)' : 'var(--rose)',
              fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              {profileMsg.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
              {profileMsg.text}
            </div>
          )}

          <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="input-field"
                    value={profileForm.name}
                    onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                    required
                    data-testid="input-profile-name"
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    className="input-field"
                    value={profileForm.email}
                    onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))}
                    required
                    data-testid="input-profile-email"
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={profileLoading}
              data-testid="btn-save-profile"
              style={{ alignSelf: 'flex-start', minWidth: '140px' }}
            >
              {profileLoading ? <><div className="spinner" style={{ width: '14px', height: '14px' }} /> Saving...</> : <><Save size={15} /> Save Changes</>}
            </button>
          </form>
        </div>

        {/* Security Section */}
        <div className="glass-card" style={{ padding: '28px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <div style={{ width: '32px', height: '32px', background: 'var(--amber-dim)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={15} color="var(--amber)" />
            </div>
            <h3 style={{ margin: 0, fontSize: '16px' }}>Security</h3>
          </div>
          <div style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Password</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Last changed: Never</div>
              </div>
              <span className="badge badge-emerald"><Check size={12} /> Protected</span>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="glass-card" style={{ padding: '24px', border: '1px solid rgba(244,63,94,0.2)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: 'var(--rose)' }}>Danger Zone</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600 }}>Sign Out</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Sign out from all devices</div>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-danger"
              data-testid="btn-account-logout"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
