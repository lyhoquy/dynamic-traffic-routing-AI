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

    // TODO: Gửi message tới backend AI và nhận phản hồi
  };

  return (
    <form className="chat-input-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="chat-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Nhap tin nhan..."
        disabled={isLoading}
      />
      <button
        type="submit"
        className="chat-send-btn"
        disabled={!input.trim() || isLoading}
      >
        ↑
      </button>
    </form>
  );
}
