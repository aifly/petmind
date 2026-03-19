'use client';

import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, Pill, Utensils, Scissors, Syringe, Bell, Trash2, LogOut, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Reminder {
  id: string;
  user_id: string;
  title: string;
  type: 'medicine' | 'food' | 'grooming' | 'vaccine' | 'other';
  time: string;
  date: string;
  pet_name: string;
}

const reminderTypes = [
  { id: 'medicine', name: '喂药', icon: Pill, color: 'bg-red-500' },
  { id: 'food', name: '喂食', icon: Utensils, color: 'bg-amber-500' },
  { id: 'grooming', name: '美容', icon: Scissors, color: 'bg-purple-500' },
  { id: 'vaccine', name: '疫苗', icon: Syringe, color: 'bg-green-500' },
  { id: 'other', name: '其他', icon: Bell, color: 'bg-gray-500' },
];

const DAYS = ['日', '一', '二', '三', '四', '五', '六'];
const MONTHS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

interface PetCalendarProps {
  onBack: () => void;
}

export default function PetCalendar({ onBack }: PetCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [newReminder, setNewReminder] = useState({
    title: '',
    type: 'medicine' as Reminder['type'],
    time: '09:00',
    petName: '',
  });

  useEffect(() => {
    // 先获取 session，确保认证状态恢复
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchReminders(session.user.id);
      }
      setLoading(false);
    });

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchReminders(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchReminders = async (userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (error) throw error;
      setReminders(data || []);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getRemindersForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return reminders.filter(r => r.date === dateStr);
  };

  const addReminder = async () => {
    if (!newReminder.title.trim() || !selectedDate || !user) return;
    
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
    
    try {
      const { data, error } = await supabase
        .from('reminders')
        .insert({
          user_id: user.id,
          title: newReminder.title,
          type: newReminder.type,
          time: newReminder.time,
          date: dateStr,
          pet_name: newReminder.petName,
        })
        .select()
        .single();

      if (error) throw error;
      
      setReminders([...reminders, data]);
      setNewReminder({ title: '', type: 'medicine', time: '09:00', petName: '' });
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding reminder:', error);
      alert('添加失败，请重试');
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setReminders(reminders.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting reminder:', error);
      alert('删除失败，请重试');
    }
  };

  const selectedDateReminders = selectedDate
    ? reminders.filter(r => r.date === `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`)
    : [];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-900 px-6 py-5">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
              aria-label="返回"
            >
              <ChevronLeft className="w-5 h-5 text-gray-300" />
            </button>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                宠物日历
              </h2>
              <p className="text-gray-400 text-sm">记录和管理宠物日程提醒</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <User className="w-4 h-4" />
              <span className="max-w-[120px] truncate">{user?.email}</span>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
              aria-label="上个月"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h3 className="text-lg font-semibold text-gray-900">
              {year}年{MONTHS[month]}
            </h3>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
              aria-label="下个月"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Loading */}
          {loading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="text-gray-400">加载中…</div>
            </div>
          ) : (
            /* Calendar Grid */
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="h-20" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
                const dayReminders = getRemindersForDate(day);
                const isSelected = selectedDate === day;
                
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(day)}
                    className={`h-20 p-1 rounded-lg text-left transition-all focus:outline-none focus:ring-2 focus:ring-gray-400 ${
                      isSelected ? 'bg-gray-900 text-white' : 'hover:bg-gray-100'
                    } ${isToday && !isSelected ? 'bg-gray-100' : ''}`}
                  >
                    <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                      {day}
                    </span>
                    {dayReminders.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {dayReminders.slice(0, 2).map((r) => (
                          <div
                            key={r.id}
                            className={`text-xs truncate px-1 py-0.5 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}
                          >
                            {r.title}
                          </div>
                        ))}
                        {dayReminders.length > 2 && (
                          <div className={`text-xs ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>
                            +{dayReminders.length - 2}
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Date Reminders */}
        {selectedDate && !loading && (
          <div className="border-t border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">
                {year}年{month + 1}月{selectedDate}日
              </h3>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                添加提醒
              </button>
            </div>
            
            {selectedDateReminders.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">暂无提醒</p>
            ) : (
              <div className="space-y-2">
                {selectedDateReminders.map((reminder) => {
                  const typeInfo = reminderTypes.find(t => t.id === reminder.type);
                  const Icon = typeInfo?.icon || Bell;
                  return (
                    <div
                      key={reminder.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200"
                    >
                      <div className={`w-10 h-10 ${typeInfo?.color || 'bg-gray-500'} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" aria-hidden="true" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{reminder.title}</p>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" aria-hidden="true" />
                            {reminder.time}
                          </span>
                          {reminder.pet_name && <span>{reminder.pet_name}</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteReminder(reminder.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                        aria-label="删除提醒"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Add Reminder Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">添加提醒</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">提醒内容</label>
                  <input
                    type="text"
                    value={newReminder.title}
                    onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                    placeholder="如：驱虫、洗澡、打疫苗…"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none text-gray-900 placeholder-gray-400"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">提醒类型</label>
                  <div className="grid grid-cols-5 gap-2">
                    {reminderTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setNewReminder({ ...newReminder, type: type.id as Reminder['type'] })}
                        className={`p-2 rounded-lg text-center transition-all ${
                          newReminder.type === type.id
                            ? type.color + ' text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <type.icon className="w-4 h-4 mx-auto mb-1" aria-hidden="true" />
                        <span className="text-xs">{type.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">时间</label>
                    <input
                      type="time"
                      value={newReminder.time}
                      onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">宠物名字</label>
                    <input
                      type="text"
                      value={newReminder.petName}
                      onChange={(e) => setNewReminder({ ...newReminder, petName: e.target.value })}
                      placeholder="可选"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none text-gray-900 placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  取消
                </button>
                <button
                  onClick={addReminder}
                  className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
                >
                  添加
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
