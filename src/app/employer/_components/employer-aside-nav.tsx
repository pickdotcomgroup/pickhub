"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Briefcase,
  FolderKanban,
  Users,
  UserCheck,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

interface EmployerAsideNavProps {
  companyName?: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function EmployerAsideNav({
  companyName: _companyName = "TechCorp Inc.",
  isCollapsed,
  onToggleCollapse,
}: EmployerAsideNavProps) {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread message count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch("/api/messages/unread-count");
        if (response.ok) {
          const data = (await response.json()) as { count: number };
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
    // {
    //   label: "Dashboard",
    //   href: "/employer/dashboard",
    //   icon: <LayoutDashboard className="w-5 h-5" />,
    // },
    {
      label: "Applicants",
      href: "/employer/applicants",
      icon: <UserCheck className="w-5 h-5" />,
    },
    {
      label: "Jobs",
      href: "/employer/post-a-job",
      icon: <Briefcase className="w-5 h-5" />,
    },
    {
      label: "Projects",
      href: "/employer/projects",
      icon: <FolderKanban className="w-5 h-5" />,
    },
    {
      label: "Talent Pool",
      href: "/employer/talent-pool",
      icon: <Users className="w-5 h-5" />,
    },
    {
      label: "Messages",
      href: "/employer/messages",
      icon: <MessageSquare className="w-5 h-5" />,
      badge: unreadCount,
    },
  ];

  const bottomNavItems: NavItem[] = [
    {
      label: "Settings",
      href: "/employer/settings",
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/employer/dashboard") {
      return pathname === "/employer/dashboard" || pathname === "/employer";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 flex flex-col z-40 transition-all duration-300 ${isCollapsed ? "w-20" : "w-64"}`}
    >
      {/* Toggle Button */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-8 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors z-50"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        )}
      </button>

      {/* Logo Section */}
      <div className={`border-b border-gray-100 ${isCollapsed ? "p-4" : "p-6"}`}>
        <Link href="/employer/dashboard" className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-blue-600 font-semibold text-sm">TC</span>
          </div>
          {!isCollapsed && (
            <div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">TechCorp Inc.</p>
              <p className="text-xs text-gray-500">Enterprise Plan</p>
            </div>
            </div>
          )}
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
              className={`relative flex items-center ${isCollapsed ? "justify-center" : "justify-between"} px-4 py-3 rounded-lg transition-all duration-200 group ${active
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              title={isCollapsed ? item.label : undefined}
            >
              <div className={`flex items-center ${isCollapsed ? "" : "space-x-3"}`}>
                <span
                  className={`${active
                      ? "text-blue-600"
                      : "text-gray-400 group-hover:text-gray-600"
                    }`}
                >
                  {item.icon}
                </span>
                {!isCollapsed && <span className="text-sm">{item.label}</span>}
              </div>
              {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
                <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
              {isCollapsed && item.badge !== undefined && item.badge > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full" />
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
              className={`flex items-center ${isCollapsed ? "justify-center" : "space-x-3"} px-4 py-3 rounded-lg transition-all duration-200 group ${active
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              title={isCollapsed ? item.label : undefined}
            >
              <span
                className={`${active
                    ? "text-blue-600"
                    : "text-gray-400 group-hover:text-gray-600"
                  }`}
              >
                {item.icon}
              </span>
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
