import React, { useState, useRef, useEffect } from 'react';
import { X, Plus } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  suggestions?: string[];
}

const TagInput: React.FC<TagInputProps> = ({ tags, onAddTag, onRemoveTag, suggestions = [] }) => {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredSuggestions = suggestions.filter(
    tag => tag.toLowerCase().includes(input.toLowerCase()) && !tags.includes(tag)
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      onAddTag(input.trim());
      setInput('');
    }
  };

  const handleSuggestionClick = (tag: string) => {
    onAddTag(tag);
    setInput('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-sm"
          >
            {tag}
            <button
              onClick={() => onRemoveTag(tag)}
              className="p-0.5 hover:bg-gray-200 rounded-full"
            >
              <X size={14} />
            </button>
          </span>
        ))}
        <div className="relative" ref={inputRef}>
          <div className="inline-flex items-center gap-1 px-2 py-1 border rounded-full focus-within:border-emerald-400">
            <Plus size={14} className="text-gray-400" />
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Add tag..."
              className="w-24 border-none focus:outline-none text-sm"
            />
          </div>
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute top-full mt-1 w-48 bg-white border rounded-lg shadow-lg py-1 z-10">
              {filteredSuggestions.map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TagInput;