'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useBlueprintStore } from '@/stores/blueprintStore';
import {
  getAssistantResponse,
  getContextualGreeting,
  QUICK_ACTIONS,
  type AssistantMessage,
  type QuickAction,
} from '@/lib/aiAssistant';
import { generateRecommendations } from '@/lib/recommendation';
import { useDebouncedBlueprint } from '@/hooks/useDebouncedBlueprint';

interface AIAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIAssistantPanel({ isOpen, onClose }: AIAssistantPanelProps) {
  const activeSection = useBlueprintStore((s) => s.blueprint.activeSection);
  const blueprint = useDebouncedBlueprint();

  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastSectionRef = useRef(activeSection);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Add contextual greeting when section changes
  useEffect(() => {
    if (isOpen && activeSection !== lastSectionRef.current) {
      lastSectionRef.current = activeSection;
      const greeting = getContextualGreeting(activeSection);
      setMessages((prev) => [
        ...prev,
        {
          id: `greeting-${activeSection}-${Date.now()}`,
          role: 'assistant',
          content: greeting,
          timestamp: Date.now(),
        },
      ]);
    }
  }, [activeSection, isOpen]);

  // Initial greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      lastSectionRef.current = activeSection;
      const greeting = getContextualGreeting(activeSection);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentionally setting initial state when panel first opens
      setMessages([
        {
          id: 'initial-greeting',
          role: 'assistant',
          content: greeting,
          timestamp: Date.now(),
        },
      ]);
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = useCallback(
    async (text: string | QuickAction, isQuickAction = false) => {
      if (!text.trim()) return;

      // Add user message (for freeform only)
      if (!isQuickAction) {
        setMessages((prev) => [
          ...prev,
          {
            id: `user-${Date.now()}`,
            role: 'user',
            content: text,
            timestamp: Date.now(),
          },
        ]);
      } else {
        // Show the quick action label as user message
        const action = QUICK_ACTIONS.find((a) => a.id === text);
        setMessages((prev) => [
          ...prev,
          {
            id: `user-${Date.now()}`,
            role: 'user',
            content: `${action?.icon ?? '💬'} ${action?.label ?? text}`,
            timestamp: Date.now(),
          },
        ]);
      }

      setInput('');
      setIsTyping(true);

      try {
        const provider = localStorage.getItem('blueprint_llm_provider') || 'google';
        const apiKey = localStorage.getItem(`blueprint_${provider}_api_key`) || '';
        const modelId = localStorage.getItem(`blueprint_${provider}_model`) || undefined;

        const response = await getAssistantResponse(
          text as QuickAction,
          blueprint,
          activeSection,
          apiKey,
          provider,
          modelId
        );
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: response,
            timestamp: Date.now(),
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: 'assistant',
            content: 'Sorry, I encountered an issue. Please try again.',
            timestamp: Date.now(),
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [blueprint, activeSection],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
    }
  };

  // Recommendation count for badge
  const recCount = generateRecommendations(blueprint).length;

  if (!isOpen) return null;

  return (
    <>
      <div className="ai-panel__overlay" onClick={onClose} />
      <div className="ai-panel">
        {/* Header */}
        <div className="ai-panel__header">
          <div className="ai-panel__header-left">
            <div className="ai-panel__avatar">✨</div>
            <div>
              <h3 className="ai-panel__title">AI Assistant</h3>
              <span className="ai-panel__status">
                {recCount > 0 && (
                  <button 
                    className="ai-panel__rec-count"
                    onClick={() => sendMessage('whats-missing', true)}
                    disabled={isTyping}
                    title="View suggestions"
                  >
                    {recCount} suggestions
                  </button>
                )}
              </span>
            </div>
          </div>
          <button className="ai-panel__close" onClick={onClose} aria-label="Close assistant">
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="ai-panel__messages">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`ai-msg ai-msg--${msg.role}`}
            >
              {msg.role === 'assistant' && (
                <div className="ai-msg__avatar">✨</div>
              )}
              <div className="ai-msg__bubble">
                <MessageContent content={msg.content} />
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="ai-msg ai-msg--assistant">
              <div className="ai-msg__avatar">✨</div>
              <div className="ai-msg__bubble ai-msg__bubble--typing">
                <div className="typing-indicator">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="ai-panel__quick-actions">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.id}
              className="ai-quick-btn"
              onClick={() => sendMessage(action.id, true)}
              disabled={isTyping}
            >
              <span>{action.icon}</span>
              <span>{action.label}</span>
            </button>
          ))}
        </div>

        {/* Input */}
        <form className="ai-panel__input-area" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            className="ai-panel__input"
            placeholder="Ask about technologies, architecture..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
          />
          <button
            type="submit"
            className="ai-panel__send"
            disabled={!input.trim() || isTyping}
            aria-label="Send message"
          >
            ➤
          </button>
        </form>
      </div>
    </>
  );
}

// ─── Simple Markdown-like Renderer ───────────────────────────────────

function MessageContent({ content }: { content: string }) {
  // Very simple markdown rendering — bold, headers, lists, blockquotes, tables
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inTable = false;
  let tableRows: string[][] = [];

  const flushTable = () => {
    if (tableRows.length > 0) {
      elements.push(
        <table key={`table-${elements.length}`} className="ai-msg__table">
          <thead>
            <tr>
              {tableRows[0].map((cell, i) => (
                <th key={i}>{renderInline(cell.trim())}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.slice(2).map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci}>{renderInline(cell.trim())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>,
      );
      tableRows = [];
    }
    inTable = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Table detection
    if (line.startsWith('|')) {
      inTable = true;
      const cells = line.split('|').filter(Boolean);
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Headers
    if (line.startsWith('## ')) {
      elements.push(
        <h4 key={i} className="ai-msg__heading">
          {renderInline(line.slice(3))}
        </h4>,
      );
    } else if (line.startsWith('  • ') || line.startsWith('  - ')) {
      elements.push(
        <div key={i} className="ai-msg__list-item ai-msg__list-item--nested">
          {renderInline(line.slice(4))}
        </div>,
      );
    } else if (line.startsWith('- ') || line.startsWith('• ')) {
      elements.push(
        <div key={i} className="ai-msg__list-item">
          {renderInline(line.slice(2))}
        </div>,
      );
    } else if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={i} className="ai-msg__quote">
          {renderInline(line.slice(2))}
        </blockquote>,
      );
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="ai-msg__spacer" />);
    } else {
      elements.push(
        <p key={i} className="ai-msg__text">
          {renderInline(line)}
        </p>,
      );
    }
  }

  if (inTable) flushTable();

  return <>{elements}</>;
}

/** Render bold text within a line */
function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}
