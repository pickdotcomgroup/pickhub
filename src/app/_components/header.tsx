"use client";

import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { MessageSquare, Building2 } from "lucide-react";

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
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] =
    useState(false);
  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      type: string;
      title: string;
      message: string;
      isRead: boolean;
      createdAt: string;
      relatedProjectId?: string | null;
      relatedApplicationId?: string | null;
    }>
  >([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);

  // Helper function to check if a path is active
  const isActivePath = (path: string) => {
    return pathname === path;
  };

  // Helper function to get navigation link classes
  const getNavLinkClasses = (path: string) => {
    const baseClasses = "px-4 py-2 text-sm transition border-b-2";
    const activeClasses = "text-blue-600 border-b-blue-600 font-semibold";
    const inactiveClasses =
      "text-gray-700 hover:text-gray-900 border-b-transparent hover:border-b-gray-300";

    return `${baseClasses} ${isActivePath(path) ? activeClasses : inactiveClasses}`;
  };

  // Helper function for mobile nav link classes
  const getMobileNavLinkClasses = (path: string) => {
    const baseClasses = "px-4 py-3 text-sm rounded-lg transition";
    const activeClasses = "bg-blue-600 text-white font-semibold";
    const inactiveClasses =
      "text-gray-700 hover:text-gray-900 hover:bg-gray-100";

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
  }, [session?.user, pathname]); // Added pathname to refresh when navigating

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
            }>;
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
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target as Node)
      ) {
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
      console.error("Logout failed:", error);
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
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, isRead: true } : notif,
          ),
        );
        setNotificationCount((prev) => Math.max(0, prev - 1));
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
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, isRead: true })),
        );
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
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Mobile Menu Button */}
          {session?.user && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-lg p-2 text-gray-700 transition hover:bg-gray-100 hover:text-gray-900 md:hidden"
              aria-label="Toggle mobile menu"
            >
              <svg
                className="h-6 w-6"
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

          <div
            className={`flex items-center ${!session?.user && pathname === "/wait-list" ? "flex-1" : ""}`}
          >
            <Link
              href="/"
              className="flex items-center space-x-2 text-xl font-bold text-gray-900 sm:text-2xl"
            >
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

            {/* Public Navigation Links - Only show when not authenticated */}
            {!session?.user && pathname !== "/wait-list" && (
              <nav className="ml-8 hidden items-center space-x-1 md:flex">
                <Link
                  href="/how-it-works"
                  className="border-b-2 border-b-transparent px-4 py-2 text-sm text-gray-700 transition hover:border-b-gray-300 hover:text-gray-900"
                >
                  How It Works
                </Link>
                <Link
                  href="/pricing"
                  className="border-b-2 border-b-transparent px-4 py-2 text-sm text-gray-700 transition hover:border-b-gray-300 hover:text-gray-900"
                >
                  Pricing
                </Link>
                <Link
                  href="/blog"
                  className="border-b-2 border-b-transparent px-4 py-2 text-sm text-gray-700 transition hover:border-b-gray-300 hover:text-gray-900"
                >
                  Blog
                </Link>
                <Link
                  href="/about"
                  className="border-b-2 border-b-transparent px-4 py-2 text-sm text-gray-700 transition hover:border-b-gray-300 hover:text-gray-900"
                >
                  About Us
                </Link>
              </nav>
            )}
          </div>

          {/* Public Navigation Links on Right - Only show on wait-list page when not authenticated */}
          {!session?.user && pathname === "/wait-list" && (
            <nav className="hidden items-center space-x-1 md:flex">
              <Link
                href="/how-it-works"
                className="border-b-2 border-b-transparent px-4 py-2 text-sm text-gray-700 transition hover:border-b-gray-300 hover:text-gray-900"
              >
                How It Works
              </Link>
              <Link
                href="/pricing"
                className="border-b-2 border-b-transparent px-4 py-2 text-sm text-gray-700 transition hover:border-b-gray-300 hover:text-gray-900"
              >
                Pricing
              </Link>
              <Link
                href="/blog"
                className="border-b-2 border-b-transparent px-4 py-2 text-sm text-gray-700 transition hover:border-b-gray-300 hover:text-gray-900"
              >
                Blog
              </Link>
              <Link
                href="/about"
                className="border-b-2 border-b-transparent px-4 py-2 text-sm text-gray-700 transition hover:border-b-gray-300 hover:text-gray-900"
              >
                About Us
              </Link>
            </nav>
          )}

          {/* Quick Actions Navigation */}
          {session?.user && (
            <nav className="mr-4 ml-auto hidden items-center space-x-1 md:flex">
              {session.user.role === "client" ? (
                <>
                  <Link
                    href="/client/browse"
                    className={`${getNavLinkClasses("/client/browse")} flex items-center gap-2`}
                  >
                    <span>Browse Developers</span>
                  </Link>
                  <Link
                    href="/client/browse-agencies"
                    className={`${getNavLinkClasses("/client/browse-agencies")} flex items-center gap-2`}
                  >
                    <span>Browse Agencies</span>
                  </Link>
                  <Link
                    href="/client/projects"
                    className={`${getNavLinkClasses("/client/projects")} flex items-center gap-2`}
                  >
                    <span>My Projects</span>
                  </Link>
                  <Link
                    href="/client/projects/new"
                    className="flex items-center gap-2 rounded-lg border-2 border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                  >
                    <span>Post a Project</span>
                  </Link>
                  <Link
                    href="/client/messages"
                    className={`relative ${getNavLinkClasses("/client/messages")}`}
                    aria-label="Messages"
                  >
                    <span>Messages</span>
                    <NotificationBadge count={unreadCount} />
                  </Link>
                </>
              ) : session.user.role === "talent" ? (
                <>
                  <Link
                    href="/developer/trainings"
                    className={`${getNavLinkClasses("/developer/trainings")} flex items-center gap-2`}
                  >
                    Trainings
                  </Link>
                  <Link
                    href="/developer/jobs"
                    className={`${getNavLinkClasses("/developer/jobs")} flex items-center gap-2`}
                  >
                    Browse Job
                  </Link>
                  <Link
                    href="/talent/browse"
                    className={`${getNavLinkClasses("/talent/browse")} flex items-center gap-2`}
                  >
                    Browse Project
                  </Link>
                  <Link
                    href="/talent/messages"
                    className={`relative ${getNavLinkClasses("/talent/messages")}`}
                    aria-label="Messages"
                  >
                    <span>Message</span>
                    <NotificationBadge count={unreadCount} />
                  </Link>
                </>
              ) : session.user.role === "agency" ? (
                <>
                  <Link
                    href="/agency/browse-clients"
                    className={`${getNavLinkClasses("/agency/browse-clients")} flex items-center gap-2`}
                  >
                    <span>Browse Clients</span>
                  </Link>
                  <Link
                    href="/agency/browse-developers"
                    className={`${getNavLinkClasses("/agency/browse-developers")} flex items-center gap-2`}
                  >
                    <span>Browse Developers</span>
                  </Link>
                  <Link
                    href="/agency/picked-clients"
                    className={`${getNavLinkClasses("/agency/picked-clients")} flex items-center gap-2`}
                  >
                    <span>Picked Clients</span>
                  </Link>
                  <Link
                    href="/agency/picked-developers"
                    className={`${getNavLinkClasses("/agency/picked-developers")} flex items-center gap-2`}
                  >
                    <span>Picked Developers</span>
                  </Link>
                  <Link
                    href="/agency/messages"
                    className={`relative ${getNavLinkClasses("/agency/messages")}`}
                    aria-label="Messages"
                  >
                    <span>Messages</span>
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
                    onClick={() =>
                      setIsNotificationDropdownOpen(!isNotificationDropdownOpen)
                    }
                    className="relative rounded-lg p-2 text-gray-700 transition hover:bg-gray-100 hover:text-gray-900"
                    aria-label="Notifications"
                  >
                    <svg
                      className="h-6 w-6"
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
                    <div className="absolute right-0 z-[100] mt-2 flex max-h-[500px] w-80 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl sm:w-96">
                      {/* Header */}
                      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                        <h3 className="text-sm font-semibold text-gray-900">
                          Notifications
                        </h3>
                        {notificationCount > 0 && (
                          <button
                            onClick={markAllNotificationsAsRead}
                            className="text-xs font-medium text-blue-600 hover:text-blue-700"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>

                      {/* Notifications List */}
                      <div className="flex-1 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-8 text-center text-gray-500">
                            <svg
                              className="mx-auto mb-2 h-12 w-12 text-gray-400"
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
                              className={`cursor-pointer border-b border-gray-100 px-4 py-3 transition hover:bg-gray-50 ${
                                !notification.isRead ? "bg-blue-50" : ""
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
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                                      <svg
                                        className="h-5 w-5 text-green-600"
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
                                  ) : notification.type ===
                                    "new_application" ? (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                                      <svg
                                        className="h-5 w-5 text-purple-600"
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
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                      <svg
                                        className="h-5 w-5 text-blue-600"
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
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {notification.title}
                                  </p>
                                  <p className="mt-1 line-clamp-2 text-xs text-gray-600">
                                    {notification.message}
                                  </p>
                                  <p className="mt-1 text-xs text-gray-500">
                                    {formatNotificationTime(
                                      notification.createdAt,
                                    )}
                                  </p>
                                </div>
                                {!notification.isRead && (
                                  <div className="flex-shrink-0">
                                    <div className="h-2 w-2 rounded-full bg-blue-600"></div>
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
                    className="group flex items-center space-x-2 focus:outline-none sm:space-x-3"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-sm font-semibold text-white transition group-hover:ring-2 group-hover:ring-blue-400 sm:h-10 sm:w-10">
                      {getUserInitials(session.user.name)}
                    </div>
                    <svg
                      className={`hidden h-4 w-4 text-gray-700 transition-transform sm:block ${
                        isDropdownOpen ? "rotate-180" : ""
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
                    <div className="absolute right-0 z-[100] mt-2 w-56 rounded-lg border border-gray-200 bg-white py-2 shadow-xl">
                      {/* User Info */}
                      <div className="border-b border-gray-200 px-4 py-3">
                        <p className="text-sm font-semibold text-gray-900">
                          {session.user.name ?? "User"}
                        </p>
                        <p className="truncate text-xs text-gray-600">
                          {session.user.email}
                        </p>
                        {session.user.role && (
                          <p className="mt-1 text-xs text-blue-600 capitalize">
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
                            className="flex items-center px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <svg
                              className="mr-3 h-4 w-4"
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
                            className="flex items-center px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <svg
                              className="mr-3 h-4 w-4"
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
                            className="flex items-center px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <svg
                              className="mr-3 h-4 w-4"
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
                            className="flex items-center px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <svg
                              className="mr-3 h-4 w-4"
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
                            className="flex items-center px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <svg
                              className="mr-3 h-4 w-4"
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
                            className="flex items-center px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <svg
                              className="mr-3 h-4 w-4"
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
                            className="flex items-center px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <svg
                              className="mr-3 h-4 w-4"
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
                          className="flex w-full items-center px-4 py-2 text-sm text-red-600 transition hover:bg-gray-100"
                        >
                          <svg
                            className="mr-3 h-4 w-4"
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
                {pathname !== "/signin" && (
                  <Link
                    href="/signin"
                    className={
                      pathname === "/join"
                        ? "rounded-lg bg-blue-600 px-3 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 sm:px-5 sm:text-base"
                        : "rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 hover:text-gray-900 sm:px-4 sm:text-base"
                    }
                  >
                    Sign In
                  </Link>
                )}
                {pathname !== "/join" && (
                  <Link
                    href="/join"
                    className="rounded-lg bg-blue-600 px-3 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 sm:px-5 sm:text-base"
                  >
                    Join Us
                  </Link>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {session?.user && isMobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="mt-4 border-t border-gray-200 pt-4 pb-4 md:hidden"
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
                    href="/client/browse-agencies"
                    className={`${getMobileNavLinkClasses("/client/browse-agencies")} flex items-center`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Building2 className="mr-3 h-4 w-4" />
                    Browse Agencies
                  </Link>
                  <Link
                    href="/client/projects/new"
                    className="flex items-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg
                      className="mr-3 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Post a Project
                  </Link>
                  <Link
                    href="/client/projects"
                    className={`${getMobileNavLinkClasses("/client/projects")} flex items-center`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg
                      className="mr-3 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    My Projects
                  </Link>
                  <Link
                    href="/client/messages"
                    className={`relative ${getMobileNavLinkClasses("/client/messages")} flex items-center`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <MessageSquare className="mr-3 h-4 w-4" />
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
                    <MessageSquare className="mr-3 h-4 w-4" />
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
                    className={getMobileNavLinkClasses(
                      "/agency/browse-clients",
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Browse Clients
                  </Link>
                  <Link
                    href="/agency/browse-developers"
                    className={getMobileNavLinkClasses(
                      "/agency/browse-developers",
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Browse Developers
                  </Link>
                  <Link
                    href="/agency/picked-clients"
                    className={getMobileNavLinkClasses(
                      "/agency/picked-clients",
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Picked Clients
                  </Link>
                  <Link
                    href="/agency/picked-developers"
                    className={getMobileNavLinkClasses(
                      "/agency/picked-developers",
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Picked Developers
                  </Link>
                  <Link
                    href="/agency/messages"
                    className={`relative ${getMobileNavLinkClasses("/agency/messages")} flex items-center`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <MessageSquare className="mr-3 h-4 w-4" />
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
