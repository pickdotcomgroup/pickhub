"use client";

import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { MessageSquare, Users, PlusCircle, FolderKanban, Search, FolderGit } from "lucide-react";

// Notification Badge Component
function NotificationBadge({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white shadow-lg">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    relatedProjectId?: string | null;
    relatedApplicationId?: string | null;
  }>>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);

  // Helper function to check if a path is active
  const isActivePath = (path: string) => {
    return pathname === path;
  };

  // Helper function to get navigation link classes
  const getNavLinkClasses = (path: string) => {
    const baseClasses = "px-4 py-2 text-sm rounded-lg transition";
    const activeClasses = "bg-blue-600 text-white font-semibold";
    const inactiveClasses = "text-gray-700 hover:text-gray-900 hover:bg-gray-100";

    return `${baseClasses} ${isActivePath(path) ? activeClasses : inactiveClasses}`;
  };

  // Helper function for mobile nav link classes
  const getMobileNavLinkClasses = (path: string) => {
    const baseClasses = "px-4 py-3 text-sm rounded-lg transition";
    const activeClasses = "bg-blue-600 text-white font-semibold";
    const inactiveClasses = "text-gray-700 hover:text-gray-900 hover:bg-gray-100";

    return `${baseClasses} ${isActivePath(path) ? activeClasses : inactiveClasses}`;
  };

  // Fetch unread message count
  useEffect(() => {
    if (!session?.user) return;

    const fetchUnreadCount = async () => {
      try {
        const response = await fetch("/api/messages/unread-count");
        if (response.ok) {
          const data = (await response.json()) as { count: number };
          setUnreadCount(data.count ?? 0);
        }
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };

    void fetchUnreadCount();

    // Poll for updates every 30 seconds
    const interval = setInterval(() => {
      void fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [session?.user]);

  // Fetch unread notification count
  useEffect(() => {
    if (!session?.user) return;

    const fetchNotificationCount = async () => {
      try {
        const response = await fetch("/api/notifications/unread-count");
        if (response.ok) {
          const data = (await response.json()) as { count: number };
          setNotificationCount(data.count ?? 0);
        }
      } catch (error) {
        console.error("Error fetching notification count:", error);
      }
    };

    void fetchNotificationCount();

    // Poll for updates every 30 seconds
    const interval = setInterval(() => {
      void fetchNotificationCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [session?.user]);

  // Fetch notifications when dropdown is opened
  useEffect(() => {
    if (!isNotificationDropdownOpen || !session?.user) return;

    const fetchNotifications = async () => {
      try {
        console.log("Fetching notifications...");
        const response = await fetch("/api/notifications?limit=10");
        console.log("Response status:", response.status);

        if (response.ok) {
          const data = (await response.json()) as {
            notifications: Array<{
              id: string;
              type: string;
              title: string;
              message: string;
              isRead: boolean;
              createdAt: string;
              relatedProjectId?: string | null;
              relatedApplicationId?: string | null;
            }>
          };
          console.log("Fetched notifications:", data.notifications);
          setNotifications(data.notifications ?? []);
        } else {
          const errorData = (await response.json()) as { error?: string };
          console.error("Error response:", errorData);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    void fetchNotifications();
  }, [isNotificationDropdownOpen, session?.user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target as Node)) {
        setIsNotificationDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/signin" });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Get user initials for avatar
  const getUserInitials = (name?: string | null) => {
    if (!name) return "U";
    const names = name.split(" ");
    if (names.length >= 2) {
      return `${names[0]![0]}${names[1]![0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });

      if (response.ok) {
        // Update local state
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
        setNotificationCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllAsRead: true }),
      });

      if (response.ok) {
        setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
        setNotificationCount(0);
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Format notification time
  const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return "Just now";
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Mobile Menu Button */}
          {session?.user && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              aria-label="Toggle mobile menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          )}

          <Link href="/" className="flex items-center space-x-2 text-xl sm:text-2xl font-bold text-gray-900">
            <Image
              src="/image/TechLogo.png"
              alt="TechPickHub Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <span className="hidden sm:inline">
              <span className="text-blue-600">TechPick</span>Hub
            </span>
          </Link>

          {/* Quick Actions Navigation */}
          {session?.user && (
            <nav className="hidden md:flex items-center space-x-1 ml-auto mr-4">
              {session.user.role === "client" ? (
                <>
                  <Link
                    href="/client/browse"
                    className={`${getNavLinkClasses("/client/browse")} flex items-center gap-2`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Browse Developers</span>
                  </Link>
                  <Link
                    href="/client/projects/new"
                    className={`${getNavLinkClasses("/client/projects/new")} flex items-center gap-2`}
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Post a Project</span>
                  </Link>
                  <Link
                    href="/client/projects"
                    className={`${getNavLinkClasses("/client/projects")} flex items-center gap-2`}
                  >
                    <FolderKanban className="w-4 h-4" />
                    <span>My Projects</span>
                  </Link>
                  <Link
                    href="/client/messages"
                    className={`relative ${getNavLinkClasses("/client/messages")}`}
                    aria-label="Messages"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <NotificationBadge count={unreadCount} />
                  </Link>
                </>
              ) : session.user.role === "talent" ? (
                <>
                  <Link
                    href="/talent/browse"
                    className={`${getNavLinkClasses("/talent/browse")} flex items-center gap-2`}
                  >
                    <Search className="w-4 h-4" />
                    Browse Projects
                  </Link>
                  <Link
                    href="/talent/projects"
                    className={`${getNavLinkClasses("/talent/projects")} flex items-center gap-2`}
                  >
                    <FolderGit className="w-5 h-5" />
                    Pick Projects
                  </Link>
                  <Link
                    href="/talent/messages"
                    className={`relative ${getNavLinkClasses("/talent/messages")}`}
                    aria-label="Messages"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <NotificationBadge count={unreadCount} />
                  </Link>
                </>
              ) : session.user.role === "agency" ? (
                <>
                  <Link
                    href="/agency/browse-clients"
                    className={`${getNavLinkClasses("/agency/browse-clients")} flex items-center gap-2`}
                  >
                    <FolderKanban className="w-4 h-4" />
                    <span>Browse Clients</span>
                  </Link>
                  <Link
                    href="/agency/browse-developers"
                    className={`${getNavLinkClasses("/agency/browse-developers")} flex items-center gap-2`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Browse Developers</span>
                  </Link>
                  <Link
                    href="/agency/picked-clients"
                    className={`${getNavLinkClasses("/agency/picked-clients")} flex items-center gap-2`}
                  >
                    <FolderKanban className="w-5 h-5" />
                    <span>Picked Clients</span>
                  </Link>
                  <Link
                    href="/agency/picked-developers"
                    className={`${getNavLinkClasses("/agency/picked-developers")} flex items-center gap-2`}
                  >
                    <FolderGit className="w-5 h-5" />
                    <span>Picked Developers</span>
                  </Link>
                  <Link
                    href="/agency/messages"
                    className={`relative ${getNavLinkClasses("/agency/messages")}`}
                    aria-label="Messages"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <NotificationBadge count={unreadCount} />
                  </Link>
                </>
              ) : session.user.role === "admin" ? (
                <>
                  <Link
                    href="/admin/dashboard"
                    className={getNavLinkClasses("/admin/dashboard")}
                  >
                    Dashboard
                  </Link>
                </>
              ) : null}
            </nav>
          )}

          <div className="flex items-center gap-2">
            {session?.user ? (
              <>
                {/* Notification Bell */}
                <div className="relative" ref={notificationDropdownRef}>
                  <button
                    onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
                    className="relative p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                    aria-label="Notifications"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                    <NotificationBadge count={notificationCount} />
                  </button>

                  {/* Notification Dropdown */}
                  {isNotificationDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-[100] max-h-[500px] overflow-hidden flex flex-col">
                      {/* Header */}
                      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                        {notificationCount > 0 && (
                          <button
                            onClick={markAllNotificationsAsRead}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>

                      {/* Notifications List */}
                      <div className="overflow-y-auto flex-1">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-8 text-center text-gray-500">
                            <svg
                              className="w-12 h-12 mx-auto mb-2 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                              />
                            </svg>
                            <p className="text-sm">No notifications yet</p>
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer ${!notification.isRead ? "bg-blue-50" : ""
                                }`}
                              onClick={() => {
                                if (!notification.isRead) {
                                  void markNotificationAsRead(notification.id);
                                }
                                // Optionally navigate to related project
                                if (notification.relatedProjectId) {
                                  setIsNotificationDropdownOpen(false);
                                  window.location.href = `/client/projects`;
                                }
                              }}
                            >
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                  {notification.type === "project_picked" ? (
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                      <svg
                                        className="w-5 h-5 text-green-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                      </svg>
                                    </div>
                                  ) : notification.type === "new_application" ? (
                                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                      <svg
                                        className="w-5 h-5 text-purple-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        />
                                      </svg>
                                    </div>
                                  ) : (
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                      <svg
                                        className="w-5 h-5 text-blue-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900">
                                    {notification.title}
                                  </p>
                                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {formatNotificationTime(notification.createdAt)}
                                  </p>
                                </div>
                                {!notification.isRead && (
                                  <div className="flex-shrink-0">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative" ref={dropdownRef}>
                  {/* User Avatar Button */}
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 sm:space-x-3 focus:outline-none group"
                  >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm group-hover:ring-2 group-hover:ring-blue-400 transition">
                      {getUserInitials(session.user.name)}
                    </div>
                    <svg
                      className={`hidden sm:block w-4 h-4 text-gray-700 transition-transform ${isDropdownOpen ? "rotate-180" : ""
                        }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[100]">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">
                          {session.user.name ?? "User"}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {session.user.email}
                        </p>
                        {session.user.role && (
                          <p className="text-xs text-blue-600 mt-1 capitalize">
                            {session.user.role}
                          </p>
                        )}
                      </div>

                      {/* Menu Items - Filtered by Role */}
                      <div className="py-1">
                        {/* Dashboard Link - Role-specific */}
                        {session.user.role === "client" && (
                          <Link
                            href="/client/dashboard"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <svg
                              className="w-4 h-4 mr-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                              />
                            </svg>
                            Dashboard
                          </Link>
                        )}

                        {session.user.role === "talent" && (
                          <Link
                            href="/talent/dashboard"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <svg
                              className="w-4 h-4 mr-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                              />
                            </svg>
                            Dashboard
                          </Link>
                        )}

                        {session.user.role === "agency" && (
                          <Link
                            href="/agency/dashboard"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <svg
                              className="w-4 h-4 mr-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                              />
                            </svg>
                            Dashboard
                          </Link>
                        )}

                        {session.user.role === "admin" && (
                          <Link
                            href="/admin/dashboard"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <svg
                              className="w-4 h-4 mr-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                              />
                            </svg>
                            Dashboard
                          </Link>
                        )}

                        {/* Account Link - Role-specific */}
                        {session.user.role === "client" && (
                          <Link
                            href="/client/account"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <svg
                              className="w-4 h-4 mr-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            Account
                          </Link>
                        )}

                        {session.user.role === "talent" && (
                          <Link
                            href="/talent/account"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <svg
                              className="w-4 h-4 mr-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            Account
                          </Link>
                        )}

                        {session.user.role === "agency" && (
                          <Link
                            href="/agency/account"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <svg
                              className="w-4 h-4 mr-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            Account
                          </Link>
                        )}

                        {/* Settings Link - Available for all roles */}
                        {/* <Link
                          href="/settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <svg
                            className="w-4 h-4 mr-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          Settings
                        </Link> */}

                        {/* Logout Button - Available for all roles */}
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition"
                        >
                          <svg
                            className="w-4 h-4 mr-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : pathname !== "/wait-list" ? (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Link
                  href="/signin"
                  className="text-gray-700 hover:text-gray-900 font-semibold py-2 px-3 sm:px-4 text-sm sm:text-base rounded-lg hover:bg-gray-100 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/join"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-3 sm:px-5 text-sm sm:text-base rounded-lg transition"
                >
                  Join Us
                </Link>
              </div>
            ) : null}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {session?.user && isMobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4"
          >
            <nav className="flex flex-col space-y-2">
              {session.user.role === "client" ? (
                <>
                  <Link
                    href="/client/dashboard"
                    className={getMobileNavLinkClasses("/client/dashboard")}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/client/browse"
                    className={getMobileNavLinkClasses("/client/browse")}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Browse Developers
                  </Link>
                  <Link
                    href="/client/projects/new"
                    className={`${getMobileNavLinkClasses("/client/projects/new")} flex items-center`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Post a Project
                  </Link>
                  <Link
                    href="/client/projects"
                    className={`${getMobileNavLinkClasses("/client/projects")} flex items-center`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    My Projects
                  </Link>
                  <Link
                    href="/client/messages"
                    className={`relative ${getMobileNavLinkClasses("/client/messages")} flex items-center`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <MessageSquare className="w-4 h-4 mr-3" />
                    Messages
                    <NotificationBadge count={unreadCount} />
                  </Link>
                </>
              ) : session.user.role === "talent" ? (
                <>
                  <Link
                    href="/talent/dashboard"
                    className={getMobileNavLinkClasses("/talent/dashboard")}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/talent/browse"
                    className={getMobileNavLinkClasses("/talent/browse")}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Browse Projects
                  </Link>
                  <Link
                    href="/talent/projects"
                    className={getMobileNavLinkClasses("/talent/projects")}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Projects
                  </Link>
                  <Link
                    href="/talent/messages"
                    className={`relative ${getMobileNavLinkClasses("/talent/messages")} flex items-center`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <MessageSquare className="w-4 h-4 mr-3" />
                    Messages
                    <NotificationBadge count={unreadCount} />
                  </Link>
                </>
              ) : session.user.role === "agency" ? (
                <>
                  <Link
                    href="/agency/dashboard"
                    className={getMobileNavLinkClasses("/agency/dashboard")}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/agency/browse-clients"
                    className={getMobileNavLinkClasses("/agency/browse-clients")}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Browse Clients
                  </Link>
                  <Link
                    href="/agency/browse-developers"
                    className={getMobileNavLinkClasses("/agency/browse-developers")}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Browse Developers
                  </Link>
                  <Link
                    href="/agency/picked-clients"
                    className={getMobileNavLinkClasses("/agency/picked-clients")}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Picked Clients
                  </Link>
                  <Link
                    href="/agency/picked-developers"
                    className={getMobileNavLinkClasses("/agency/picked-developers")}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Picked Developers
                  </Link>
                  <Link
                    href="/agency/messages"
                    className={`relative ${getMobileNavLinkClasses("/agency/messages")} flex items-center`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <MessageSquare className="w-4 h-4 mr-3" />
                    Messages
                    <NotificationBadge count={unreadCount} />
                  </Link>
                </>
              ) : session.user.role === "admin" ? (
                <>
                  <Link
                    href="/admin/dashboard"
                    className={getMobileNavLinkClasses("/admin/dashboard")}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                </>
              ) : null}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
