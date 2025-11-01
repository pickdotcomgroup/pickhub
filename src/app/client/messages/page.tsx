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

export default function ClientMessagesPage() {
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

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    void fetchMessages(conversation.id);
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Messages</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Conversations List */}
        <div className="rounded-lg border bg-white p-4 shadow-sm md:col-span-1">
          <h2 className="mb-4 text-xl font-semibold">Conversations</h2>
          {conversations.length === 0 ? (
            <p className="text-gray-500">No conversations yet</p>
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
                    className={`w-full rounded-lg border p-3 text-left transition-colors hover:bg-gray-50 ${
                      selectedConversation?.id === conversation.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold">
                          {getUserDisplayName(otherUser)}
                        </div>
                        {otherUser.talentProfile && (
                          <div className="text-sm text-gray-500">
                            {otherUser.talentProfile.title}
                          </div>
                        )}
                        {lastMessage && (
                          <div className="mt-1 truncate text-sm text-gray-600">
                            {lastMessage.content}
                          </div>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <span className="ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs text-white">
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
        <div className="rounded-lg border bg-white shadow-sm md:col-span-2">
          {selectedConversation ? (
            <div className="flex h-[600px] flex-col">
              {/* Header */}
              <div className="border-b p-4">
                <h2 className="text-xl font-semibold">
                  {getUserDisplayName(getOtherUser(selectedConversation))}
                </h2>
                {getOtherUser(selectedConversation).talentProfile && (
                  <p className="text-sm text-gray-500">
                    {getOtherUser(selectedConversation).talentProfile!.title}
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
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                        <p
                          className={`mt-1 text-xs ${
                            isOwn ? "text-blue-100" : "text-gray-500"
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
              <form
                onSubmit={handleSendMessage}
                className="border-t p-4"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="rounded-lg bg-blue-500 px-6 py-2 text-white transition-colors hover:bg-blue-600 disabled:bg-gray-300"
                  >
                    {sending ? "Sending..." : "Send"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex h-[600px] items-center justify-center text-gray-500">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
