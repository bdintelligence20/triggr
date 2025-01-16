export type ChatType = 'report' | 'request';

export interface ChatMessage {
  id: string;
  content: string;
  timestamp: string;
  sender: {
    name: string;
    avatar?: string;
    department?: string;
  };
  type: 'ai' | 'employee';
  status?: 'pending' | 'resolved';
  hubName?: string;
  isRead: boolean;
}

export interface ChatThread {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  type: 'ai' | 'employee';
  status?: 'pending' | 'resolved';
  hubName?: string;
  unreadCount: number;
  tags?: string[];
  sender: {
    name: string;
    avatar?: string;
    department?: string;
  };
}