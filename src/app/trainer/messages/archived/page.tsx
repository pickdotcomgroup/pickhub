"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SendHorizontal, MoreVertical, ArchiveRestore, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  employerProfile?: {
    firstName: string | null;
    lastName: string | null;
    companyName: string | null;
  } | null;
  talentProfile?: {
    firstName: string;
    lastName: string;
    title: string;
  } | null;
  trainerProfile?: {
    firstName: string;
    lastName: string;
    title: string | null;
  } | null;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  isRead: boolean;
}

interface Conversation {
  id: string;
  clientId: string;
  talentId: string;
  projectId: string | null;
  client: User;
  talent: User;
  messages: Message[];
  _count: {
    messages: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface MessageWithSender extends Message {
  sender: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

export default function TrainerArchivedMessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      void fetchArchivedConversations();
    }
  }, [status]);

  useEffect(() => {
    if (shouldAutoScrollRef.current) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    if (!selectedConversation) return;
    const interval = setInterval(() => {
      void fetchMessages(selectedConversation.id);
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedConversation]);

  useEffect(() => {
    if (status !== "authenticated") return;
    const interval = setInterval(() => {
      void fetchArchivedConversations();
    }, 5000);
    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    const handleClickOutside = () => {
      if (openMenuId) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [openMenuId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

    shouldAutoScrollRef.current = isNearBottom;
  };

  const fetchArchivedConversations = async () => {
    try {
      const response = await fetch("/api/conversations?archived=true");
      if (response.ok) {
        const data = (await response.json()) as Conversation[];
        setConversations(data);
      }
    } catch (error) {
      console.error("Error fetching archived conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/messages?conversationId=${conversationId}`);
      if (response.ok) {
        const data = (await response.json()) as MessageWithSender[];
        setMessages(data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    shouldAutoScrollRef.current = true;
    await fetchMessages(conversation.id);

    try {
      await fetch("/api/messages/mark-read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: conversation.id }),
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);
    shouldAutoScrollRef.current = true;
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          content: newMessage.trim(),
        }),
      });

      if (response.ok) {
        const message = (await response.json()) as MessageWithSender;
        setMessages([...messages, message]);
        setNewMessage("");
        void fetchArchivedConversations();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const getOtherUser = (conversation: Conversation): User => {
    return session?.user?.id === conversation.clientId ? conversation.talent : conversation.client;
  };

  const getUserDisplayName = (user: User): string => {
    if (user.trainerProfile) {
      return `${user.trainerProfile.firstName} ${user.trainerProfile.lastName}`;
    }
    if (user.talentProfile) {
      return `${user.talentProfile.firstName} ${user.talentProfile.lastName}`;
    }
    if (user.employerProfile?.firstName && user.employerProfile?.lastName) {
      return `${user.employerProfile.firstName} ${user.employerProfile.lastName}`;
    }
    if (user.employerProfile?.companyName) {
      return user.employerProfile.companyName;
    }
    return user.name ?? user.email ?? "Unknown User";
  };

  const getUserInitials = (user: User): string => {
    const name = getUserDisplayName(user);
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const formatMessageTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isYesterday) {
      return `Yesterday ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }

    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleUnarchiveConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unarchive" }),
      });

      if (response.ok) {
        await fetchArchivedConversations();
        setOpenMenuId(null);
        if (selectedConversation?.id === conversationId) {
          setSelectedConversation(null);
        }
      }
    } catch (error) {
      console.error("Error unarchiving conversation:", error);
    }
  };

  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this conversation? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete" }),
      });

      if (response.ok) {
        await fetchArchivedConversations();
        setOpenMenuId(null);
        if (selectedConversation?.id === conversationId) {
          setSelectedConversation(null);
        }
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  const filteredConversations = conversations.filter((conversation) => {
    const otherUser = getOtherUser(conversation);
    const displayName = getUserDisplayName(otherUser).toLowerCase();
    return displayName.includes(searchQuery.toLowerCase());
  });

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="h-5 w-5 animate-pulse rounded bg-gray-200"></div>
              <div className="h-5 w-32 animate-pulse rounded bg-gray-200"></div>
            </div>
            <div className="h-9 w-64 animate-pulse rounded bg-gray-200"></div>
            <div className="mt-1 h-4 w-48 animate-pulse rounded bg-gray-200"></div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
            <div className="lg:col-span-4 xl:col-span-3">
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 p-4">
                  <div className="h-10 w-full animate-pulse rounded-lg bg-gray-100"></div>
                </div>
                <div className="divide-y divide-gray-100">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-12 w-12 flex-shrink-0 animate-pulse rounded-full bg-gray-200"></div>
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200"></div>
                          <div className="h-4 w-full animate-pulse rounded bg-gray-100"></div>
                          <div className="h-3 w-20 animate-pulse rounded bg-gray-100"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 xl:col-span-9">
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex h-[calc(100vh-200px)] flex-col">
                  <div className="border-b border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200"></div>
                      <div className="space-y-2">
                        <div className="h-5 w-32 animate-pulse rounded bg-gray-200"></div>
                        <div className="h-4 w-24 animate-pulse rounded bg-gray-100"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4">
                    <div className="flex justify-start">
                      <div className="h-16 w-64 animate-pulse rounded-2xl bg-gray-200"></div>
                    </div>
                    <div className="flex justify-end">
                      <div className="h-16 w-56 animate-pulse rounded-2xl bg-purple-100"></div>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 bg-white p-4">
                    <div className="flex gap-3">
                      <div className="h-12 flex-1 animate-pulse rounded-xl bg-gray-100"></div>
                      <div className="h-12 w-24 animate-pulse rounded-xl bg-purple-100"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/trainer/messages"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Messages</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Archived Messages</h1>
          <p className="mt-1 text-sm text-gray-600">
            {conversations.length} archived conversation{conversations.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
          {/* Conversations Sidebar */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 p-4">
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search archived conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>
              </div>

              <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="mb-4 rounded-full bg-gray-100 p-4">
                      <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    </div>
                    <p className="text-gray-600">
                      {searchQuery ? "No archived conversations found" : "No archived conversations"}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchQuery ? "Try a different search term" : "Archived conversations will appear here"}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredConversations.map((conversation) => {
                      const otherUser = getOtherUser(conversation);
                      const lastMessage = conversation.messages[0];
                      const unreadCount = conversation._count.messages;

                      return (
                        <div
                          key={conversation.id}
                          className={`relative transition-all duration-200 hover:bg-gray-50 ${selectedConversation?.id === conversation.id
                              ? "bg-purple-50 border-l-4 border-purple-500"
                              : ""
                            }`}
                        >
                          <button
                            onClick={() => void handleSelectConversation(conversation)}
                            className="w-full p-4 pr-12 text-left"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-gray-400 to-gray-500 text-white font-semibold shadow-lg">
                                  {getUserInitials(otherUser)}
                                </div>
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0 flex-1">
                                    <h3 className="truncate font-semibold text-gray-900">
                                      {getUserDisplayName(otherUser)}
                                    </h3>
                                    {otherUser.employerProfile?.companyName && (
                                      <p className="truncate text-xs text-gray-500">
                                        {otherUser.employerProfile.companyName}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {lastMessage && (
                                  <div className="mt-1 flex items-center justify-between gap-2">
                                    <p className="truncate text-sm text-gray-600">{lastMessage.content}</p>
                                    {unreadCount > 0 && (
                                      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-purple-500 text-xs font-semibold text-white">
                                        {unreadCount}
                                      </span>
                                    )}
                                  </div>
                                )}

                                {lastMessage && (
                                  <div className="mt-1">
                                    <span className="text-xs text-gray-500">
                                      {getRelativeTime(lastMessage.createdAt)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>

                          <div className="absolute right-2 top-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === conversation.id ? null : conversation.id);
                              }}
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
                            >
                              <MoreVertical className="h-5 w-5" />
                            </button>

                            {openMenuId === conversation.id && (
                              <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-gray-200 bg-white shadow-lg z-10">
                                <button
                                  onClick={(e) => void handleUnarchiveConversation(conversation.id, e)}
                                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors rounded-t-lg"
                                >
                                  <ArchiveRestore className="h-4 w-4" />
                                  <span>Unarchive</span>
                                </button>
                                <button
                                  onClick={(e) => void handleDeleteConversation(conversation.id, e)}
                                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors rounded-b-lg"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="lg:col-span-8 xl:col-span-9">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              {selectedConversation ? (
                <div className="flex h-[calc(100vh-200px)] flex-col">
                  <div className="border-b border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gray-400 to-gray-500 text-white font-semibold shadow-lg">
                        {getUserInitials(getOtherUser(selectedConversation))}
                      </div>
                      <div>
                        <h2 className="font-semibold text-gray-900">
                          {getUserDisplayName(getOtherUser(selectedConversation))}
                        </h2>
                        {getOtherUser(selectedConversation).employerProfile?.companyName && (
                          <p className="text-sm text-gray-600">
                            {getOtherUser(selectedConversation).employerProfile!.companyName}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    ref={messagesContainerRef}
                    onScroll={handleScroll}
                    className="flex-1 space-y-4 overflow-y-auto p-4 bg-gray-50"
                  >
                    {messages.length === 0 ? (
                      <div className="flex h-full items-center justify-center text-gray-600">
                        <div className="text-center">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <p className="mt-2">No messages yet</p>
                          <p className="mt-1 text-sm text-gray-500">Start the conversation!</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {messages.map((message) => {
                          const isOwn = message.senderId === session?.user?.id;
                          return (
                            <div
                              key={message.id}
                              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                            >
                              <div className={`max-w-[70%] ${isOwn ? "order-2" : "order-1"}`}>
                                <div
                                  className={`rounded-2xl px-4 py-2.5 shadow-sm ${isOwn
                                      ? "bg-gradient-to-br from-purple-500 to-purple-600 text-white"
                                      : "bg-white text-gray-900 border border-gray-200"
                                    }`}
                                >
                                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                                    {message.content}
                                  </p>
                                  <p
                                    className={`mt-1.5 text-xs ${isOwn ? "text-purple-100" : "text-gray-500"
                                      }`}
                                  >
                                    {formatMessageTime(message.createdAt)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>

                  <form onSubmit={handleSendMessage} className="border-t border-gray-200 bg-white p-4">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        disabled={sending}
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:from-purple-600 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {sending ? (
                          <>
                            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <SendHorizontal className="w-5 h-5" />
                            <span>Send</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="flex h-[calc(100vh-200px)] items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                      <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Select an archived conversation</h3>
                    <p className="mt-1 text-sm text-gray-600">Choose a conversation from the list to view messages</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
