'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Loader2, Trash2, ChevronLeft, Bot, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface ChatSession {
  id: string;
  created_at: string;
}

interface AiConsultationProps {
  onBack: () => void;
}

export default function AiConsultation({ onBack }: AiConsultationProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchSessions(session.user.id);
      }
      setInitialLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) fetchSessions(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchSessions = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);
      setSessions(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMessages = async (sessionId: string) => {
    try {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });
      setMessages(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const createNewSession = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({ user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      setSessions([data, ...sessions]);
      setCurrentSession(data);
      setMessages([]);
    } catch (error) {
      toast.error('创建会话失败');
    }
  };

  const selectSession = (session: ChatSession) => {
    setCurrentSession(session);
    fetchMessages(session.id);
  };

  const deleteSession = async (sessionId: string) => {
    if (!confirm('确定删除这个对话吗？')) return;

    try {
      await supabase.from('chat_sessions').delete().eq('id', sessionId);
      setSessions(sessions.filter(s => s.id !== sessionId));
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
        setMessages([]);
      }
      toast.success('已删除');
    } catch (error) {
      toast.error('删除失败');
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !user) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    // 先创建会话（如果还没有）
    let session = currentSession;
    if (!session) {
      await createNewSession();
      session = sessions[0] || currentSession;
    }

    // 添加用户消息
    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newUserMsg]);

    try {
      // 调用 AI API
      const response = await fetch('/api/ai-consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage,
          history: messages.slice(-10), // 只传最近10条
        }),
      });
      const data = await response.json();

      if (data.error) throw new Error(data.error);

      // 添加 AI 回复
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMsg]);

      // 保存到数据库
      if (session) {
        await supabase.from('chat_messages').insert({
          session_id: session.id,
          role: 'user',
          content: userMessage,
        });
        await supabase.from('chat_messages').insert({
          session_id: session.id,
          role: 'assistant',
          content: data.reply,
        });
      }
    } catch (error: any) {
      toast.error(error.message || '发送失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-400">加载中…</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto h-[calc(100vh-2rem)] flex bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            返回
          </button>
          <button
            onClick={createNewSession}
            className="w-full py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
          >
            新建对话
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {sessions.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">暂无对话</p>
          ) : (
            <div className="space-y-1">
              {sessions.map(session => (
                <div
                  key={session.id}
                  className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    currentSession?.id === session.id
                      ? 'bg-gray-900 text-white'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  onClick={() => selectSession(session)}
                >
                  <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                    <MessageCircle className="w-4 h-4 shrink-0" />
                    <span className="text-sm truncate">
                      {new Date(session.created_at).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.id);
                    }}
                    className={`p-1 rounded hover:bg-red-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all ${
                      currentSession?.id === session.id ? 'text-gray-300' : 'text-gray-400'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Bot className="w-5 h-5" />
            AI 宠物健康顾问
          </h2>
          <p className="text-sm text-gray-500">可以问任何关于宠物健康的问题</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-2">你好！我是宠物健康顾问</p>
              <p className="text-gray-400 text-sm">有什么关于宠物健康的问题都可以问我</p>
            </div>
          ) : (
            messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-gray-900 text-white' : 'bg-blue-500 text-white'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`max-w-[70%] p-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-100 rounded-2xl p-3">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="输入你的问题..."
              rows={1}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none resize-none text-gray-900"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
