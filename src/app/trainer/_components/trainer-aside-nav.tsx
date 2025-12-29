"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

interface TrainerAsideNavProps {
  organizationName?: string;
}

export default function TrainerAsideNav({ organizationName = "Code Academy" }: TrainerAsideNavProps) {
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

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/trainer/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: "Course Management",
      href: "/trainer/course-management",
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      label: "Enrollments",
      href: "/trainer/enrollments",
      icon: <Users className="w-5 h-5" />,
    },
    {
      label: "Messages",
      href: "/trainer/messages",
      icon: <MessageSquare className="w-5 h-5" />,
      badge: unreadCount,
    },
    {
      label: "Analytics",
      href: "/trainer/analytics",
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      label: "Settings",
      href: "/trainer/settings",
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/trainer/dashboard") {
      return pathname === "/trainer/dashboard" || pathname === "/trainer";
    }
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/signin" });
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-40">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-100">
        <Link href="/trainer/dashboard" className="flex items-center space-x-3">
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
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-lg leading-tight">
              {organizationName}
            </h1>
            <p className="text-xs text-gray-500 uppercase tracking-wider">
              Trainer Provider
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
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

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 w-full px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
