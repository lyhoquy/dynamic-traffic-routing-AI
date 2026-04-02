import type { ChatMessage as ChatMessageType } from '../../types/chat';

interface Props {
  message: ChatMessageType;
}

export function ChatMessage({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <div className={`chat-message ${isUser ? 'chat-message--user' : 'chat-message--assistant'}`}>
      <div className="chat-message-content">
        {message.content}
      </div>
      {message.toolCalls && message.toolCalls.length > 0 && (
        <div className="chat-message-tools">
          {message.toolCalls.map((tool, i) => (
            <span key={i} className="chat-tool-badge">
              {tool.name}
            </span>
          ))}
        </div>
      )}
      <time className="chat-message-time">
        {new Date(message.timestamp).toLocaleTimeString('vi-VN')}
      </time>
    </div>
  );
}
