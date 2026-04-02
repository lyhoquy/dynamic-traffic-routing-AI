import { useChatStore } from '../../store/chatStore';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

/**
 * Panel chat AI - nơi người dùng tương tác với trợ lý ảo.
 * Khi AI phát hiện sự cố qua camera, nó sẽ gửi cảnh báo ở đây
 * và đề xuất tuyến đường thay thế.
 */
export function ChatPanel() {
  const { messages, isOpen, toggleOpen, isLoading } = useChatStore();

  return (
    <aside className={`chat-panel ${isOpen ? 'chat-panel--open' : ''}`}>
      <button className="chat-toggle" onClick={toggleOpen}>
        {isOpen ? '✕' : '💬'}
      </button>

      {isOpen && (
        <div className="chat-content">
          <div className="chat-header">
            <h2>AI Assistant</h2>
            <span className="chat-status">
              {isLoading ? 'Dang suy nghi...' : 'San sang'}
            </span>
          </div>

          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="chat-empty">
                <p>Xin chao! Toi la tro ly dieu huong giao thong AI.</p>
                <p>Hay hoi toi ve tinh trang giao thong hoac yeu cau tinh tuyen duong.</p>
              </div>
            )}
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
          </div>

          <ChatInput />
        </div>
      )}
    </aside>
  );
}
