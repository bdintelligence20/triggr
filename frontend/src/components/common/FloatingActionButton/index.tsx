import React, { useState, useRef, useEffect } from 'react';
import FABButton from './FABButton';
import FABMenu from './FABMenu';
import { useChatRedirect } from './ChatRedirect';

const FloatingActionButton = () => {
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);
  const fabMenuRef = useRef<HTMLDivElement>(null);

  const redirectToReportChat = useChatRedirect({ type: 'report' });
  const redirectToRequestChat = useChatRedirect({ type: 'request' });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fabMenuRef.current && !fabMenuRef.current.contains(event.target as Node)) {
        setIsNewMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleReportClick = () => {
    setIsNewMenuOpen(false);
    redirectToReportChat();
  };

  const handleRequestClick = () => {
    setIsNewMenuOpen(false);
    redirectToRequestChat();
  };

  return (
    <div ref={fabMenuRef} className="fixed bottom-6 right-6 flex flex-col-reverse items-end space-y-reverse space-y-2 z-50">
      {isNewMenuOpen && (
        <FABMenu
          onReportClick={handleReportClick}
          onRequestClick={handleRequestClick}
        />
      )}
      <FABButton
        isOpen={isNewMenuOpen}
        onClick={() => setIsNewMenuOpen(!isNewMenuOpen)}
      />
    </div>
  );
};

export default FloatingActionButton;