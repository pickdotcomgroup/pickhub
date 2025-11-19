"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SendHorizontal } from "lucide-react";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  clientProfile?: {
    firstName: string | null;
    lastName: string | null;
    companyName: string | null;
  } | null;
  talentProfile?: {
    firstName: string;
    lastName: string;
    title: string;
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

export default function ClientMessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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
      void fetchConversations();
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
      void fetchConversations();
    }, 5000);
    return () => clearInterval(interval);
  }, [status]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    shouldAutoScrollRef.current = isNearBottom;
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/conversations");
      if (response.ok) {
        const data = (await response.json()) as Conversation[];
        setConversations(data);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
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
    shouldAutoScrollRef.current = true; // Scroll to bottom when selecting a new conversation
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
    shouldAutoScrollRef.current = true; // Always scroll when sending a message
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
        void fetchConversations();
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
    if (user.talentProfile) {
      return `${user.talentProfile.firstName} ${user.talentProfile.lastName}`;
    }
    if (user.clientProfile?.firstName && user.clientProfile?.lastName) {
      return `${user.clientProfile.firstName} ${user.clientProfile.lastName}`;
    }
    if (user.clientProfile?.companyName) {
      return user.clientProfile.companyName;
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

  const filteredConversations = conversations.filter((conversation) => {
    const otherUser = getOtherUser(conversation);
    const displayName = getUserDisplayName(otherUser).toLowerCase();
    return displayName.includes(searchQuery.toLowerCase());
  });

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Header Skeleton */}
          <div className="mb-6">
            <div className="h-9 w-48 animate-pulse rounded-lg bg-gray-200"></div>
            <div className="mt-2 h-4 w-32 animate-pulse rounded bg-gray-200"></div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
            {/* Conversations Sidebar Skeleton */}
            <div className="lg:col-span-4 xl:col-span-3">
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-lg">
                {/* Search Bar Skeleton */}
                <div className="border-b border-gray-200 p-4">
                  <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200"></div>
                </div>

                {/* Conversation Items Skeleton */}
                <div className="divide-y divide-gray-200">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-12 w-12 flex-shrink-0 animate-pulse rounded-full bg-gray-200"></div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="h-5 w-32 animate-pulse rounded bg-gray-200"></div>
                            <div className="h-4 w-12 animate-pulse rounded bg-gray-200"></div>
                          </div>
                          <div className="mt-2 h-4 w-24 animate-pulse rounded bg-gray-200"></div>
                          <div className="mt-2 h-4 w-full animate-pulse rounded bg-gray-200"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Messages Area Skeleton */}
            <div className="lg:col-span-8 xl:col-span-9">
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
                <div className="flex h-[calc(100vh-200px)] flex-col">
                  {/* Chat Header Skeleton */}
                  <div className="border-b border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200"></div>
                      <div className="flex-1">
                        <div className="h-5 w-40 animate-pulse rounded bg-gray-200"></div>
                        <div className="mt-1 h-4 w-32 animate-pulse rounded bg-gray-200"></div>
                      </div>
                    </div>
                  </div>

                  {/* Messages Skeleton */}
                  <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4">
                    {/* Received message skeleton */}
                    <div className="flex justify-start">
                      <div className="max-w-[70%]">
                        <div className="h-20 w-64 animate-pulse rounded-2xl bg-gray-200"></div>
                      </div>
                    </div>
                    
                    {/* Sent message skeleton */}
                    <div className="flex justify-end">
                      <div className="max-w-[70%]">
                        <div className="h-16 w-56 animate-pulse rounded-2xl bg-gray-200"></div>
                      </div>
                    </div>

                    {/* Received message skeleton */}
                    <div className="flex justify-start">
                      <div className="max-w-[70%]">
                        <div className="h-24 w-72 animate-pulse rounded-2xl bg-gray-200"></div>
                      </div>
                    </div>

                    {/* Sent message skeleton */}
                    <div className="flex justify-end">
                      <div className="max-w-[70%]">
                        <div className="h-20 w-60 animate-pulse rounded-2xl bg-gray-200"></div>
                      </div>
                    </div>
                  </div>

                  {/* Input Area Skeleton */}
                  <div className="border-t border-gray-200 bg-white p-4">
                    <div className="flex gap-3">
                      <div className="h-12 flex-1 animate-pulse rounded-xl bg-gray-200"></div>
                      <div className="h-12 w-24 animate-pulse rounded-xl bg-gray-200"></div>
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
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="mt-1 text-sm text-gray-600">
            {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
          {/* Conversations Sidebar */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-lg">
              {/* Search Bar */}
              <div className="border-b border-gray-200 p-4">
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500"
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
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              </div>

              {/* Conversations List */}
              <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="mb-4 rounded-full bg-blue-100 p-4">
                      <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <p className="text-gray-700">
                      {searchQuery ? "No conversations found" : "No conversations yet"}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchQuery ? "Try a different search term" : "Start a conversation with a talent"}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredConversations.map((conversation) => {
                      const otherUser = getOtherUser(conversation);
                      const lastMessage = conversation.messages[0];
                      const unreadCount = conversation._count.messages;

                      return (
                        <button
                          key={conversation.id}
                          onClick={() => void handleSelectConversation(conversation)}
                          className={`w-full p-4 text-left transition-all duration-200 hover:bg-white ${selectedConversation?.id === conversation.id
                              ? "bg-blue-50 border-l-4 border-blue-500"
                              : ""
                            }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold shadow-lg">
                                {getUserInitials(otherUser)}
                              </div>
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <h3 className="truncate font-semibold text-gray-900">
                                    {getUserDisplayName(otherUser)}
                                  </h3>
                                  {otherUser.talentProfile && (
                                    <p className="truncate text-xs text-gray-600">
                                      {otherUser.talentProfile.title}
                                    </p>
                                  )}
                                </div>
                                {lastMessage && (
                                  <span className="flex-shrink-0 text-xs text-gray-500">
                                    {getRelativeTime(lastMessage.createdAt)}
                                  </span>
                                )}
                              </div>

                              {lastMessage && (
                                <div className="mt-1 flex items-center justify-between gap-2">
                                  <p className="truncate text-sm text-gray-600">{lastMessage.content}</p>
                                  {unreadCount > 0 && (
                                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-semibold text-white">
                                      {unreadCount}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="lg:col-span-8 xl:col-span-9">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
              {selectedConversation ? (
                <div className="flex h-[calc(100vh-200px)] flex-col">
                  {/* Chat Header */}
                  <div className="border-b border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold shadow-lg">
                        {getUserInitials(getOtherUser(selectedConversation))}
                      </div>
                      <div>
                        <h2 className="font-semibold text-gray-900">
                          {getUserDisplayName(getOtherUser(selectedConversation))}
                        </h2>
                        {getOtherUser(selectedConversation).talentProfile && (
                          <p className="text-sm text-gray-600">
                            {getOtherUser(selectedConversation).talentProfile!.title}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div 
                    ref={messagesContainerRef}
                    onScroll={handleScroll}
                    className="flex-1 space-y-4 overflow-y-auto p-4 bg-gray-50 scrollbar-thin scrollbar-thumb-blue-500/50 scrollbar-track-transparent"
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
                              className={`flex ${isOwn ? "justify-end" : "justify-start"} animate-fade-in`}
                            >
                              <div className={`max-w-[70%] ${isOwn ? "order-2" : "order-1"}`}>
                                <div
                                  className={`rounded-2xl px-4 py-2.5 shadow-md ${isOwn
                                      ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                                      : "bg-white text-gray-900 border border-gray-200"
                                    }`}
                                >
                                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                                    {message.content}
                                  </p>
                                  <p
                                    className={`mt-1.5 text-xs ${isOwn ? "text-blue-100" : "text-gray-500"
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

                  {/* Input Area */}
                  <form onSubmit={handleSendMessage} className="border-t border-gray-200 bg-white p-4">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-500 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        disabled={sending}
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:from-blue-600 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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
                <div className="flex h-[calc(100vh-200px)] items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                      <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Select a conversation</h3>
                    <p className="mt-1 text-sm text-gray-600">Choose a conversation from the list to start messaging</p>
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
