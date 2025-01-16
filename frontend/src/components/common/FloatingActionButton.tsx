import React, { useState, useRef, useEffect } from 'react';
import { Plus, FileText, MessageSquare } from 'lucide-react';

const FloatingActionButton = () => {
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);
  const fabMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fabMenuRef.current && !fabMenuRef.current.contains(event.target)) {
        setIsNewMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={fabMenuRef} className="fixed bottom-6 right-6 flex flex-col-reverse items-end space-y-reverse space-y-2 z-50">
      {isNewMenuOpen && (
        <div className="flex flex-col items-end space-y-2 mb-2">
          <button 
            onClick={() => setIsNewMenuOpen(false)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-400 text-white rounded-lg hover:bg-emerald-300 shadow-lg transform transition-transform hover:scale-105"
          >
            <FileText size={20} />
            New Report
          </button>
          <button 
            onClick={() => setIsNewMenuOpen(false)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-400 text-white rounded-lg hover:bg-emerald-300 shadow-lg transform transition-transform hover:scale-105"
          >
            <MessageSquare size={20} />
            New Request
          </button>
        </div>
      )}
      <button
        onClick={() => setIsNewMenuOpen(!isNewMenuOpen)}
        className="flex items-center justify-center w-14 h-14 bg-emerald-400 text-white rounded-full hover:bg-emerald-300 shadow-lg transform transition-all hover:scale-105"
      >
        <Plus 
          size={24} 
          className={`transform transition-transform duration-200 ${isNewMenuOpen ? 'rotate-45' : ''}`} 
        />
      </button>
    </div>
  );
};

export default FloatingActionButton;