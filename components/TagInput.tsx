'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

type Tag = {
  id: string;
  name: string;
  color: string;
};

type TagInputProps = {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
};

export default function TagInput({ selectedTags, onTagsChange }: TagInputProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    const { data } = await supabase
      .from('tags')
      .select('*')
      .order('name');
    
    if (data) setTags(data);
  };

  const createTag = async (name: string) => {
    setLoading(true);
    const color = `#${Math.floor(Math.random()*16777215).toString(16)}`;
    
    const { data, error } = await supabase
      .from('tags')
      .insert([{ name, color }])
      .select()
      .single();

    if (!error && data) {
      setTags([...tags, data]);
      onTagsChange([...selectedTags, data.id]);
      setInputValue('');
    }
    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setShowDropdown(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const existingTag = tags.find(t => t.name.toLowerCase() === inputValue.toLowerCase());
      
      if (existingTag) {
        if (!selectedTags.includes(existingTag.id)) {
          onTagsChange([...selectedTags, existingTag.id]);
        }
        setInputValue('');
      } else {
        createTag(inputValue.trim());
      }
      setShowDropdown(false);
    }
  };

  const selectTag = (tagId: string) => {
    if (!selectedTags.includes(tagId)) {
      onTagsChange([...selectedTags, tagId]);
    }
    setInputValue('');
    setShowDropdown(false);
  };

  const removeTag = (tagId: string) => {
    onTagsChange(selectedTags.filter(id => id !== tagId));
  };

  const filteredTags = tags.filter(tag => 
    tag.name.toLowerCase().includes(inputValue.toLowerCase()) &&
    !selectedTags.includes(tag.id)
  );

  const selectedTagObjects = tags.filter(tag => selectedTags.includes(tag.id));

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedTagObjects.map(tag => (
          <span
            key={tag.id}
            className="inline-flex items-center px-2 py-1 rounded text-xs text-white"
            style={{ backgroundColor: tag.color }}
          >
            {tag.name}
            <button
              onClick={() => removeTag(tag.id)}
              className="ml-1 text-white hover:text-gray-200"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      
      <input
        type="text"
        placeholder="Add tags (press Enter to create new)"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        disabled={loading}
        className="w-full p-2 border rounded"
      />
      
      {showDropdown && inputValue && filteredTags.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-40 overflow-y-auto">
          {filteredTags.map(tag => (
            <button
              key={tag.id}
              onClick={() => selectTag(tag.id)}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center"
            >
              <span
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: tag.color }}
              />
              {tag.name}
            </button>
          ))}
        </div>
      )}
      
      {showDropdown && inputValue && filteredTags.length === 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg p-3 text-sm text-gray-600">
          Press Enter to create "{inputValue}"
        </div>
      )}
    </div>
  );
}