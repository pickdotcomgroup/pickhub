"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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

export default function TalentMessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

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

  // Auto-refetch messages every 3 seconds when a conversation is selected
  useEffect(() => {
    if (!selectedConversation) return;

    const interval = setInterval(() => {
      void fetchMessages(selectedConversation.id);
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedConversation]);

  // Auto-refetch conversations every 5 seconds
  useEffect(() => {
    if (status !== "authenticated") return;

    const interval = setInterval(() => {
      void fetchConversations();
    }, 5000);

    return () => clearInterval(interval);
  }, [status]);

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
      const response = await fetch(
        `/api/messages?conversationId=${conversationId}`,
      );
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
    await fetchMessages(conversation.id);
    
    // Mark messages as read
    try {
      await fetch("/api/messages/mark-read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: conversation.id,
        }),
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);
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
        // Refresh conversations to update last message
        void fetchConversations();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const getOtherUser = (conversation: Conversation): User => {
    return session?.user?.id === conversation.clientId
      ? conversation.talent
      : conversation.client;
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

  if (status === "loading" || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white text-xl">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="mb-6 text-3xl font-bold text-white">Messages</h1>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Conversations List */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 md:col-span-1">
            <h2 className="mb-4 text-xl font-semibold text-white">Conversations</h2>
            {conversations.length === 0 ? (
              <p className="text-gray-400">No conversations yet</p>
            ) : (
              <div className="space-y-2">
                {conversations.map((conversation) => {
                  const otherUser = getOtherUser(conversation);
                  const lastMessage = conversation.messages[0];
                  const unreadCount = conversation._count.messages;

                  return (
                    <button
                      key={conversation.id}
                      onClick={() => handleSelectConversation(conversation)}
                      className={`w-full rounded-lg p-3 text-left transition-colors ${
                        selectedConversation?.id === conversation.id
                          ? "bg-purple-500/20 border border-purple-500/50"
                          : "bg-white/5 border border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-white">
                            {getUserDisplayName(otherUser)}
                          </div>
                          {otherUser.clientProfile?.companyName && (
                            <div className="text-sm text-gray-400">
                              {otherUser.clientProfile.companyName}
                            </div>
                          )}
                          {lastMessage && (
                            <div className="mt-1 truncate text-sm text-gray-400">
                              {lastMessage.content}
                            </div>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <span className="ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-purple-500 text-xs text-white font-semibold">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Messages Area */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 md:col-span-2">
            {selectedConversation ? (
              <div className="flex h-[600px] flex-col">
                {/* Header */}
                <div className="border-b border-white/10 p-4">
                  <h2 className="text-xl font-semibold text-white">
                    {getUserDisplayName(getOtherUser(selectedConversation))}
                  </h2>
                  {getOtherUser(selectedConversation).clientProfile
                    ?.companyName && (
                    <p className="text-sm text-gray-400">
                      {
                        getOtherUser(selectedConversation).clientProfile!
                          .companyName
                      }
                    </p>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 space-y-4 overflow-y-auto p-4">
                  {messages.map((message) => {
                    const isOwn = message.senderId === session?.user?.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            isOwn
                              ? "bg-purple-500 text-white"
                              : "bg-white/10 text-white"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                          <p
                            className={`mt-1 text-xs ${
                              isOwn ? "text-purple-100" : "text-gray-400"
                            }`}
                          >
                            {new Date(message.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="border-t border-white/10 p-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 rounded-lg bg-white/10 border border-white/20 px-4 py-2 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      disabled={sending}
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="rounded-lg bg-purple-500 px-6 py-2 text-white font-semibold transition-colors hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                      {sending ? "Sending..." : "Send"}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="flex h-[600px] items-center justify-center text-gray-400">
                Select a conversation to start messaging
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
