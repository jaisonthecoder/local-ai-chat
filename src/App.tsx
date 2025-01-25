// src/App.tsx
import Anthropic from '@anthropic-ai/sdk';
import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CodeProps, Message } from './types/types.ts';

// Initialize the Anthropic client with proper typing
const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY as string, dangerouslyAllowBrowser: true
});

const App: React.FC = () => {
  // State management with proper typing
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Reference for auto-scrolling with proper typing
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]); 

  // Event handlers with proper typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setInput(e.target.value);
  };

  const sendMessage = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-sonnet',
        max_tokens: 4096,
        messages: [
          ...messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          { role: 'user', content: userMessage }
        ],
      });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.content[0].text
      }]);
    } catch (error) {
      console.error('API Error:', error); // Detailed error logging
      if (error instanceof Error) {
        console.error('Error message:', error.message);
      }
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Code rendering component with TypeScript
  const renderCode = ({ node, inline, className, children, ...props }: CodeProps) => {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      <SyntaxHighlighter
        style={tomorrow}
        language={match[1]}
        PreTag="div"
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    );
  };

  // Message rendering with TypeScript
  const renderMessage = (message: Message, index: number): JSX.Element => {
    return (
      <div
        key={index}
        className={`message-${message.role} message-content`}
      >
        <div className="max-w-3xl mx-auto">
          <div className="font-semibold mb-2">
            {message.role === 'user' ? 'You' : 'Claude'}
          </div>
          <div className="prose prose-slate max-w-none">
            <ReactMarkdown
              components={{
                code: renderCode
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="chat-container">
      <header>
        <div className="max-w-3xl mx-auto py-4 px-4">
          <h1>Local Claude Chat</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="space-y-6 py-8">
          {messages.map(renderMessage)}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="input-container">
        <div className="max-w-3xl mx-auto p-4">
          <form onSubmit={sendMessage}>
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message..."
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
};

export default App;