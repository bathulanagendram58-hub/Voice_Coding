import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  BookmarkCheck,
  Code,
  GraduationCap,
  Settings,
  HelpCircle,
  LogOut,
  Trash2,
  Search,
  ChevronRight,
  Sparkles,
  Terminal,
  Calendar
} from 'lucide-react';
import { Conversation, SupportedLanguage, LearningLevel, User } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string, e: React.MouseEvent) => void;
  onOpenSavedPrograms: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  currentLanguage: SupportedLanguage;
  learningLevel: LearningLevel;
  onLearningLevelChange: (level: LearningLevel) => void;
  user: User | null;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onOpenSavedPrograms,
  onOpenSettings,
  onOpenHelp,
  onSelectLanguage,
  currentLanguage,
  learningLevel,
  onLearningLevelChange,
  user,
  onLogout,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Group conversations by Today, Yesterday, Older
  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;

  const todayChats: Conversation[] = [];
  const yesterdayChats: Conversation[] = [];
  const olderChats: Conversation[] = [];

  filteredConversations.forEach((conv) => {
    const time = new Date(conv.updated_at || conv.created_at).getTime();
    if (time >= todayStart) todayChats.push(conv);
    else if (time >= yesterdayStart) yesterdayChats.push(conv);
    else olderChats.push(conv);
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-72 bg-slate-950/95 border-r border-slate-800/80 flex flex-col transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-72'
        }`}
      >
        {/* Top: New Chat Action */}
        <div className="p-3 border-b border-slate-800/60">
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-slate-950 font-bold text-sm py-2.5 px-4 rounded-xl shadow-lg shadow-brand-500/20 transition-all active:scale-98"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Conversation</span>
          </button>

          {/* Search History */}
          <div className="relative mt-2.5">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search chat history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500/50"
            />
          </div>
        </div>

        {/* Middle: Chat History List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
          {conversations.length === 0 ? (
            <div className="text-center py-8 px-4">
              <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-500">
                <MessageSquare className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-400">No conversations yet</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Ask or speak a coding question to start!
              </p>
            </div>
          ) : (
            <>
              {/* Today */}
              {todayChats.length > 0 && (
                <div>
                  <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-2 mb-1.5 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-brand-400" />
                    Today
                  </h4>
                  <div className="space-y-1">
                    {todayChats.map((c) => (
                      <ChatListItem
                        key={c.id}
                        conversation={c}
                        isActive={c.id === activeConversationId}
                        onSelect={() => {
                          onSelectConversation(c.id);
                          onClose();
                        }}
                        onDelete={(e) => onDeleteConversation(c.id, e)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Yesterday */}
              {yesterdayChats.length > 0 && (
                <div>
                  <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-2 mb-1.5 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    Yesterday
                  </h4>
                  <div className="space-y-1">
                    {yesterdayChats.map((c) => (
                      <ChatListItem
                        key={c.id}
                        conversation={c}
                        isActive={c.id === activeConversationId}
                        onSelect={() => {
                          onSelectConversation(c.id);
                          onClose();
                        }}
                        onDelete={(e) => onDeleteConversation(c.id, e)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Older */}
              {olderChats.length > 0 && (
                <div>
                  <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-2 mb-1.5 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    Previous
                  </h4>
                  <div className="space-y-1">
                    {olderChats.map((c) => (
                      <ChatListItem
                        key={c.id}
                        conversation={c}
                        isActive={c.id === activeConversationId}
                        onSelect={() => {
                          onSelectConversation(c.id);
                          onClose();
                        }}
                        onDelete={(e) => onDeleteConversation(c.id, e)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Learning Level Quick Switch */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Learning Level</span>
            <span className={`text-[10px] font-bold ${
              learningLevel === 'Advanced' ? 'text-purple-400' : learningLevel === 'Intermediate' ? 'text-amber-400' : 'text-emerald-400'
            }`}>{learningLevel}</span>
          </div>
          <div className="grid grid-cols-3 gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs">
            {(['Beginner', 'Intermediate', 'Advanced'] as LearningLevel[]).map((lvl) => {
              const isSel = learningLevel === lvl;
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => onLearningLevelChange(lvl)}
                  className={`py-1 text-center rounded text-[11px] font-semibold transition-all ${
                    isSel
                      ? lvl === 'Beginner'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : lvl === 'Intermediate'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lvl}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Menu items */}
        <div className="p-3 border-t border-slate-800/80 space-y-1 bg-slate-950/60">
          <button
            onClick={onOpenSavedPrograms}
            className="w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-900 transition-colors"
          >
            <div className="flex items-center gap-2">
              <BookmarkCheck className="w-4 h-4 text-amber-400" />
              <span>Saved Programs</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </button>

          <button
            onClick={onOpenSettings}
            className="w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-900 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-cyan-400" />
              <span>Settings & Keys</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </button>

          <button
            onClick={onOpenHelp}
            className="w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-900 transition-colors"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <span>Help & Voice Commands</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {user && (
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2 p-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

interface ChatListItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

const ChatListItem: React.FC<ChatListItemProps> = ({ conversation, isActive, onSelect, onDelete }) => {
  return (
    <div
      onClick={onSelect}
      className={`group relative flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all ${
        isActive
          ? 'bg-slate-800/90 text-brand-300 border border-brand-500/30 shadow-sm'
          : 'text-slate-300 hover:bg-slate-900 hover:text-slate-100'
      }`}
    >
      <div className="flex items-center gap-2 truncate pr-6">
        <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-brand-400' : 'text-slate-500'}`} />
        <span className="truncate">{conversation.title || 'Untitled Conversation'}</span>
      </div>

      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-all absolute right-2"
        title="Delete conversation"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
};
