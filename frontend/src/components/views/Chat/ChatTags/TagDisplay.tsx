import React from 'react';
import { Tag } from 'lucide-react';

interface TagDisplayProps {
  tags: string[];
}

const TagDisplay: React.FC<TagDisplayProps> = ({ tags }) => {
  if (tags.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b bg-gray-50">
      <Tag size={16} className="text-gray-400" />
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <span
            key={tag}
            className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-sm"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default TagDisplay;