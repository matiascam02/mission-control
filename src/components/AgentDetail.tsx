'use client';

import { useState, useEffect, useRef } from 'react';
import { ConvexAgent, ConvexActivity } from '@/lib/convex-types';
import { X, Send, Zap, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { AgentSprite, hasSprite } from './AgentSprite';

interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

interface AgentDetailProps {
  agent: ConvexAgent;
  activities: ConvexActivity[];
  onClose: () => void;
}

// Agent skills
const agentSkills: Record<string, string[]> = {
  hoyuelo: ['Coordination', 'Delegation', 'Growth'],
  reigen: ['Strategy', 'Decisions', 'Architecture'],
  robin: ['Research', 'Analysis', 'Trends'],
  franky: ['Coding', 'Docker', 'APIs'],
  nanami: ['Projects', 'Planning', 'Tracking'],
  frieren: ['Docs', 'Writing', 'Archives'],
  maomao: ['Review', 'Bugs', 'Security'],
  rimuru: ['UI/UX', 'Frontend', 'Design'],
};

// Agent quotes (RPG style)
const agentQuotes: Record<string, string> = {
  hoyuelo: '"I\'m here to help you grow, not just complete tasks!"',
  reigen: '"Leave it to me! This is exactly my specialty."',
  robin: '"I find the truth fascinating... even the dark parts."',
  franky: '"This week\'s SUPER is you asking for help!"',
  nanami: '"Let\'s keep this efficient. Time is money."',
  frieren: '"Take your time... I\'m not going anywhere."',
  maomao: '"Hmm? Something caught my attention..."',
  rimuru: '"Great Sage, analyze! ...I\'ve got this."',
};

const statusConfig: Record<string, { color: string; label: string; glow: string }> = {
  idle: { color: 'bg-zinc-500', label: 'Idle', glow: '' },
  working: { color: 'bg-emerald-500', label: 'Working', glow: 'shadow-emerald-500/50 shadow-lg' },
  done: { color: 'bg-blue-500', label: 'Done', glow: '' },
  blocked: { color: 'bg-red-500', label: 'Blocked', glow: 'shadow-red-500/50 shadow-lg' },
};

export function AgentDetail({ agent, activities, onClose }: AgentDetailProps) {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const spriteKey = agent.name.toLowerCase();
  const skills = agentSkills[spriteKey] || [];
  const quote = agentQuotes[spriteKey] || '"Ready to assist."';
  const status = statusConfig[agent.status] || statusConfig.idle;

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  async function sendMessage() {
    if (!message.trim() || sending) return;
    const userMsg = message.trim();
    setMessage('');
    setSending(true);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userMsg,
      timestamp: new Date(),
    };
    setChatHistory(prev => [...prev, userMessage]);

    try {
      const res = await fetch('/api/agent-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: agent._id, message: userMsg }),
      });
      const data = await res.json();

      const agentResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: res.ok ? data.response : `Could not reach agent: ${data.error || 'Unknown error'}`,
        timestamp: new Date(),
      };
      setChatHistory(prev => [...prev, agentResponse]);
    } catch (error) {
      console.error('Failed to send:', error);
      setChatHistory(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: 'Network error: could not connect to the server.',
        timestamp: new Date(),
      }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />

      {/* RPG-style Character Card */}
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#1a1a24] to-[#0f0f14] border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-scale-in">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors z-10"
        >
          <X size={18} className="text-zinc-400" />
        </button>

        {/* Character Header - RPG Style */}
        <div className="relative p-6 pb-4">
          <div className="flex items-start gap-4">
            {/* Avatar Frame - Large sprite or image */}
            <div className="relative flex-shrink-0">
              <div
                className={`w-28 h-28 rounded-xl overflow-hidden border-2 ${status.glow} flex items-center justify-center`}
                style={{
                  borderColor: agent.color || '#3b82f6',
                  backgroundColor: hasSprite(spriteKey) ? 'transparent' : (agent.color || '#3b82f6') + '20'
                }}
              >
                {hasSprite(spriteKey) ? (
                  <AgentSprite
                    agentId={spriteKey}
                    status={agent.status as any}
                    size={112}
                  />
                ) : agent.avatar_url ? (
                  <Image
                    src={agent.avatar_url}
                    alt={agent.name}
                    width={112}
                    height={112}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="text-4xl">{agent.emoji}</span>
                )}
              </div>
              {/* Status Badge */}
              <div className={`absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${status.color} text-white`}>
                {status.label}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-white">{agent.name}</h2>
                <span className="text-xl">{agent.emoji}</span>
              </div>
              <p className="text-xs text-zinc-500 mb-2">{agent.role}</p>
              <p className="text-[11px] text-zinc-600 italic">{agent.anime}</p>

              {/* Level Badge */}
              <div className="mt-2">
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                  agent.level === 'LEAD'
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                }`}>
                  {agent.level === 'LEAD' ? 'LEAD' : `LVL ${agent.level}`}
                </span>
              </div>
            </div>
          </div>

          {/* Quote */}
          <div className="mt-4 p-3 rounded-xl bg-black/30 border border-white/5">
            <p className="text-sm text-zinc-400 italic">{quote}</p>
          </div>
        </div>

        {/* Skills */}
        <div className="px-6 pb-3">
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill, i) => (
              <span
                key={i}
                className="px-2 py-1 rounded-lg text-[11px] font-medium bg-white/5 text-zinc-400 border border-white/10"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Current Task */}
        {agent.current_task && (
          <div className="mx-6 mb-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2 text-emerald-400 text-xs mb-1">
              <Zap size={12} />
              <span className="font-medium">Working on:</span>
            </div>
            <p className="text-sm text-white">{agent.current_task}</p>
          </div>
        )}

        {/* Divider */}
        <div className="mx-6 border-t border-white/5" />

        {/* Chat Section */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle size={14} className="text-zinc-500" />
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Talk to {agent.name}
            </span>
            <span className="ml-auto text-[10px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          </div>

          {/* Messages */}
          <div className="h-36 overflow-y-auto rounded-xl bg-black/30 p-3 mb-3 space-y-2">
            {chatHistory.length === 0 ? (
              <div className="flex items-center justify-center h-full text-zinc-600 text-sm">
                Say hello to {agent.name}!
              </div>
            ) : (
              chatHistory.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                    msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white/10 text-zinc-300'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            {sending && (
              <div className="flex justify-end">
                <div className="px-3 py-2 rounded-xl bg-blue-600/50 text-white/70 text-sm animate-pulse">
                  sending...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={`Message ${agent.name}...`}
              className="flex-1 px-4 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white placeholder:text-zinc-600 text-sm outline-none focus:border-white/20"
            />
            <button
              onClick={sendMessage}
              disabled={!message.trim() || sending}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={16} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
