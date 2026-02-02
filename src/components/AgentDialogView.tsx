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

// Unique greetings based on anime personalities
const AGENT_GREETINGS: Record<string, string> = {
  'franky': "SUUUPER! I'm Franky, the shipwright! Need something built? I'm your cyborg! 🤖⭐",
  'reigen': "Ah, welcome! I'm Reigen, your strategic consultant. Let me show you the path to success... for a reasonable fee. 😏✨",
  'robin': "Fufufu~ I'm Robin. I find history and research fascinating. What mystery shall we uncover today? 📚🌸",
  'nanami': "I'm Nanami. Let's keep this professional and efficient. Time is money, after all. ⏰💼",
  'frieren': "...Oh, hello. I'm Frieren. I've been documenting things for about a thousand years. What do you need? ❄️📜",
  'maomao': "Hmm? I'm Maomao. If it's poison or code bugs you're worried about, I'll analyze it thoroughly. 🧪🔍",
  'rimuru': "Yo! Rimuru here! I used to be a slime, now I design interfaces. Life's weird like that! 🔵✨",
  'hoyuelo': "¡Hola! Soy Hoyuelo, el espíritu que todo lo ve. ¿En qué puedo ayudarte? 😊👻",
};

function getAgentGreeting(agentId: string, agentName: string): string {
  return AGENT_GREETINGS[agentId.toLowerCase()] || `Hey! I'm ${agentName}. What's up?`;
}

export function AgentDialogView({ agent, onClose }: AgentDialogViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Reset messages when agent changes
  useEffect(() => {
    setMessages([
      {
        id: '0',
        role: 'agent',
        content: getAgentGreeting(agent.id, agent.name),
        timestamp: new Date(),
      }
    ]);
    setCurrentMessageIndex(0);
  }, [agent.id, agent.name]);
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
      // Call the agent chat API
      const response = await fetch('/api/agent-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: agent.id,
          message: input.trim(),
        }),
      });

      const data = await response.json();
      
      let responseContent: string;
      if (!response.ok) {
        // Handle API errors gracefully
        responseContent = data.error === 'Gateway not configured' 
          ? "⚠️ The gateway isn't configured yet. Ask Matias to set OPENCLAW_GATEWAY_URL and OPENCLAW_GATEWAY_TOKEN in Railway."
          : `⚠️ Couldn't reach the agent: ${data.error || 'Unknown error'}`;
      } else {
        responseContent = data.response;
      }
      
      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: responseContent,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, agentResponse]);
      setCurrentMessageIndex(prev => prev + 1);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Show error in chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: `⚠️ Network error: couldn't connect to the server. Try again?`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      setCurrentMessageIndex(prev => prev + 1);
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

  // Background color based on agent with heavy pop overlay
  const bgGradient = `linear-gradient(135deg, ${agent.color || '#3b82f6'}30 0%, #0a0a0a 90%)`;
  const popColor = agent.color || '#3b82f6';

  return (
    <>
      {/* Backdrop with blur and noise pattern */}
      <div 
        className="fixed inset-0 bg-black/90 backdrop-blur-xl z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Main Dialog Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="w-full h-full relative pointer-events-auto animate-slide-up">
          
          {/* Background with themed gradient and dot pattern */}
          <div 
            className="absolute inset-0 opacity-80"
            style={{ 
              background: bgGradient,
              backgroundImage: `
                radial-gradient(${popColor}20 1px, transparent 1px),
                linear-gradient(to right, ${popColor}05 1px, transparent 1px)
              `,
              backgroundSize: '30px 30px, 100px 100%'
            }}
          />
          
          {/* Moving diagonal lines overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" 
               style={{
                 backgroundImage: `repeating-linear-gradient(45deg, ${popColor}, ${popColor} 10px, transparent 10px, transparent 20px)`
               }}
          />

          {/* Close button - Styled like a trigger */}
          <button
            onClick={onClose}
            className="absolute top-8 right-8 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:rotate-90 hover:scale-110 border-2 border-white/20 backdrop-blur-md group"
          >
            <X size={24} className="text-white group-hover:text-red-400 transition-colors" />
          </button>

          {/* Character Sprite - Large, breathing, floating */}
          <div className="absolute left-[5%] md:left-[10%] top-1/2 -translate-y-1/2 animate-slide-in-left origin-bottom">
            <div className="relative animate-float">
              {/* Explosive background behind sprite */}
              <div 
                className="absolute inset-0 blur-3xl opacity-30 animate-pulse"
                style={{ backgroundColor: popColor }}
              />
              
              {/* Sprite container with breathing animation - 15% smaller */}
              <div className="relative w-[255px] h-[255px] md:w-[425px] md:h-[425px] flex items-center justify-center animate-breathe">
                <AgentSprite 
                  agentId={agent.id} 
                  status={agent.status as any}
                  size={408}
                  className="drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]"
                />
              </div>
            </div>
          </div>

          {/* Dialog Text Box - Bottom with Tech Border */}
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-12 animate-slide-up-delayed">
            
            <div className="max-w-4xl mx-auto relative">
              {/* Decorative elements */}
              <div 
                className="absolute -top-16 left-0 w-32 h-1 animate-pulse" 
                style={{ backgroundColor: popColor }} 
              />
              <div 
                className="absolute -top-12 left-0 w-16 h-1 opacity-50" 
                style={{ backgroundColor: popColor }} 
              />

              {/* Name plate and Role Badge - Inline, no gap */}
              <div className="relative z-10 flex items-end gap-0">
                {/* Name plate - Angled */}
                <div className="inline-block transform -skew-x-12 mb-[-4px]">
                  <div 
                    className="px-8 py-2 font-black text-xl text-white shadow-lg border-t-2 border-l-2 border-r-2 border-white/20"
                    style={{ 
                      backgroundColor: popColor,
                      boxShadow: `0 0 20px ${popColor}50`
                    }}
                  >
                    <span className="transform skew-x-12 inline-block tracking-widest uppercase">
                      {agent.name}
                    </span>
                  </div>
                </div>
                
                {/* Role Badge */}
                <div className="inline-block transform -skew-x-12 mb-[-4px] ml-[-4px]">
                   <div className="px-4 py-1 bg-yellow-400 text-black text-xs font-black uppercase tracking-widest shadow-lg">
                     <span className="transform skew-x-12 inline-block">
                       {currentMessage?.role === 'agent' ? '/// SPEAKING' : '/// YOU'}
                     </span>
                   </div>
                </div>
              </div>

              {/* Main text box container */}
              <div 
                className="relative bg-black/90 border-t-4 border-b-4 backdrop-blur-xl p-8 min-h-[200px] cursor-pointer group shadow-2xl"
                style={{ borderColor: popColor }}
                onClick={handleTextBoxClick}
              >
                {/* Tech corners */}
                <div className="absolute top-0 left-0 w-4 h-4 border-l-4 border-t-4 border-white" />
                <div className="absolute top-0 right-0 w-4 h-4 border-r-4 border-t-4 border-white" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-l-4 border-b-4 border-white" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-r-4 border-b-4 border-white" />

                {/* Text Content */}
                <div className="relative z-10">
                  <p className="text-white text-xl md:text-2xl leading-relaxed font-medium font-sans tracking-wide drop-shadow-md">
                    <span className={isTyping ? "text-white" : "text-white/90"}>
                      {displayedText}
                    </span>
                    {isTyping && <span className="inline-block w-3 h-6 bg-white ml-2 animate-pulse" />}
                  </p>
                </div>

                {/* Navigation controls */}
                {!isTyping && (
                  <div className="absolute bottom-4 right-8 flex items-center gap-4 animate-pop">
                    <div className="text-xs text-white/40 font-mono tracking-widest">
                      MSG_ID: {currentMessageIndex + 1}/{messages.length}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                        disabled={!hasPrev}
                        className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/20 disabled:opacity-20 rounded-full transition-all hover:scale-110 border border-white/10"
                      >
                        ←
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleNext(); }}
                        disabled={!hasNext}
                        className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/20 disabled:opacity-20 rounded-full transition-all hover:scale-110 border border-white/10"
                      >
                        →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Input area - Floating below */}
              <div className="mt-6 flex gap-4 transform translate-y-2">
                <div className="flex-1 relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-white/20 to-white/5 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-200" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter your argument..."
                    disabled={isSending}
                    className="relative w-full px-6 py-4 bg-black/80 border-2 border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-all text-lg font-medium"
                    style={{ 
                      boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)'
                    }}
                  />
                </div>
                
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isSending}
                  className="px-8 py-4 rounded-xl font-black text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transform hover:-translate-y-1 active:translate-y-0"
                  style={{ 
                    backgroundColor: popColor,
                    boxShadow: input.trim() && !isSending 
                      ? `0 10px 0 ${popColor}50, 0 10px 20px rgba(0,0,0,0.5)` 
                      : 'none',
                    borderBottom: `4px solid rgba(0,0,0,0.2)`
                  }}
                >
                  {isSending ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : (
                    <Send size={24} className="transform -rotate-12" />
                  )}
                  <span className="uppercase tracking-wider">Shoot!</span>
                </button>
              </div>
            </div>
          </div>

          {/* Top Info Bar */}
          <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start pointer-events-none">
            {/* Agent Role Card */}
            <div className="bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-br-2xl border-l-4 transform animate-slide-in-left"
                 style={{ borderLeftColor: popColor }}>
              <div className="text-xs text-white/50 uppercase tracking-widest mb-1 font-mono">Ultimate Talent</div>
              <div className="text-lg text-white font-bold uppercase tracking-wide">{agent.role}</div>
            </div>

            {/* Scene Indicator */}
            <div className="bg-black/80 backdrop-blur-md border border-white/10 px-6 py-2 rounded-bl-2xl flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_#ef4444]" />
              <div className="text-sm text-white font-black tracking-widest">NONSTOP DEBATE</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
