import React from 'react';

interface TagsCardProps {
  tags: string[];
}

const TagsCard = ({ tags }: TagsCardProps) => (
  <div className="bg-white rounded-lg shadow p-4">
    <h3 className="text-sm font-medium text-gray-500 mb-3">Popular Tags</h3>
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-sm"
        >
          {tag}
        </span>
      ))}
    </div>
  </div>
);

export default TagsCard;