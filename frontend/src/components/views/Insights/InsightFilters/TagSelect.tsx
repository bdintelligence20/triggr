import React from 'react';

const TagSelect = () => {
  const tags = ['HR', 'Operations', 'H&S', 'Damage', 'Training'];

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Tags</label>
      <select className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400">
        <option value="">Select tags</option>
        {tags.map(tag => (
          <option key={tag} value={tag}>{tag}</option>
        ))}
      </select>
    </div>
  );
};

export default TagSelect;