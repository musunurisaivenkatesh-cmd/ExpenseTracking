import { useState } from 'react';
import { contactAPI } from '../api/client';
import Layout from '../components/Layout';
import { Mail, Phone, MapPin, Send, CheckCircle, MessageSquare } from 'lucide-react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await contactAPI.submit(form);
      setSuccess(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send message. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const contactInfoItems = [
    { icon: Mail, label: 'Email', value: 'support@fintrack.com', color: 'var(--blue)' },
    { icon: Phone, label: 'Phone', value: '+91 98765 43210', color: 'var(--emerald)' },
    { icon: MapPin, label: 'Location', value: 'Hyderabad, India', color: 'var(--rose)' },
  ];

  return (
    <Layout>
      <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', margin: '0 0 4px' }}>Contact Us</h1>
          <p style={{ margin: 0 }}>Have questions or feedback? We'd love to hear from you.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '20px', alignItems: 'start' }}>
          {/* Left: Contact Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Message card */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{
                width: '48px', height: '48px', marginBottom: '16px',
                background: 'var(--blue-dim)', borderRadius: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid rgba(59,130,246,0.2)',
              }}>
                <MessageSquare size={22} color="var(--blue)" />
              </div>
              <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Get in Touch</h3>
              <p style={{ fontSize: '14px', lineHeight: 1.7 }}>
                Our support team typically responds within 24 hours. For urgent issues, reach us directly by phone.
              </p>
            </div>

            {/* Contact details */}
            {contactInfoItems.map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="glass-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '40px', height: '40px', flexShrink: 0,
                  background: `${color}15`,
                  borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `1px solid ${color}30`,
                }}>
                  <Icon size={18} color={color} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>{value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Form */}
          <div className="glass-card" style={{ padding: '32px' }}>
            {success ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{
                  width: '64px', height: '64px', margin: '0 auto 16px',
                  background: 'var(--emerald-dim)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 30px var(--emerald-glow)',
                }}>
                  <CheckCircle size={32} color="var(--emerald)" />
                </div>
                <h3 style={{ marginBottom: '8px' }}>Message Sent!</h3>
                <p style={{ marginBottom: '24px' }}>We'll get back to you within 24 hours.</p>
                <button className="btn btn-ghost" onClick={() => setSuccess(false)}>Send Another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <h3 style={{ margin: '0 0 4px', fontSize: '18px' }}>Send a Message</h3>

                {error && (
                  <div style={{ padding: '12px 16px', background: 'var(--rose-dim)', border: '1px solid rgba(244,63,94,0.25)', borderRadius: 'var(--radius-sm)', color: 'var(--rose)', fontSize: '13px' }}>
                    {error}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="input-group">
                    <label className="input-label">Your Name</label>
                    <input type="text" className="input-field" placeholder="John Doe" value={form.name} onChange={handleChange('name')} required data-testid="input-contact-name" />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Email Address</label>
                    <input type="email" className="input-field" placeholder="you@example.com" value={form.email} onChange={handleChange('email')} required data-testid="input-contact-email" />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Subject</label>
                  <input type="text" className="input-field" placeholder="What's this about?" value={form.subject} onChange={handleChange('subject')} required data-testid="input-contact-subject" />
                </div>

                <div className="input-group">
                  <label className="input-label">Message</label>
                  <textarea
                    className="input-field"
                    placeholder="Tell us more..."
                    value={form.message}
                    onChange={handleChange('message')}
                    required
                    rows={5}
                    data-testid="input-contact-message"
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  data-testid="btn-contact-submit"
                  style={{ justifyContent: 'center', padding: '14px' }}
                >
                  {loading ? <><div className="spinner" style={{ width: '16px', height: '16px' }} /> Sending...</> : <><Send size={15} /> Send Message</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
