import * as React from "react";
import { Link } from "react-router-dom";  // Import Link from React Router
import { Menu, Search, Bell, MessageCircle } from 'lucide-react';

interface HeaderProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
}

const Header = ({ isMobileMenuOpen, setIsMobileMenuOpen }: HeaderProps) => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Left Side: Logo & Mobile Menu Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-bold text-emerald-400">triggrHub</h1>
        </div>

        {/* Right Side: Search, Notifications & Profile */}
        <div className="flex items-center gap-4">
          {/* Search Box */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
            <Search size={20} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none focus:outline-none"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-100 rounded-lg">
            <Bell size={24} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile Avatar */}
          <div className="w-8 h-8 bg-emerald-400 rounded-full"></div>

          {/* ✅ NEW: Test Chat Link */}
          <Link
            to="/test-chat"
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
          >
            <MessageCircle size={20} />
            <span>Test Chat</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
