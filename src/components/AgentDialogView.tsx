'use client';

import { useState, useEffect, useRef } from 'react';
import { DbAgent } from '@/lib/supabase';
import { AgentSprite } from './AgentSprite';
import { X, Send, Loader2 } from 'lucide-react';

interface AgentDialogViewProps {
  agent: DbAgent;
  onClose: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

export function AgentDialogView({ agent, onClose }: AgentDialogViewProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'agent',
      content: `Hey! I'm ${agent.name}. What's up?`,
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const currentMessage = messages[currentMessageIndex];
  const hasNext = currentMessageIndex < messages.length - 1;
  const hasPrev = currentMessageIndex > 0;

  // Typewriter effect for current message
  useEffect(() => {
    if (!currentMessage) return;
    
    setIsTyping(true);
    setDisplayedText('');
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      if (currentIndex < currentMessage.content.length) {
        setDisplayedText(currentMessage.content.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 30); // 30ms per character for typewriter effect

    return () => clearInterval(interval);
  }, [currentMessage]);

  // Navigate through message history
  const handleNext = () => {
    if (hasNext) {
      setCurrentMessageIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (hasPrev) {
      setCurrentMessageIndex(prev => prev - 1);
    }
  };

  // Skip typewriter effect on click
  const handleTextBoxClick = () => {
    if (isTyping) {
      setDisplayedText(currentMessage.content);
      setIsTyping(false);
    }
  };

  // Send message to agent
  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsSending(true);
    setCurrentMessageIndex(messages.length); // Jump to user message

    try {
      // TODO: Integrate with sessions_send API
      // For now, mock response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: `I hear you! That's interesting. Let me think about that...`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, agentResponse]);
      setCurrentMessageIndex(prev => prev + 1);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Background color based on agent
  const bgGradient = `linear-gradient(135deg, ${agent.color || '#3b82f6'}15 0%, #0a0a0a 50%)`;

  return (
    <>
      {/* Backdrop with blur */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Main Dialog Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="w-full h-full relative pointer-events-auto animate-slide-up">
          
          {/* Background with themed gradient */}
          <div 
            className="absolute inset-0"
            style={{ background: bgGradient }}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-50 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors backdrop-blur-sm border border-white/20"
          >
            <X size={20} className="text-white" />
          </button>

          {/* Character Sprite - Large, centered-left */}
          <div className="absolute left-[10%] top-1/2 -translate-y-1/2 animate-slide-in-left">
            <div className="relative">
              {/* Glow effect behind sprite */}
              <div 
                className="absolute inset-0 blur-3xl opacity-50"
                style={{ backgroundColor: agent.color || '#3b82f6' }}
              />
              
              {/* Sprite container */}
              <div className="relative w-[400px] h-[400px] flex items-center justify-center">
                <AgentSprite 
                  agentId={agent.id} 
                  status={agent.status as any}
                  size={380}
                  className="drop-shadow-2xl"
                />
              </div>
            </div>
          </div>

          {/* Dialog Text Box - Bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-8 animate-slide-up-delayed">
            
            {/* Name plate */}
            <div className="mb-4 flex items-center gap-3">
              <div 
                className="px-6 py-2 rounded-t-xl font-bold text-lg backdrop-blur-md border-t-2 border-x-2 border-white/20"
                style={{ 
                  backgroundColor: agent.color || '#3b82f6',
                  color: 'white'
                }}
              >
                {agent.name}
              </div>
              <div className="px-4 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full uppercase tracking-wider">
                {currentMessage?.role === 'agent' ? 'Speaking' : 'You'}
              </div>
            </div>

            {/* Main text box */}
            <div 
              className="bg-black/80 backdrop-blur-md border-2 border-white/20 rounded-2xl p-8 min-h-[160px] cursor-pointer transition-colors hover:bg-black/85"
              onClick={handleTextBoxClick}
            >
              <p className="text-white text-xl leading-relaxed font-medium">
                {displayedText}
                {isTyping && <span className="inline-block w-2 h-5 bg-white ml-1 animate-pulse" />}
              </p>

              {/* Navigation controls */}
              {!isTyping && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex gap-2">
                    <button
                      onClick={handlePrev}
                      disabled={!hasPrev}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors text-sm text-white/70 font-medium"
                    >
                      ← Prev
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={!hasNext}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors text-sm text-white/70 font-medium"
                    >
                      Next →
                    </button>
                  </div>

                  <div className="text-xs text-white/40 font-mono">
                    {currentMessageIndex + 1} / {messages.length}
                  </div>
                </div>
              )}
            </div>

            {/* Input area */}
            <div className="mt-4 flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isSending}
                className="flex-1 px-6 py-4 bg-black/60 backdrop-blur-md border-2 border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-white/40 transition-colors disabled:opacity-50 text-lg"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isSending}
                className="px-8 py-4 rounded-xl font-bold text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                style={{ 
                  backgroundColor: agent.color || '#3b82f6',
                  boxShadow: input.trim() && !isSending ? `0 0 30px ${agent.color}50` : 'none'
                }}
              >
                {isSending ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Send size={20} />
                )}
                Send
              </button>
            </div>
          </div>

          {/* Agent info badge - top left */}
          <div className="absolute top-6 left-6 px-4 py-2 bg-black/60 backdrop-blur-md border border-white/20 rounded-xl">
            <div className="text-xs text-white/50 uppercase tracking-wider">Role</div>
            <div className="text-sm text-white font-semibold">{agent.role}</div>
          </div>

          {/* Chapter/Scene indicator - top right (before close button) */}
          <div className="absolute top-6 right-20 px-4 py-2 bg-black/60 backdrop-blur-md border border-white/20 rounded-xl flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <div className="text-sm text-white font-semibold">LIVE CHAT</div>
          </div>
        </div>
      </div>
    </>
  );
}
