import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, Send, Search, Building2, CheckCheck, ShieldCheck,
  ShieldAlert, Plus, X, GraduationCap
} from 'lucide-react';
import type { AuthUserSession, ConversationItem, DirectMessageItem } from '../../types/careerConnect';
import { careerConnectService } from '../../services/careerConnectService';

interface DirectMessagingViewProps {
  session: AuthUserSession;
  targetUser?: {
    id: string;
    name: string;
    role: string;
    companyOrDept?: string;
  } | null;
  onClearTarget?: () => void;
}

export interface DirectoryContact {
  id: string;
  name: string;
  role: 'student' | 'academician' | 'industry';
  department?: string;
  company?: string;
  title: string;
  affiliation: string;
}

export const INSTITUTION_DIRECTORY: DirectoryContact[] = [
  // Faculty Members across departments
  {
    id: 'fac-ce-1',
    name: 'Dr. Rajesh Sharma',
    role: 'academician',
    department: 'Computer Engineering',
    title: 'Professor & Head of Computer Engineering',
    affiliation: 'Government Engineering College, Modasa (GEC Modasa)'
  },
  {
    id: 'fac-it-1',
    name: 'Prof. Anita Desai',
    role: 'academician',
    department: 'Information Technology',
    title: 'Associate Professor & IT Coordinator',
    affiliation: 'Government Engineering College, Modasa (GEC Modasa)'
  },
  {
    id: 'fac-mech-1',
    name: 'Dr. K. Ramanathan',
    role: 'academician',
    department: 'Mechanical Engineering',
    title: 'Professor of Mechanical Engineering & CAD/CAM',
    affiliation: 'Government Engineering College, Modasa (GEC Modasa)'
  },
  {
    id: 'fac-civil-1',
    name: 'Prof. S. Sen',
    role: 'academician',
    department: 'Civil Engineering',
    title: 'Head of Civil Engineering Department',
    affiliation: 'Government Engineering College, Modasa (GEC Modasa)'
  },
  // Verified Industry Recruiters (Universal Reach)
  {
    id: 'rec-google-1',
    name: 'Priya Patel',
    role: 'industry',
    company: 'Google AI Labs',
    title: 'University Hiring Lead',
    affiliation: 'Google AI Labs'
  },
  {
    id: 'rec-msft-1',
    name: 'Rohit Verma',
    role: 'industry',
    company: 'Microsoft Campus Recruiting',
    title: 'Senior Technical Recruiter',
    affiliation: 'Microsoft'
  },
  {
    id: 'rec-aws-1',
    name: 'Sneha Kulkarni',
    role: 'industry',
    company: 'Amazon AWS Cloud',
    title: 'Talent Acquisition Partner',
    affiliation: 'Amazon Web Services'
  },
  // Students across departments
  {
    id: 'stu-ce-1',
    name: 'Ved Dhobi',
    role: 'student',
    department: 'Computer Engineering',
    title: 'B.Tech 6th Sem • Computer Engineering',
    affiliation: 'Government Engineering College, Modasa'
  },
  {
    id: 'stu-mech-1',
    name: 'Rahul Mehta',
    role: 'student',
    department: 'Mechanical Engineering',
    title: 'B.Tech 6th Sem • Mechanical Engineering',
    affiliation: 'Government Engineering College, Modasa'
  },
  {
    id: 'stu-civil-1',
    name: 'Neha Joshi',
    role: 'student',
    department: 'Civil Engineering',
    title: 'B.Tech 6th Sem • Civil Engineering',
    affiliation: 'Government Engineering College, Modasa'
  }
];

export const DirectMessagingView: React.FC<DirectMessagingViewProps> = ({
  session,
  targetUser,
  onClearTarget
}) => {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DirectMessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [showDirectoryModal, setShowDirectoryModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Subscribe to all user conversations
  useEffect(() => {
    if (!session?.id) return;
    const unsub = careerConnectService.subscribeUserConversations(session.id, (list) => {
      setConversations(list);
    });
    return () => unsub();
  }, [session?.id]);

  // 2. If targetUser is passed (e.g. from Feed or Talent Discovery), open/create conversation
  useEffect(() => {
    if (!targetUser || !session?.id) return;
    let isMounted = true;

    async function initTarget() {
      if (!targetUser) return;
      try {
        setPermissionError(null);
        const convId = await careerConnectService.getOrCreateConversation(
          session,
          targetUser.id,
          targetUser.name,
          targetUser.role,
          targetUser.companyOrDept
        );
        if (isMounted) {
          setActiveConvId(convId);
        }
      } catch (err: any) {
        if (isMounted) {
          setPermissionError(err.message || 'Departmental interaction restricted under institutional boundary policy.');
        }
      }
    }
    initTarget();

    return () => {
      isMounted = false;
    };
  }, [targetUser, session]);

  // 3. Set default active conversation if none selected
  useEffect(() => {
    if (!activeConvId && conversations.length > 0 && !permissionError) {
      setActiveConvId(conversations[0].id);
    }
  }, [conversations, activeConvId, permissionError]);

  // 4. Subscribe to messages of active conversation
  useEffect(() => {
    if (!activeConvId) {
      setMessages([]);
      return;
    }
    const unsub = careerConnectService.subscribeConversationMessages(activeConvId, (msgs) => {
      setMessages(msgs);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });
    return () => unsub();
  }, [activeConvId]);

  // Start conversation with selected directory contact
  const handleSelectContact = async (contact: DirectoryContact) => {
    try {
      setPermissionError(null);
      setShowDirectoryModal(false);
      const convId = await careerConnectService.getOrCreateConversation(
        session,
        contact.id,
        contact.name,
        contact.role,
        contact.company || contact.department
      );
      setActiveConvId(convId);
    } catch (err: any) {
      setPermissionError(err.message || 'Interaction restricted under institutional policy.');
    }
  };

  // Handle send message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || isSending || !activeConvId) return;

    // Find the other participant in active conversation
    const activeConv = conversations.find(c => c.id === activeConvId);
    let recipientId = '';
    let recipientName = 'User';
    let recipientRole = 'student';

    if (activeConv) {
      recipientId = activeConv.participants.find(p => p !== session.id) || '';
      const pData = activeConv.participantData?.[recipientId];
      if (pData) {
        recipientName = pData.name || recipientName;
        recipientRole = pData.role || recipientRole;
      }
    } else if (targetUser) {
      recipientId = targetUser.id;
      recipientName = targetUser.name;
      recipientRole = targetUser.role;
    }

    if (!recipientId) return;

    setIsSending(true);
    setInputText('');
    try {
      setPermissionError(null);
      await careerConnectService.sendDirectMessage(
        activeConvId,
        session,
        recipientId,
        recipientName,
        recipientRole,
        trimmed
      );
    } catch (err: any) {
      console.error('Failed to send direct message:', err);
      setPermissionError(err.message || 'Failed to send message.');
    } finally {
      setIsSending(false);
    }
  };

  // Get other participant details for a conversation
  const getOtherParticipant = (conv: ConversationItem) => {
    const otherId = conv.participants.find(p => p !== session.id) || '';
    const otherData = conv.participantData?.[otherId] || (conv.participantDetails as any)?.[otherId] || {
      name: 'Professional Contact',
      role: 'User',
      companyOrDept: ''
    };
    return { id: otherId, ...otherData };
  };

  const activeConv = conversations.find(c => c.id === activeConvId);
  const activeOther = activeConv ? getOtherParticipant(activeConv) : targetUser ? {
    id: targetUser.id,
    name: targetUser.name,
    role: targetUser.role,
    companyOrDept: targetUser.companyOrDept || ''
  } : null;

  const filteredConversations = conversations.filter(c => {
    if (!searchFilter.trim()) return true;
    const other = getOtherParticipant(c);
    const q = searchFilter.toLowerCase();
    return (
      other.name.toLowerCase().includes(q) ||
      (other.companyOrDept && other.companyOrDept.toLowerCase().includes(q)) ||
      (c.lastMessage && c.lastMessage.toLowerCase().includes(q))
    );
  });

  // Directory contacts split: authorized vs cross-department test
  const userDept = (session.department || 'Computer Engineering').toLowerCase();
  const sameDeptFaculty = INSTITUTION_DIRECTORY.filter(c => c.role === 'academician' && (c.department || '').toLowerCase() === userDept);
  const crossDeptFaculty = INSTITUTION_DIRECTORY.filter(c => c.role === 'academician' && (c.department || '').toLowerCase() !== userDept);
  const verifiedRecruiters = INSTITUTION_DIRECTORY.filter(c => c.role === 'industry');
  const allStudents = INSTITUTION_DIRECTORY.filter(c => c.role === 'student');

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Top Header */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200/90 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white border border-indigo-700 shadow-2xs">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900">Direct Professional Messages & Mentorship</h2>
            <p className="text-[11px] text-slate-600 font-medium">
              Verified communication between students, faculty mentors, and industry recruiters
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Firestore Realtime Sync
          </span>
          <button
            type="button"
            onClick={() => setShowDirectoryModal(true)}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Message</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* ── CONVERSATION LIST (LEFT) ── */}
        <div className="w-80 border-r border-slate-200/90 flex flex-col bg-white">
          {/* Search Contacts */}
          <div className="p-3 border-b border-slate-200/80 bg-slate-50/50 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white rounded-xl border border-slate-200/90 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowDirectoryModal(true)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              title="Start New Direct Message"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Conversation items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-200/30 custom-scrollbar">
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-slate-400">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40 text-amber-500" />
                <p className="text-xs font-bold text-slate-600">No active conversations</p>
                <p className="text-[11px] text-slate-400 mt-1 mb-3">
                  Connect with mentors or industry recruiters across Nova CareerConnect.
                </p>
                <button
                  type="button"
                  onClick={() => setShowDirectoryModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition cursor-pointer"
                >
                  Start Conversation
                </button>
              </div>
            ) : (
              filteredConversations.map((c) => {
                const other = getOtherParticipant(c);
                const isSelected = c.id === activeConvId && !permissionError;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setPermissionError(null);
                      setActiveConvId(c.id);
                      if (onClearTarget) onClearTarget();
                    }}
                    className={`w-full text-left p-3 transition-colors flex items-start gap-3 cursor-pointer ${
                      isSelected ? 'bg-amber-50/80 border-l-4 border-amber-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-xs">
                      {other.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {other.name}
                        </span>
                        {c.lastMessageTime && (
                          <span className="text-[9px] text-slate-400 font-mono whitespace-nowrap">
                            {new Date(c.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">
                        {other.companyOrDept || (other.role === 'industry' ? 'Recruiter' : other.role === 'academician' ? 'Faculty Mentor' : 'Student')}
                      </div>
                      <div className="text-[11px] text-slate-600 truncate mt-1">
                        {c.lastSenderId === session.id ? 'You: ' : ''}{c.lastMessage || 'Started conversation'}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── CHAT THREAD / RESTRICTION BARRIER (RIGHT) ── */}
        <div className="flex-1 flex flex-col bg-slate-50/30">
          {permissionError ? (
            /* ── INSTITUTIONAL POLICY BARRIER CARD ── */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/60 animate-fadeIn">
              <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 mb-3 shadow-xs">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-0.5 rounded bg-slate-200 text-slate-800 text-[10px] font-mono font-bold uppercase tracking-wide mb-2">
                INSTITUTIONAL ACCESS POLICY BOUNDARY
              </span>
              <h3 className="text-base font-bold text-slate-900 max-w-md">
                Cross-Department Mentorship Restricted
              </h3>
              <p className="text-xs text-slate-600 max-w-md mt-2 leading-relaxed font-medium">
                {permissionError}
              </p>

              <div className="mt-5 p-4 rounded-xl bg-white border border-slate-200 max-w-md text-left text-xs space-y-2 shadow-xs">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Platform Interaction Rules:</span>
                </div>
                <ul className="text-[11px] text-slate-600 space-y-1.5 list-disc list-inside">
                  <li><span className="font-bold text-slate-800">Same Department Mentorship:</span> Students can only initiate direct mentorship with faculty from their enrolled department (<span className="font-bold text-indigo-700">{session.department || 'Your Department'}</span>).</li>
                  <li><span className="font-bold text-slate-800">Recruiter Universal Reach:</span> Verified corporate recruiters can interact directly with students across all departments.</li>
                  <li><span className="font-bold text-slate-800">Universal Opportunity Broadcast:</span> Recruiter posts and placement drives are visible to all students institution-wide.</li>
                </ul>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPermissionError(null);
                    if (onClearTarget) onClearTarget();
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition cursor-pointer shadow-xs"
                >
                  Return to Conversations
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPermissionError(null);
                    setShowDirectoryModal(true);
                  }}
                  className="px-4 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold transition cursor-pointer"
                >
                  View Authorized Contacts
                </button>
              </div>
            </div>
          ) : activeOther ? (
            <>
              {/* Chat Header */}
              <div className="px-5 py-3 bg-white border-b border-slate-200/90 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {activeOther.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900">{activeOther.name}</span>
                      <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                        {activeOther.role}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      {activeOther.companyOrDept ? (
                        <>
                          <Building2 className="w-3 h-3 text-slate-400" />
                          <span>{activeOther.companyOrDept}</span>
                        </>
                      ) : (
                        <span>Connected on Nova CareerConnect</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified User
                  </span>
                </div>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 mb-3">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-700">No messages yet</p>
                    <p className="text-xs text-slate-500 max-w-xs mt-1">
                      Send a professional note to begin collaborating regarding opportunities or mentorship.
                    </p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.senderId === session.id;
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-end gap-2 max-w-[75%]">
                          {!isMe && (
                            <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-700 font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                              {m.senderName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div
                            className={`px-4 py-2.5 rounded-2xl text-xs shadow-2xs leading-relaxed ${
                              isMe
                                ? 'bg-indigo-600 text-white rounded-br-xs'
                                : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
                            }`}
                          >
                            {!isMe && (
                              <div className="text-[10px] font-bold text-indigo-900 mb-1 opacity-80">
                                {m.senderName}
                              </div>
                            )}
                            <div className="whitespace-pre-wrap break-words">{m.text}</div>
                            <div
                              className={`text-[9px] font-mono mt-1 text-right flex items-center justify-end gap-1 ${
                                isMe ? 'text-indigo-100' : 'text-slate-400'
                              }`}
                            >
                              <span>
                                {new Date(m.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              {isMe && <CheckCheck className="w-3 h-3 text-indigo-200" />}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Composer */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 bg-white border-t border-slate-200/90 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Write a message to ${activeOther.name}...`}
                  className="flex-1 px-4 py-2.5 text-xs bg-slate-50 rounded-xl border border-slate-200/90 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-slate-900"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isSending}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <MessageSquare className="w-12 h-12 text-indigo-500 opacity-50 mb-3" />
              <h3 className="text-sm font-bold text-slate-700">Select a Conversation</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
                Choose a conversation from the sidebar or select a verified mentor or recruiter from the directory.
              </p>
              <button
                type="button"
                onClick={() => setShowDirectoryModal(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
              >
                Start Direct Message
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── VERIFIED DIRECTORY PICKER MODAL ── */}
      {showDirectoryModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowDirectoryModal(false)}
        >
          <div
            className="bg-white rounded-3xl border border-slate-200/90 max-w-2xl w-full p-6 shadow-2xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">Select Professional Contact</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Institutional policy strictly governs mentorship and communication boundaries.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDirectoryModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-5 custom-scrollbar">
              {/* Section 1: Same-Department Faculty Mentors */}
              {session.role === 'student' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4" />
                      <span>{session.department || 'Computer Engineering'} Faculty Mentors (Allowed)</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Same Department
                    </span>
                  </div>
                  <div className="space-y-2">
                    {sameDeptFaculty.map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => handleSelectContact(f)}
                        className="w-full text-left p-3 rounded-2xl border border-slate-200/80 hover:border-indigo-400 hover:bg-indigo-50/40 transition flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-800 font-bold text-xs flex items-center justify-center">
                            {f.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">{f.name}</div>
                            <div className="text-[10px] text-slate-500">{f.title}</div>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-indigo-600">Message ↗</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 2: Verified Industry Recruiters (Universal Reach) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    <span>Verified Industry Recruiters (Universal Reach)</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    Open to All Students
                  </span>
                </div>
                <div className="space-y-2">
                  {verifiedRecruiters.map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleSelectContact(r)}
                      className="w-full text-left p-3 rounded-2xl border border-slate-200/80 hover:border-amber-400 hover:bg-amber-50/40 transition flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center">
                          {r.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">{r.name}</div>
                          <div className="text-[10px] text-slate-500">{r.company} • {r.title}</div>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-amber-700">Message Recruiter ↗</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Section 3: Cross-Department Restriction Test (For Verification) */}
              {session.role === 'student' && crossDeptFaculty.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4" />
                      <span>Test Policy Restriction: Cross-Department Faculty</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                      Restricted by Rule
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Clicking a faculty member outside your department will trigger the institutional policy boundary barrier.
                  </p>
                  <div className="space-y-2">
                    {crossDeptFaculty.map(cf => (
                      <button
                        key={cf.id}
                        type="button"
                        onClick={() => handleSelectContact(cf)}
                        className="w-full text-left p-3 rounded-2xl border border-rose-200 bg-rose-50/30 hover:bg-rose-50 transition flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-800 font-bold text-xs flex items-center justify-center">
                            {cf.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">{cf.name}</div>
                            <div className="text-[10px] text-rose-700 font-medium">{cf.department} • {cf.title}</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                          Policy Restricted
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 4: For Recruiters: Students across all departments */}
              {session.role === 'industry' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4" />
                      <span>Students Across All Departments (Universal Access)</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      All Departments
                    </span>
                  </div>
                  <div className="space-y-2">
                    {allStudents.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleSelectContact(s)}
                        className="w-full text-left p-3 rounded-2xl border border-slate-200/80 hover:border-emerald-400 hover:bg-emerald-50/40 transition flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                            {s.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">{s.name}</div>
                            <div className="text-[10px] text-slate-500">{s.department} • {s.title}</div>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-700">Message Candidate ↗</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
