"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Briefcase,
  FolderKanban,
  ShoppingBag,
  MessageSquare,
  Settings,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

interface TalentAsideNavProps {
  userName?: string;
}

export default function TalentAsideNav({ userName: _userName = "Alex Dev" }: TalentAsideNavProps) {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread message count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch("/api/messages/unread-count");
        if (response.ok) {
          const data = await response.json() as { count: number };
          setUnreadCount(data.count);
        }
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };

    void fetchUnreadCount();
    // Poll every 30 seconds
    const interval = setInterval(() => void fetchUnreadCount(), 30000);
    return () => clearInterval(interval);
  }, []);

  const mainNavItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/talent/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: "Jobs",
      href: "/talent/jobs",
      icon: <Briefcase className="w-5 h-5" />,
    },
    {
      label: "Projects",
      href: "/talent/projects",
      icon: <FolderKanban className="w-5 h-5" />,
    },
    {
      label: "Upskilling Marketplace",
      href: "/talent/upskilling",
      icon: <ShoppingBag className="w-5 h-5" />,
    },
    {
      label: "Messages",
      href: "/talent/messages",
      icon: <MessageSquare className="w-5 h-5" />,
      badge: unreadCount,
    }
  ];

  const bottomNavItems: NavItem[] = [
    {
      label: "Settings",
      href: "/talent/settings",
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/talent/dashboard") {
      return pathname === "/talent/dashboard" || pathname === "/talent";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-40">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-100">
        <Link href="/talent/dashboard" className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-lg leading-tight">
              DevUp
            </h1>
          </div>
        </Link>
      </div>

      {/* Main Navigation Items */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {mainNavItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group ${
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center space-x-3">
                <span
                  className={`${
                    active
                      ? "text-blue-600"
                      : "text-gray-400 group-hover:text-gray-600"
                  }`}
                >
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation Items */}
      <div className="p-4 border-t border-gray-100">
        {bottomNavItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span
                className={`${
                  active
                    ? "text-blue-600"
                    : "text-gray-400 group-hover:text-gray-600"
                }`}
              >
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
