import { useState, useEffect, useRef } from 'react';
import { aiAPI, expensesAPI } from '../api/client';
import Layout from '../components/Layout';
import { Send, Sparkles, Bot, User, Paperclip, X, FileText, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function ReceiptCard({ data }) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (saved || saving) return;
    setSaving(true);
    try {
      const amountFloat = parseFloat(String(data.total_amount).replace(/[^0-9.]/g, ''));
      const mainCat = data.items?.[0]?.category || 'Other';
      
      // Map AI categories to app categories
      const catMap = { 'Healthcare': 'Health', 'Groceries': 'Food', 'Beverages': 'Food', 'Electronics': 'Shopping' };
      const finalCat = catMap[mainCat] || mainCat;

      await expensesAPI.create({
        amount: amountFloat,
        category: finalCat,
        description: `${data.merchant} (AI Parsed Bill)`,
        date: new Date().toISOString().slice(0, 10),
      });
      setTimeout(() => {
        setSaved(true);
        setSaving(false);
      }, 600);
    } catch (e) {
      console.error(e);
      setSaving(false);
    }
  };

  const isAlert = data.payment_method === 'Financial Alert';

  return (
    <div style={{ 
      display: 'flex', flexDirection: 'column', gap: '16px', 
      background: isAlert ? 'rgba(244,63,94,0.05)' : 'rgba(0,0,0,0.2)', 
      padding: '16px', borderRadius: '12px', 
      border: isAlert ? '1px solid var(--rose)' : '1px solid var(--border)', 
      width: '100%', minWidth: '320px', animation: 'fadeInUp 0.4s ease' 
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', color: isAlert ? 'var(--rose)' : 'var(--text-primary)' }}>{data.merchant}</h3>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>{data.date}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h3 style={{ margin: 0, fontSize: '18px', color: isAlert ? 'var(--rose)' : 'var(--emerald)' }}>{data.total_amount}</h3>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>{data.payment_method}</p>
        </div>
      </div>
      
      <div>
        <h4 style={{ margin: '0 0 8px', fontSize: '13px', color: 'var(--text-secondary)' }}>ITEMS ({data.summary?.total_items})</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {data.items?.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-primary)' }}>{item.name}</span>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>{item.category}</span>
                <span style={{ fontWeight: 600 }}>{item.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
        {data.insights?.map((ins, i) => <div key={'i'+i} style={{ fontSize: '13px', lineHeight: 1.4 }}><strong style={{ color: 'var(--blue)' }}>💡 Insight:</strong> {ins}</div>)}
        {data.suggestions?.map((sug, i) => <div key={'s'+i} style={{ fontSize: '13px', lineHeight: 1.4 }}><strong style={{ color: 'var(--emerald)' }}>📈 Suggestion:</strong> {sug}</div>)}
        {data.warnings?.map((war, i) => <div key={'w'+i} style={{ fontSize: '13px', lineHeight: 1.4 }}><strong style={{ color: 'var(--rose)' }}>⚠️ Warning:</strong> {war}</div>)}
      </div>

      {!isAlert && (
        <button 
          onClick={handleSave}
          disabled={saved || saving}
          style={{
            marginTop: '8px',
            width: '100%', padding: '12px', borderRadius: '8px',
            background: saved ? 'var(--emerald-dim)' : (saving ? 'rgba(139,92,246,0.5)' : 'var(--purple)'),
            color: saved ? 'var(--emerald)' : '#fff',
            border: 'none', cursor: (saved || saving) ? 'default' : 'pointer',
            fontWeight: 600, fontSize: '13px', transition: 'all 0.3s ease',
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
          }}
          onMouseEnter={e => { if(!saved && !saving) e.currentTarget.style.filter = 'brightness(1.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.filter = 'none'; }}
        >
          {saved ? '✓ Saved to Tracker' : (saving ? 'Saving...' : `➕ Add ${data.total_amount} to Expenses`)}
        </button>
      )}
    </div>
  );
}

function Message({ role, content, attachment, fileName }) {
  const isUser = role === 'user';
  let parsedJson = null;

  if (!isUser) {
    try {
      if (content.trim().startsWith('{') && content.trim().endsWith('}')) {
        parsedJson = JSON.parse(content);
      }
    } catch(e) {}
  }

  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      alignItems: 'flex-start',
      flexDirection: isUser ? 'row-reverse' : 'row',
      animation: 'fadeInUp 0.3s ease both',
    }}>
      <div style={{
        width: '32px', height: '32px', flexShrink: 0,
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isUser ? 'linear-gradient(135deg, var(--blue), var(--purple))' : 'var(--purple-dim)',
        border: isUser ? 'none' : '1px solid rgba(139,92,246,0.3)',
      }}>
        {isUser ? <User size={14} color="#fff" /> : <Sparkles size={14} color="var(--purple)" />}
      </div>
      <div style={{
        maxWidth: '75%',
        padding: '14px 18px',
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        background: isUser ? 'var(--blue)' : 'rgba(255,255,255,0.05)',
        border: isUser ? 'none' : '1px solid var(--border)',
        color: 'var(--text-primary)',
        fontSize: '14px',
        lineHeight: 1.6,
      }}>
        {attachment && (
           <div style={{ marginBottom: '8px' }}>
             {attachment.startsWith('data:image/') ? (
               <img src={attachment} alt={fileName || 'upload'} style={{ maxWidth: '100%', borderRadius: '12px', maxHeight: '200px', objectFit: 'cover', border: '1px solid var(--border)' }} />
             ) : (
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                 <FileText size={16} />
                 <span style={{ fontSize: '12px', wordBreak: 'break-all' }}>{fileName || 'File attached'}</span>
               </div>
             )}
           </div>
        )}
        <div style={{ whiteSpace: 'pre-wrap' }}>
          {parsedJson && parsedJson.merchant ? <ReceiptCard data={parsedJson} /> : content}
        </div>
      </div>
    </div>
  );
}

const QUICK_PROMPTS = [
  'How am I doing financially this month?',
  'Give me 3 tips to reduce my expenses',
  'How can I improve my savings rate?',
  'What is a good budget allocation for my income?',
];

export default function AITips() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm your personal finance assistant. I have access to your financial data and can help you with budgeting tips, spending analysis, and savings strategies. What would you like to know?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setAttachment({ file, dataUrl: e.target.result });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text = input) => {
    if ((!text.trim() && !attachment) || loading) return;
    
    const userMsg = { role: 'user', content: text, attachment: attachment?.dataUrl, fileName: attachment?.file?.name };
    const currentAttachment = attachment;
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setAttachment(null);
    setLoading(true);

    try {
      const promptText = text + (currentAttachment ? " [upload receipt analyze bill]" : "");
      const res = await aiAPI.chat(promptText, currentAttachment?.file?.name);
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.message }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I had trouble connecting. Please try again in a moment.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <Layout>
      <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
        {/* Header */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <div style={{
              width: '40px', height: '40px',
              background: 'var(--purple-dim)',
              borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(139,92,246,0.3)',
            }}>
              <Sparkles size={20} color="var(--purple)" />
            </div>
            <div>
              <h1 style={{ fontSize: '22px', margin: 0 }}>AI Financial Advisor</h1>
              <p style={{ margin: 0, fontSize: '13px' }}>Powered by GPT · Knows your finances</p>
            </div>
          </div>
        </div>

        {/* Chat Window */}
        <div className="glass-card" style={{
          flex: 1,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          minHeight: '400px',
        }}>
          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '24px',
            display: 'flex', flexDirection: 'column', gap: '18px',
          }}>
            {messages.map((msg, i) => (
              <Message key={i} role={msg.role} content={msg.content} attachment={msg.attachment} fileName={msg.fileName} />
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '32px', height: '32px', flexShrink: 0, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--purple-dim)', border: '1px solid rgba(139,92,246,0.3)',
                }}>
                  <Sparkles size={14} color="var(--purple)" />
                </div>
                <div style={{
                  padding: '14px 18px', borderRadius: '18px 18px 18px 4px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                  display: 'flex', gap: '6px', alignItems: 'center',
                }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: 'var(--purple)', opacity: 0.6,
                      animation: `pulse-glow 1.2s ease ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompts */}
          <div style={{ padding: '12px 24px 0', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {QUICK_PROMPTS.map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q)}
                disabled={loading}
                data-testid={`quick-prompt-${i}`}
                style={{
                  padding: '6px 12px', borderRadius: '100px',
                  border: '1px solid var(--border)',
                  background: 'rgba(255,255,255,0.04)',
                  color: 'var(--text-muted)',
                  fontSize: '12px', cursor: 'pointer',
                  transition: 'var(--transition)',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--purple)'; e.currentTarget.style.color = 'var(--purple)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input area */}
          <div style={{ padding: '16px 24px 24px' }}>
            {attachment && (
              <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', width: 'fit-content' }}>
                {attachment.file.type.startsWith('image/') ? <ImageIcon size={16} color="var(--emerald)" /> : <FileText size={16} color="var(--blue)" />}
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {attachment.file.name}
                </span>
                <button onClick={() => setAttachment(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', display: 'flex' }} onMouseEnter={e => e.currentTarget.style.color='var(--rose)'} onMouseLeave={e => e.currentTarget.style.color='var(--text-muted)'}>
                  <X size={14} />
                </button>
              </div>
            )}
            <div style={{
              display: 'flex', gap: '12px', alignItems: 'flex-end',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              transition: 'var(--transition)',
            }}>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*,.pdf,.csv" />
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Attach file"
                style={{
                  width: '36px', height: '36px', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border)', borderRadius: '10px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'var(--transition)', flexShrink: 0, color: 'var(--text-muted)',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <Paperclip size={18} />
              </button>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your finances... (Enter to send)"
                data-testid="input-chat-message"
                rows={1}
                style={{
                  flex: 1, background: 'none', border: 'none', outline: 'none',
                  color: 'var(--text-primary)', fontSize: '14px', resize: 'none',
                  fontFamily: 'var(--font-body)', lineHeight: 1.5,
                  maxHeight: '100px', overflowY: 'auto',
                }}
                onInput={e => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || (!input.trim() && !attachment)}
                data-testid="btn-send-message"
                style={{
                  width: '36px', height: '36px',
                  background: (input.trim() || attachment) && !loading ? 'var(--purple)' : 'rgba(255,255,255,0.07)',
                  border: 'none', borderRadius: '10px', cursor: (input.trim() || attachment) && !loading ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'var(--transition)', flexShrink: 0,
                  boxShadow: (input.trim() || attachment) && !loading ? '0 0 16px rgba(139,92,246,0.3)' : 'none',
                }}
              >
                <Send size={16} color={(input.trim() || attachment) && !loading ? '#fff' : 'var(--text-muted)'} />
              </button>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '8px' }}>
              Press Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
