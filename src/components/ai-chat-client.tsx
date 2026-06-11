'use client';

import * as React from 'react';
import { ArrowUp, Bot, Copy, RotateCcw, Sparkles, User } from 'lucide-react';

/* ──────────────────────────────────────────────────────────────
   Warna Architax — White + Blue System
   ────────────────────────────────────────────────────────────── */
const C = {
  white:       '#ffffff',
  surface:     '#f8fafc',
  surfaceSoft: '#f1f5f9',
  hairline:    '#e2e8f0',
  ink:         '#0f172a',
  bodyStrong:  '#1e293b',
  body:        '#334155',
  muted:       '#64748b',
  mutedSoft:   '#94a3b8',
  blue:        '#2563eb',
  blueDark:    '#1d4ed8',
  blueSoft:    '#eff6ff',
  blueLight:   '#dbeafe',
} as const;

/* ──────────────────────────────────────────────────────────────
   Types
   ────────────────────────────────────────────────────────────── */
type Role = 'user' | 'assistant';

interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
}

/* ──────────────────────────────────────────────────────────────
   Mock AI responses (simulasi sampai backend AI tersedia)
   ────────────────────────────────────────────────────────────── */
const MOCK_RESPONSES: Record<string, string> = {
  default: `Halo! Saya asisten AI Architax. Saya dapat membantu Anda dengan:

• **Permohonan PBB** — cara membuat, melacak, atau merevisi berkas permohonan
• **Bundling berkas** — panduan pengelompokan berkas tervalidasi
• **Pengarsipan** — petunjuk unggah scan dan pengarsipan digital
• **Manifest pengiriman** — membuat dan mengelola pengiriman bundle
• **Monitoring** — cara memantau status berkas di kantor pusat

Silakan ajukan pertanyaan Anda!`,

  permohonan: `Untuk membuat **Permohonan Baru** di Architax:

1. Buka menu **Permohonan → Buat Permohonan Baru**
2. Isi formulir lengkap: NOP, data wajib pajak, dan jenis permohonan
3. Unggah dokumen pendukung (jika ada)
4. Klik **Kirim** — berkas akan masuk ke antrean validasi peneliti

Status permohonan bisa dipantau di menu **Permohonan Saya**.`,

  bundle: `**Bundling berkas** dilakukan oleh Staf Peneliti setelah validasi:

1. Buka menu **Bundling Berkas → Daftar Bundle**
2. Klik **Buat Bundle Baru**
3. Pilih permohonan yang sudah berstatus *Tervalidasi*
4. Beri nama bundle dan konfirmasi
5. Bundle siap diserahkan ke Staf Pengarsip

Lihat riwayat bundle di **Bundling → Riwayat Bundle**.`,

  arsip: `Proses **pengarsipan digital** oleh Staf Pengarsip:

1. Buka menu **Pengarsipan**
2. Pilih bundle yang siap diarsipkan
3. Unggah file scan untuk setiap berkas dalam bundle
4. Tandai sebagai **Terunggah** setelah selesai
5. Bundle siap dikirim oleh Staf Pengirim`,
};

function getMockResponse(query: string): string {
  const q = query.toLowerCase();
  if (q.includes('permohonan') || q.includes('buat') || q.includes('form'))
    return MOCK_RESPONSES.permohonan;
  if (q.includes('bundle') || q.includes('bundling') || q.includes('kelompok'))
    return MOCK_RESPONSES.bundle;
  if (q.includes('arsip') || q.includes('scan') || q.includes('unggah'))
    return MOCK_RESPONSES.arsip;
  return MOCK_RESPONSES.default;
}

/* ──────────────────────────────────────────────────────────────
   Markdown-lite renderer (bold, bullet)
   ────────────────────────────────────────────────────────────── */
function renderMarkdown(text: string) {
  return text.split('\n').map((line, i) => {
    // Bold: **text**
    const parts = line.split(/\*\*(.*?)\*\*/g);
    const rendered = parts.map((p, j) =>
      j % 2 === 1 ? <strong key={j} style={{ fontWeight: 600, color: C.ink }}>{p}</strong> : p
    );
    // Bullet
    const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
    return (
      <p
        key={i}
        style={{
          margin: '2px 0',
          paddingLeft: isBullet ? 4 : 0,
          lineHeight: 1.65,
        }}
      >
        {rendered}
      </p>
    );
  });
}

/* ──────────────────────────────────────────────────────────────
   Message Bubble
   ────────────────────────────────────────────────────────────── */
function MessageBubble({ msg }: { msg: Message }) {
  const [copied, setCopied] = React.useState(false);
  const isUser = msg.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
        flexDirection: isUser ? 'row-reverse' : 'row',
        marginBottom: 20,
      }}
    >
      {/* Avatar */}
      <div
        style={{
          flexShrink: 0,
          width: 30,
          height: 30,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isUser
            ? `linear-gradient(135deg, ${C.blue}, ${C.blueDark})`
            : 'linear-gradient(135deg, #7c3aed, #2563eb)',
        }}
      >
        {isUser
          ? <User style={{ width: 14, height: 14, color: '#fff' }} />
          : <Bot style={{ width: 14, height: 14, color: '#fff' }} />
        }
      </div>

      {/* Bubble + actions */}
      <div style={{ maxWidth: '72%', minWidth: 0 }}>
        <div
          style={{
            backgroundColor: isUser ? C.blue : C.white,
            color: isUser ? '#fff' : C.body,
            borderRadius: isUser ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
            padding: '10px 14px',
            fontSize: 13.5,
            lineHeight: 1.65,
            border: isUser ? 'none' : `1px solid ${C.hairline}`,
            boxShadow: isUser
              ? '0 2px 8px rgba(37,99,235,0.18)'
              : '0 1px 3px rgba(15,23,42,0.06)',
          }}
        >
          {isUser
            ? <p style={{ margin: 0 }}>{msg.content}</p>
            : <div style={{ margin: 0 }}>{renderMarkdown(msg.content)}</div>
          }
        </div>

        {/* Timestamp + copy */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 4,
            justifyContent: isUser ? 'flex-end' : 'flex-start',
          }}
        >
          <span style={{ fontSize: 10.5, color: C.mutedSoft }}>
            {msg.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </span>
          {!isUser && (
            <button
              onClick={handleCopy}
              title="Salin"
              style={{
                display: 'flex', alignItems: 'center', gap: 3,
                fontSize: 10.5, color: copied ? '#10b981' : C.mutedSoft,
                background: 'none', border: 'none', cursor: 'pointer',
                padding: 0, transition: 'color 150ms',
              }}
            >
              <Copy style={{ width: 10, height: 10 }} />
              {copied ? 'Tersalin!' : 'Salin'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Typing indicator
   ────────────────────────────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 20 }}>
      <div style={{
        flexShrink: 0, width: 30, height: 30, borderRadius: '50%',
        background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Bot style={{ width: 14, height: 14, color: '#fff' }} />
      </div>
      <div style={{
        backgroundColor: C.white, border: `1px solid ${C.hairline}`,
        borderRadius: '4px 12px 12px 12px',
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 4,
      }}>
        {[0, 1, 2].map(i => (
          <span
            key={i}
            style={{
              width: 6, height: 6, borderRadius: '50%',
              backgroundColor: C.mutedSoft,
              display: 'inline-block',
              animation: `typing-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes typing-dot {
          0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Main Component
   ────────────────────────────────────────────────────────────── */
interface AiChatClientProps {
  initialQuery?: string;
  userName: string;
}

export function AiChatClient({ initialQuery, userName }: AiChatClientProps) {
  const [messages, setMessages]   = React.useState<Message[]>([]);
  const [input, setInput]         = React.useState('');
  const [isTyping, setIsTyping]   = React.useState(false);
  const [focused, setFocused]     = React.useState(false);
  const messagesEndRef             = React.useRef<HTMLDivElement>(null);
  const inputRef                   = React.useRef<HTMLTextAreaElement>(null);
  const initialQuerySent           = React.useRef(false);

  const firstName = userName.split(' ')[0];

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  // Send message
  const sendMessage = React.useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    if (inputRef.current) inputRef.current.style.height = 'auto';
    setIsTyping(true);

    // Simulasi AI response delay
    const delay = 800 + Math.random() * 700;
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getMockResponse(trimmed),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, delay);
  }, [isTyping]);

  // Handle initial query dari URL param
  React.useEffect(() => {
    if (initialQuery && !initialQuerySent.current) {
      initialQuerySent.current = true;
      setTimeout(() => sendMessage(initialQuery), 300);
    }
  }, [initialQuery, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const canSend = input.trim().length > 0 && !isTyping;

  const clearChat = () => {
    setMessages([]);
    initialQuerySent.current = false;
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxWidth: 780,
        margin: '0 auto',
      }}
    >
      {/* ── Header ─────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* AI icon */}
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #db2777 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Sparkles style={{ width: 17, height: 17, color: '#fff' }} />
          </div>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 700, color: C.ink, margin: 0, letterSpacing: '-0.02em' }}>
              Architax AI
            </h1>
            <p style={{ fontSize: 11, color: C.mutedSoft, margin: 0, marginTop: 1 }}>
              Asisten cerdas untuk alur kerja PBB
            </p>
          </div>
        </div>

        {/* Clear chat */}
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            title="Mulai percakapan baru"
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              height: 32, padding: '0 12px',
              fontSize: 12, fontWeight: 500, color: C.muted,
              backgroundColor: C.white, border: `1px solid ${C.hairline}`,
              borderRadius: 7, cursor: 'pointer',
              transition: 'all 150ms',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = C.surfaceSoft;
              (e.currentTarget as HTMLElement).style.color = C.bodyStrong;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = C.white;
              (e.currentTarget as HTMLElement).style.color = C.muted;
            }}
          >
            <RotateCcw style={{ width: 12, height: 12 }} />
            Chat Baru
          </button>
        )}
      </div>

      {/* ── Messages Area ──────────────────────── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '4px 2px',
          marginBottom: 16,
          minHeight: 0,
        }}
      >
        {/* Empty state */}
        {messages.length === 0 && !isTyping && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              textAlign: 'center',
              padding: '40px 20px',
              gap: 14,
            }}
          >
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #db2777 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles style={{ width: 24, height: 24, color: '#fff' }} />
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: C.ink, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                Halo, {firstName}!
              </p>
              <p style={{ fontSize: 13, color: C.muted, margin: 0, maxWidth: 340, lineHeight: 1.6 }}>
                Saya siap membantu Anda memahami alur kerja Architax. Tanyakan apa saja!
              </p>
            </div>

            {/* Suggestion chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 8 }}>
              {[
                'Cara membuat permohonan baru',
                'Bagaimana proses bundling?',
                'Panduan pengarsipan scan',
                'Cara membuat manifest',
              ].map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => sendMessage(suggestion)}
                  style={{
                    padding: '7px 13px',
                    fontSize: 12.5, fontWeight: 500,
                    color: C.blue,
                    backgroundColor: C.blueSoft,
                    border: `1px solid ${C.blueLight}`,
                    borderRadius: 20, cursor: 'pointer',
                    transition: 'all 150ms',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = C.blueLight;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = C.blueSoft;
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message list */}
        {messages.map(msg => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}

        {/* Typing indicator */}
        {isTyping && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Bar ──────────────────────────── */}
      <div
        style={{
          flexShrink: 0,
          backgroundColor: C.white,
          border: `1px solid ${focused ? C.blue : C.hairline}`,
          borderRadius: 12,
          padding: '10px 10px 10px 14px',
          boxShadow: focused
            ? '0 0 0 3px rgba(37,99,235,0.1)'
            : '0 1px 4px rgba(15,23,42,0.06)',
          transition: 'border-color 200ms, box-shadow 200ms',
          display: 'flex',
          alignItems: 'flex-end',
          gap: 10,
        }}
      >
        {/* Colorful icon */}
        <div style={{
          flexShrink: 0, width: 26, height: 26, borderRadius: 6,
          background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #db2777 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 3,
        }}>
          <Sparkles style={{ width: 13, height: 13, color: '#fff' }} />
        </div>

        {/* Textarea */}
        <textarea
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Tanyakan sesuatu tentang Architax atau deskripsikan yang ingin Anda lakukan..."
          rows={1}
          disabled={isTyping}
          style={{
            flex: 1,
            resize: 'none',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: 13.5,
            fontWeight: 400,
            color: C.ink,
            lineHeight: 1.55,
            minHeight: 24,
            maxHeight: 120,
            fontFamily: 'inherit',
            overflowY: 'auto',
            opacity: isTyping ? 0.6 : 1,
            paddingTop: 2,
          }}
        />

        {/* Hint + Send */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <span style={{ fontSize: 10, color: C.mutedSoft, display: 'none' }}>
            Shift+Enter baris baru
          </span>
          <button
            onClick={() => sendMessage(input)}
            disabled={!canSend}
            title="Kirim (Enter)"
            style={{
              width: 32, height: 32,
              borderRadius: 8,
              backgroundColor: canSend ? C.blue : C.surfaceSoft,
              border: 'none',
              cursor: canSend ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background-color 150ms, transform 100ms',
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              if (canSend) {
                (e.currentTarget as HTMLElement).style.backgroundColor = C.blueDark;
                (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = canSend ? C.blue : C.surfaceSoft;
              (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
            }}
          >
            <ArrowUp style={{
              width: 15, height: 15,
              color: canSend ? '#ffffff' : C.mutedSoft,
              transition: 'color 150ms',
            }} />
          </button>
        </div>
      </div>

      {/* Hint below input */}
      <p style={{ fontSize: 10.5, color: C.mutedSoft, textAlign: 'center', margin: '6px 0 0', flexShrink: 0 }}>
        Enter untuk kirim &middot; Shift+Enter untuk baris baru
      </p>
    </div>
  );
}
