import React, { useRef, useEffect } from 'react';
import { Plus, MessageSquare } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { navItems } from '../data/navigation';

interface SidebarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
}

const Sidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen }: SidebarProps) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen, setIsMobileMenuOpen]);

  const handleNavigation = (path: string) => {
    navigate(`/${path}`);
    setIsMobileMenuOpen(false);
  };

  const currentPath = location.pathname.split('/')[1] || 'dashboard';

  return (
    <>
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/20 lg:hidden z-30" />
      )}

      <aside 
        ref={sidebarRef}
        className={`
          fixed lg:sticky top-0 left-0 z-40
          w-64 h-[calc(100vh-64px)]
          bg-white border-r border-gray-200
          transform lg:transform-none transition-transform duration-200
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
      >
        <nav className="flex-1 p-4 space-y-1">
          <div className="flex justify-between items-center lg:hidden mb-4">
            <h2 className="font-semibold">Menu</h2>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <Plus size={24} className="rotate-45 text-gray-500" />
            </button>
          </div>

          {navItems.filter(item => item.id !== 'chat').map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors
                  ${currentPath === item.id 
                    ? 'bg-emerald-100 text-emerald-400' 
                    : 'text-gray-700 hover:bg-gray-50'}
                `}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Chat Button at Bottom */}
        <div className="p-4 border-t">
          <button
            onClick={() => handleNavigation('chat')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-400 text-white rounded-lg hover:bg-emerald-300 transition-colors"
          >
            <MessageSquare size={20} />
            <span>Chat</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;