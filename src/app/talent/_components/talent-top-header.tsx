"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Search, Bell, Settings, LogOut, User } from "lucide-react";
import Image from "next/image";

interface TalentTopHeaderProps {
  userRole?: string;
}

export default function TalentTopHeader({ userRole = "Full Stack Developer" }: TalentTopHeaderProps) {
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notificationCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/signin" });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const userName = session?.user?.name ?? "Developer";
  const userEmail = session?.user?.email ?? "";
  const userImage = session?.user?.image;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Search Bar */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for jobs, skills, or projects..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4 ml-4">
          {/* Notification Bell */}
          <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition">
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>

          {/* Find Jobs Button */}
          <Link
            href="/talent/jobs"
            className="hidden md:flex items-center space-x-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <span>Find Jobs</span>
          </Link>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-3 p-1.5 rounded-lg hover:bg-gray-100 transition"
            >
              {/* User Info */}
              <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-sm font-medium text-gray-900">{userName}</span>
                <span className="text-xs text-gray-500">{userRole}</span>
              </div>
              {/* Avatar */}
              {userImage ? (
                <Image
                  src={userImage}
                  alt={userName}
                  width={36}
                  height={36}
                  className="w-9 h-9 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm border-2 border-blue-200">
                  {getInitials(userName)}
                </div>
              )}
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    {userImage ? (
                      <Image
                        src={userImage}
                        alt={userName}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                        {getInitials(userName)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{userName}</p>
                      <p className="text-sm text-gray-500 truncate">{userEmail}</p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <Link
                    href="/talent/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition"
                  >
                    <User className="w-4 h-4 text-gray-400" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    href="/talent/settings"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition"
                  >
                    <Settings className="w-4 h-4 text-gray-400" />
                    <span>Settings</span>
                  </Link>
                </div>

                {/* Logout */}
                <div className="border-t border-gray-100 pt-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full px-4 py-2.5 text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
