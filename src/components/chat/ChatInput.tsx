import { useState, type FormEvent } from 'react';
import { useChatStore } from '../../store/chatStore';

export function ChatInput() {
  const [input, setInput] = useState('');
  const { addMessage, isLoading } = useChatStore();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    addMessage({
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
      status: 'sent',
    });

    setInput('');
  };

  const handleVoice = () => {
    // TODO: Tích hợp Web Speech API
  };

  return (
    <form className="chat-input-form" onSubmit={handleSubmit}>
      <button
        type="button"
        className="chat-voice-btn"
        onClick={handleVoice}
        aria-label="Nói với AI"
        title="Nói với AI"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
          <path d="M19 10v2a7 7 0 01-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      </button>

      <input
        type="text"
        className="chat-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Nhập tin nhắn..."
        disabled={isLoading}
      />

      <button
        type="submit"
        className="chat-send-btn"
        disabled={!input.trim() || isLoading}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="19" x2="12" y2="5" />
          <polyline points="5 12 12 5 19 12" />
        </svg>
      </button>
    </form>
  );
}
