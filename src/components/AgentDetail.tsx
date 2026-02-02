'use client';

import { useState, useEffect, useRef } from 'react';
import { DbAgent, DbActivity, supabase } from '@/lib/supabase';
import { X, MessageCircle, Sparkles, Send, Clock, Zap, Cpu } from 'lucide-react';
import Image from 'next/image';

interface ChatMessage {
  id: string;
  agent_id: string;
  role: 'user' | 'agent';
  content: string;
  created_at: string;
}

interface AgentDetailProps {
  agent: DbAgent;
  activities: DbActivity[];
  onClose: () => void;
}

// Agent skills mapping
const agentSkills: Record<string, string[]> = {
  hoyuelo: ['Lead Coordination', 'Task Delegation', 'Squad Management'],
  reigen: ['Business Strategy', 'Decision Trees', 'Architecture Design'],
  robin: ['Deep Research', 'Exa Search', 'DeepWiki', 'Trend Analysis'],
  franky: ['Coding', 'Docker', 'API Development', 'Testing'],
  nanami: ['Project Management', 'Task Tracking', 'Sprint Planning'],
  frieren: ['Documentation', 'Code Comments', 'Technical Writing'],
  maomao: ['Code Review', 'Bug Detection', 'Security Vetting'],
  rimuru: ['UI/UX Design', 'Frontend Dev', 'Visual Systems'],
};

// Agent personalities
const agentPersonalities: Record<string, string> = {
  hoyuelo: "Mischievous green spirit from Mob Psycho 100. Helps you grow, not just complete tasks. Cheeky but reliable.",
  reigen: "Self-proclaimed greatest psychic. Confident, charismatic, surprisingly insightful. Business hustle energy.",
  robin: "Calm archaeologist who loves digging deep. Dark humor, thorough research, finds what others miss.",
  franky: "SUPER! cyborg shipwright. Builds things that work. Loud, proud, and surprisingly emotional.",
  nanami: "Serious salaryman sorcerer. Hates overtime, loves efficiency. Gets things done properly.",
  frieren: "Ancient elf mage. Patient, methodical, sees the long view. Quietly powerful.",
  maomao: "Curious apothecary. Investigates everything. Notices details others miss. Poison expert.",
  rimuru: "Friendly slime who became a nation builder. Analytical, adaptive, thinks at scale.",
};

const statusColors: Record<string, string> = {
  idle: 'bg-zinc-500',
  working: 'bg-emerald-500',
  done: 'bg-blue-500',
  blocked: 'bg-red-500',
};

export function AgentDetail({ agent, activities, onClose }: AgentDetailProps) {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const skills = agentSkills[agent.id] || [];
  const personality = agentPersonalities[agent.id] || 'A helpful AI agent.';
  const agentActivities = activities.filter(a => a.agent_id === agent.id).slice(0, 5);

  // Load chat history
  useEffect(() => {
    async function loadMessages() {
      try {
        const res = await fetch(`/api/chat?agent_id=${agent.id}&limit=50`);
        const data = await res.json();
        if (data.messages) {
          setChatHistory(data.messages);
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setLoading(false);
      }
    }
    loadMessages();
  }, [agent.id]);

  // Subscribe to new messages
  useEffect(() => {
    const channel = supabase
      .channel(`chat-${agent.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `agent_id=eq.${agent.id}`,
        },
        (payload) => {
          setChatHistory((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [agent.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  async function sendMessage() {
    if (!message.trim() || sending) return;

    const userMsg = message.trim();
    setMessage('');
    setSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: agent.id,
          content: userMsg,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Show error to user
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-[#0f0f14] border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-scale-in">
        {/* Header with Avatar */}
        <div className="relative h-48 bg-gradient-to-br from-zinc-900 to-black overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-30">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, ${agent.color}40 1px, transparent 0)`,
                backgroundSize: '32px 32px',
              }}
            />
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-black/50 hover:bg-black/70 transition-colors z-10"
          >
            <X size={20} className="text-zinc-400" />
          </button>

          {/* Avatar */}
          <div className="absolute -bottom-12 left-6">
            <div className="relative">
              <div
                className="w-28 h-28 rounded-2xl overflow-hidden border-4 shadow-xl"
                style={{ borderColor: agent.color || '#3b82f6' }}
              >
                {agent.avatar_url ? (
                  <Image
                    src={agent.avatar_url}
                    alt={agent.name}
                    width={112}
                    height={112}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-4xl"
                    style={{ backgroundColor: agent.color || '#3b82f6' }}
                  >
                    {agent.emoji}
                  </div>
                )}
              </div>
              {/* Status indicator */}
              <div
                className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${statusColors[agent.status]} border-4 border-[#0f0f14]`}
              >
                {agent.status === 'working' && (
                  <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-50" />
                )}
              </div>
            </div>
          </div>

          {/* Level badge */}
          <div className="absolute bottom-4 right-6">
            <span
              className={`px-3 py-1 rounded-lg text-xs font-bold ${
                agent.level === 'LEAD'
                  ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border border-yellow-500/30'
                  : 'bg-white/10 text-zinc-400 border border-white/10'
              }`}
            >
              {agent.level}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="pt-16 px-6 pb-6">
          {/* Name & Role */}
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-white">{agent.name}</h2>
              <span className="text-2xl">{agent.emoji}</span>
            </div>
            <p className="text-sm text-zinc-500">
              {agent.role} • {agent.anime}
            </p>
          </div>

          {/* Current Status */}
          {agent.current_task && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-2 text-emerald-400 text-sm">
                <Zap size={14} />
                <span className="font-medium">Currently working on:</span>
              </div>
              <p className="text-white mt-1">{agent.current_task}</p>
            </div>
          )}

          {/* Tabs content */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Personality */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <Sparkles size={12} />
                Personality
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">
                {personality}
              </p>
            </div>

            {/* Skills */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <Cpu size={12} />
                Skills
              </div>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 rounded-lg text-xs font-medium bg-white/5 text-zinc-400 border border-white/5"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mb-4 p-4 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Clock size={12} />
              Recent Activity
            </div>
            {agentActivities.length > 0 ? (
              <div className="space-y-2">
                {agentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-2 text-sm"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 mt-2" />
                    <div>
                      <span className="text-zinc-300">{activity.message}</span>
                      <span className="text-zinc-600 text-xs ml-2">
                        {new Date(activity.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-zinc-600 text-sm">No recent activity</p>
            )}
          </div>

          {/* Chat Interface */}
          <div className="rounded-xl bg-white/5 border border-white/5 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5">
              <MessageCircle size={14} className="text-zinc-400" />
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Talk to {agent.name}
              </span>
              <span className="ml-auto text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>

            {/* Chat messages */}
            <div className="h-40 overflow-y-auto p-3 space-y-2">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <span className="text-zinc-500 text-sm">Loading...</span>
                </div>
              ) : chatHistory.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                  <span className="text-zinc-600 text-sm">
                    Start a conversation with {agent.name}
                  </span>
                </div>
              ) : (
                chatHistory.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white/10 text-zinc-300'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              {sending && (
                <div className="flex justify-end">
                  <div className="px-3 py-2 rounded-xl bg-blue-600/50 text-white/70 text-sm">
                    <span className="animate-pulse">sending...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={`Ask ${agent.name} something...`}
                  className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-600 text-sm outline-none focus:border-white/20 transition-colors"
                />
                <button
                  onClick={sendMessage}
                  disabled={!message.trim() || sending}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={16} className="text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
