import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Plus, Send, Paperclip, Search, Trash2, Edit2, 
  Check, Bot, User, Sparkles, Loader2, BookOpen, X
} from 'lucide-react';
import type { Conversation, ChatMessage, DocumentItem } from '../../types';
import { api } from '../../services/api';

export const ChatWindow: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const [userDocs, setUserDocs] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [attachedDoc, setAttachedDoc] = useState<DocumentItem | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchConversations();
    fetchUserDocuments();
  }, []);

  useEffect(() => {
    if (activeConvId) {
      fetchMessages(activeConvId);
    }
  }, [activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const fetchConversations = async () => {
    try {
      const res = await api.get<Conversation[]>('/chat/conversations');
      setConversations(res.data);
      if (res.data.length > 0) {
        if (!activeConvId) setActiveConvId(res.data[0].id);
      } else {
        // Auto-create initial conversation if user has none yet
        await createInitialChat();
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  const createInitialChat = async () => {
    try {
      const res = await api.post<Conversation>('/chat/conversations', {
        title: 'New Conversation',
        document_id: selectedDocId || undefined
      });
      setConversations([res.data]);
      setActiveConvId(res.data.id);
      fetchMessages(res.data.id);
    } catch (err) {
      console.error('Failed to create initial chat:', err);
    }
  };

  const fetchUserDocuments = async () => {
    try {
      const res = await api.get<DocumentItem[]>('/documents');
      setUserDocs(res.data);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const res = await api.get<ChatMessage[]>(`/chat/conversations/${convId}/messages`);
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const handleCreateNewChat = async () => {
    try {
      const res = await api.post<Conversation>('/chat/conversations', {
        title: 'New Conversation',
        document_id: attachedDoc?.id || selectedDocId || undefined
      });
      setConversations([res.data, ...conversations]);
      setActiveConvId(res.data.id);
      fetchMessages(res.data.id);
    } catch (err) {
      console.error('Failed to create new chat:', err);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputMessage.trim();
    if (!text || loading) return;

    setInputMessage('');
    let currentConvId = activeConvId;

    // If no active conversation exists, create one on the fly!
    if (!currentConvId) {
      try {
        const newConvRes = await api.post<Conversation>('/chat/conversations', {
          title: text.length > 30 ? text.substring(0, 30) + '...' : text,
          document_id: attachedDoc?.id || selectedDocId || undefined
        });
        const newConv = newConvRes.data;
        currentConvId = newConv.id;
        setActiveConvId(newConv.id);
        setConversations((prev) => [newConv, ...prev]);
      } catch (err) {
        console.error('Failed to create conversation on the fly:', err);
        alert('Could not start conversation session. Please try again.');
        return;
      }
    }

    const tempUserMsg: ChatMessage = {
      id: 'temp-' + Date.now(),
      conversation_id: currentConvId,
      sender: 'user',
      content: text,
      created_at: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const docToAttach = attachedDoc?.id || selectedDocId || undefined;
      const res = await api.post<ChatMessage>(`/chat/conversations/${currentConvId}/messages`, {
        content: text,
        document_id: docToAttach
      });
      setMessages((prev) => prev.map((m) => (m.id === tempUserMsg.id ? tempUserMsg : m)).concat(res.data));
      fetchConversations();
    } catch (err: any) {
      console.error('Failed to send message:', err);
      alert(err.response?.data?.detail || 'Failed to send message to AI Assistant');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConv = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this conversation?')) return;
    try {
      await api.delete(`/chat/conversations/${convId}`);
      const updated = conversations.filter((c) => c.id !== convId);
      setConversations(updated);
      if (activeConvId === convId) {
        setActiveConvId(updated.length > 0 ? updated[0].id : null);
        setMessages([]);
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const handleSaveRename = async (convId: string) => {
    if (!editingTitle.trim()) return;
    try {
      await api.patch(`/chat/conversations/${convId}`, { title: editingTitle });
      setConversations(conversations.map((c) => (c.id === convId ? { ...c, title: editingTitle } : c)));
      setEditingConvId(null);
    } catch (err) {
      console.error('Failed to rename conversation:', err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', 'clinical_summary');

    try {
      const res = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const newDoc: DocumentItem = res.data.document;
      setUserDocs([newDoc, ...userDocs]);
      setAttachedDoc(newDoc);
      setSelectedDocId(newDoc.id);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to upload document');
    } finally {
      setUploadingDoc(false);
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeDocName = attachedDoc?.filename || userDocs.find(d => d.id === selectedDocId)?.filename;

  return (
    <div className="h-[calc(100vh-7rem)] bg-white rounded-2xl border border-ivory-300 shadow-soft flex overflow-hidden">
      {/* Sidebar - ChatGPT Style */}
      <div className="w-80 bg-ivory-50 border-r border-ivory-200 flex flex-col justify-between shrink-0">
        <div className="p-4 space-y-3">
          <button
            onClick={handleCreateNewChat}
            className="w-full py-3 px-4 rounded-xl bg-charcoal-700 text-white font-semibold text-sm hover:bg-charcoal-900 transition-all shadow-soft flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>

          <div className="relative">
            <Search className="w-4 h-4 text-taupe-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-nude-300 bg-white"
            />
          </div>
        </div>

        {/* Conversations History List */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1">
          {filteredConversations.length === 0 ? (
            <p className="text-xs text-taupe-400 text-center py-6">No chat history found.</p>
          ) : (
            filteredConversations.map((conv) => {
              const active = conv.id === activeConvId;
              const isEditing = editingConvId === conv.id;

              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`group w-full p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between text-left ${
                    active ? 'bg-nude-200 text-charcoal-800 font-semibold shadow-soft' : 'hover:bg-ivory-100 text-charcoal-600'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <MessageSquare className={`w-4 h-4 shrink-0 ${active ? 'text-charcoal-800' : 'text-taupe-400'}`} />
                    {isEditing ? (
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        className="text-xs px-2 py-1 rounded border border-nude-400 focus:outline-none bg-white w-full"
                      />
                    ) : (
                      <div className="truncate">
                        <span className="text-xs block truncate">{conv.title}</span>
                        {conv.last_message && (
                          <span className="text-[10px] text-taupe-400 block truncate font-normal">{conv.last_message}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isEditing ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveRename(conv.id);
                        }}
                        className="p-1 text-sage-500 hover:text-sage-700"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingConvId(conv.id);
                          setEditingTitle(conv.title);
                        }}
                        className="p-1 text-taupe-400 hover:text-charcoal-700"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDeleteConv(conv.id, e)}
                      className="p-1 text-taupe-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-3 border-t border-ivory-200 text-center">
          <span className="text-[10px] font-semibold text-taupe-400">ClaimSure RAG Engine v1.0</span>
        </div>
      </div>

      {/* Main Chat Body */}
      <div className="flex-1 flex flex-col justify-between bg-white">
        {/* Top Header */}
        <div className="p-4 border-b border-ivory-200 flex items-center justify-between bg-ivory-50/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-nude-300 to-taupe-400 flex items-center justify-center text-charcoal-800">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-charcoal-800">
                {conversations.find((c) => c.id === activeConvId)?.title || 'Grounded AI Assistant'}
              </h3>
              <p className="text-[11px] text-taupe-400">
                {activeDocName
                  ? `Active Grounded Document: ${activeDocName}`
                  : 'Healthcare Intelligence & Grounded RAG Chat'}
              </p>
            </div>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-nude-100 flex items-center justify-center text-taupe-500">
                <Bot className="w-8 h-8 text-taupe-500" />
              </div>
              <div>
                <h4 className="font-bold text-charcoal-700 text-base">ClaimSure-AI Clinical Chatbot</h4>
                <p className="text-xs text-taupe-400 mt-1">
                  Ask medical coding questions, upload policy documents or hospital bills, and get grounded RAG answers with citations.
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div key={msg.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-nude-300 text-charcoal-800 flex items-center justify-center shrink-0 shadow-soft">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-2xl rounded-2xl p-4 text-sm leading-relaxed shadow-soft ${
                    isUser
                      ? 'bg-charcoal-700 text-white rounded-br-none'
                      : 'bg-ivory-50 border border-ivory-200 text-charcoal-800 rounded-bl-none'
                  }`}>
                    <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-ivory-200 space-y-1.5">
                        <span className="text-[11px] font-bold text-taupe-500 uppercase tracking-wider flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" /> Source Citations
                        </span>
                        {msg.citations.map((cit, idx) => (
                          <div key={idx} className="p-2 rounded-lg bg-white border border-ivory-200 text-xs text-charcoal-600">
                            <span className="font-semibold text-nude-500">📄 {cit.document_name} (Page {cit.page_number})</span>
                            <p className="text-[11px] text-taupe-400 italic mt-0.5">"{cit.snippet}"</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-xl bg-taupe-400 text-white flex items-center justify-center shrink-0 shadow-soft">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })
          )}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-nude-300 text-charcoal-800 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-ivory-50 border border-ivory-200 p-4 rounded-2xl rounded-bl-none flex items-center gap-2 text-xs text-taupe-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing clinical documents & fetching grounded evidence...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ChatGPT Style Bottom Input Box with Attached Document Chip & Upload Icon */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-ivory-200 bg-white space-y-2">
          {/* Attached Document Chip Badge */}
          {activeDocName && (
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-nude-100 border border-nude-300 text-charcoal-800 text-xs font-semibold shadow-soft">
                <Paperclip className="w-3.5 h-3.5 text-nude-500" />
                <span className="truncate max-w-xs">{activeDocName}</span>
                <button
                  type="button"
                  onClick={() => {
                    setAttachedDoc(null);
                    setSelectedDocId(null);
                  }}
                  className="ml-1 p-0.5 rounded-full hover:bg-nude-200 text-taupe-500 hover:text-charcoal-800"
                  title="Detach Document"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-[11px] text-taupe-400 italic">RAG Grounding Active</span>
            </div>
          )}

          <div className="flex items-center gap-2 bg-ivory-50 p-2 rounded-2xl border border-ivory-300 focus-within:ring-2 focus-within:ring-nude-300 focus-within:border-nude-400 transition-all">
            {/* File Upload Button inside Prompt Bar (ChatGPT Style) */}
            <div className="relative flex items-center shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingDoc}
                className="p-2.5 rounded-xl bg-white hover:bg-nude-100 border border-ivory-300 text-charcoal-700 transition-colors shadow-soft flex items-center justify-center"
                title="Upload Document (Policy / Hospital Bill / Clinical Notes)"
              >
                {uploadingDoc ? (
                  <Loader2 className="w-4 h-4 animate-spin text-taupe-500" />
                ) : (
                  <Paperclip className="w-4 h-4 text-charcoal-700" />
                )}
              </button>

              {userDocs.length > 0 && (
                <select
                  value={selectedDocId || ''}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedDocId(id || null);
                    setAttachedDoc(userDocs.find(d => d.id === id) || null);
                  }}
                  className="text-xs bg-transparent border-0 text-taupe-500 focus:outline-none cursor-pointer px-1 max-w-[100px] truncate"
                  title="Attach Existing Document"
                >
                  <option value="">Attach doc...</option>
                  {userDocs.map((d) => (
                    <option key={d.id} value={d.id}>📄 {d.filename}</option>
                  ))}
                </select>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.docx,.txt"
              />
            </div>

            {/* Prompt Text Input */}
            <input
              type="text"
              placeholder={
                activeDocName
                  ? "Ask about policy clauses, bill coverage eligibility, or ICD codes in this file..."
                  : "Message ClaimSure-AI... (Ask clinical questions, medical codes, or attach files)"
              }
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-transparent py-2 px-2 text-sm text-charcoal-800 focus:outline-none placeholder:text-taupe-400"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="p-3 rounded-xl bg-charcoal-700 hover:bg-charcoal-900 text-white transition-all shadow-soft disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
