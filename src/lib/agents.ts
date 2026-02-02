// Agent definitions for Mission Control
export type AgentStatus = 'idle' | 'working' | 'done' | 'blocked';
export type AgentLevel = 'LEAD' | 'SPC' | 'INT'; // Lead, Specialist, Intern

export interface Agent {
  id: string;
  name: string;
  role: string;
  anime: string;
  avatar: string;
  emoji: string;
  level: AgentLevel;
  status: AgentStatus;
  currentTask?: string;
  color: string;
}

export const agents: Agent[] = [
  {
    id: 'hoyuelo',
    name: 'Hoyuelo',
    role: 'Lead Coordinator',
    anime: 'Mob Psycho 100',
    avatar: '/avatars/dimple.jpg',
    emoji: '😊',
    level: 'LEAD',
    status: 'working',
    currentTask: 'Building Mission Control',
    color: '#22c55e', // green
  },
  {
    id: 'reigen',
    name: 'Reigen',
    role: 'Business & Strategy',
    anime: 'Mob Psycho 100',
    avatar: '/avatars/reigen.jpg',
    emoji: '🎩',
    level: 'SPC',
    status: 'idle',
    color: '#eab308', // yellow
  },
  {
    id: 'robin',
    name: 'Robin',
    role: 'Research & Analysis',
    anime: 'One Piece',
    avatar: '/avatars/robin.jpg',
    emoji: '📚',
    level: 'SPC',
    status: 'idle',
    color: '#8b5cf6', // purple
  },
  {
    id: 'franky',
    name: 'Franky',
    role: 'Developer',
    anime: 'One Piece',
    avatar: '/avatars/franky.jpg',
    emoji: '🤖',
    level: 'SPC',
    status: 'idle',
    color: '#3b82f6', // blue
  },
  {
    id: 'nanami',
    name: 'Nanami',
    role: 'Project Management',
    anime: 'Jujutsu Kaisen',
    avatar: '/avatars/nanami.jpg',
    emoji: '👔',
    level: 'SPC',
    status: 'idle',
    color: '#6366f1', // indigo
  },
  {
    id: 'frieren',
    name: 'Frieren',
    role: 'Documentation',
    anime: 'Frieren',
    avatar: '/avatars/frieren.jpg',
    emoji: '❄️',
    level: 'SPC',
    status: 'idle',
    color: '#06b6d4', // cyan
  },
  {
    id: 'maomao',
    name: 'Maomao',
    role: 'Code Review',
    anime: 'Apothecary Diaries',
    avatar: '/avatars/maomao.jpg',
    emoji: '🧪',
    level: 'SPC',
    status: 'idle',
    color: '#ec4899', // pink
  },
  {
    id: 'rimuru',
    name: 'Rimuru',
    role: 'UI/UX Lead',
    anime: 'Slime',
    avatar: '/avatars/rimuru.jpg',
    emoji: '🔵',
    level: 'SPC',
    status: 'done',
    currentTask: 'Property Management UI',
    color: '#0ea5e9', // sky
  },
];

export function getAgentById(id: string): Agent | undefined {
  return agents.find(a => a.id === id);
}

export function getActiveAgents(): Agent[] {
  return agents.filter(a => a.status === 'working');
}
