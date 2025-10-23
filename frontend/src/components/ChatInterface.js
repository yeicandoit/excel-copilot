import React, { useState, useRef, useEffect } from 'react';
import { marked } from 'marked';
import './ChatInterface.css';
import { sendChatMessage } from '../services/api';

const ChatInterface = ({ excelData, settings }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatHistoryRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  };

  const addMessage = (content, isUser = false) => {
    const newMessage = {
      id: Date.now() + Math.random(),
      content,
      isUser,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  const handleSendMessage = async () => {
    const message = inputValue.trim();
    if (!message || isLoading) return;

    // Add user message
    addMessage(message, true);
    setInputValue('');

    // Add loading message
    const loadingMessage = addMessage('Thinking...', false);
    setIsLoading(true);

    try {
      // Prepare messages for API
      const apiMessages = messages.map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.content
      }));

      // Add current user message
      apiMessages.push({
        role: 'user',
        content: message
      });

      // Remove loading message
      setMessages(prev => prev.filter(msg => msg.id !== loadingMessage.id));

      // Send to API with streaming
      await sendChatMessage(apiMessages, excelData, settings, (content, reasoningContent) => {
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage && !lastMessage.isUser) {
            // Update existing assistant message
            return prev.map(msg => 
              msg.id === lastMessage.id 
                ? { ...msg, content: content, reasoningContent: reasoningContent }
                : msg
            );
          } else {
            // Add new assistant message
            return [...prev, {
              id: Date.now() + Math.random(),
              content,
              reasoningContent,
              isUser: false,
              timestamp: new Date()
            }];
          }
        });
      });

    } catch (error) {
      console.error('Error sending message:', error);
      // Remove loading message and add error message
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== loadingMessage.id);
        return [...filtered, {
          id: Date.now() + Math.random(),
          content: 'Sorry, I encountered an error while processing your request.',
          isUser: false,
          timestamp: new Date()
        }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const renderMessage = (message) => {
    const content = message.reasoningContent 
      ? marked.parse(message.reasoningContent)
      : marked.parse(message.content);

    return (
      <div key={message.id} className={`message ${message.isUser ? 'user-message' : 'assistant-message'}`}>
        {message.reasoningContent && (
          <div className="reasoning-container">
            <div className="reasoning-header">
              <span>thinking</span>
              <span className="reasoning-toggle">^</span>
            </div>
            <div 
              className="reasoning-content"
              dangerouslySetInnerHTML={{ __html: marked.parse(message.reasoningContent) }}
            />
          </div>
        )}
        <div 
          className="message-content"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    );
  };

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h2>Chat Assistant</h2>
        <button 
          className="clear-button"
          onClick={clearChat}
          disabled={messages.length === 0}
        >
          Clear Chat
        </button>
      </div>

      <div className="chat-history" ref={chatHistoryRef}>
        {messages.length === 0 ? (
          <div className="empty-chat">
            <p>Ask me anything about your Excel data...</p>
          </div>
        ) : (
          messages.map(renderMessage)
        )}
      </div>

      <div className="input-section">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message here..."
          disabled={isLoading}
          rows={3}
        />
        <button 
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isLoading}
          className="send-button"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
