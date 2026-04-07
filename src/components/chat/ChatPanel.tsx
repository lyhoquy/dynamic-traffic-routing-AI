import { useChatStore } from '../../store/chatStore';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

export function ChatPanel() {
  const { messages, isOpen, isLoading } = useChatStore();

  if (!isOpen) return null;

  return (
    <div className="chat-sheet">
      <div className="chat-sheet__handle" />

      <div className="chat-sheet__header">
        <h2 className="chat-sheet__title">Trợ lý AI</h2>
        <span className="chat-sheet__status">
          {isLoading ? 'Đang xử lý...' : 'Sẵn sàng'}
        </span>
      </div>

      <div className="chat-sheet__messages">
        {messages.length === 0 && (
          <div className="chat-sheet__empty">
            <p>Xin chào! Tôi là trợ lý điều hướng giao thông AI.</p>
            <p>Bạn có thể hỏi tôi về tình trạng giao thông hoặc nhờ tính tuyến đường.</p>
          </div>
        )}
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
      </div>

      <ChatInput />
    </div>
  );
}
