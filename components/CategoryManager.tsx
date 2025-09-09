'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Category = {
  id: string;
  name: string;
  description?: string;
  color: string;
};

type CategoryManagerProps = {
  categories: Category[];
  onCategoriesChange: () => void;
};

export default function CategoryManager({ categories, onCategoriesChange }: CategoryManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newColor, setNewColor] = useState('#3B82F6');
  const [loading, setLoading] = useState(false);
  
  const supabase = createClient();

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('categories')
      .insert([{
        name: newName,
        description: newDescription || null,
        color: newColor
      }]);

    if (!error) {
      setNewName('');
      setNewDescription('');
      setNewColor('#3B82F6');
      setIsAdding(false);
      onCategoriesChange();
    }
    setLoading(false);
  };

  const deleteCategory = async (id: string) => {
    if (confirm('Delete this category? Competitors using this category will need to be updated.')) {
      await supabase.from('categories').delete().eq('id', id);
      onCategoriesChange();
    }
  };

  return (
    <div className="mb-6 p-4 border rounded">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Manage Categories</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded"
        >
          {isAdding ? 'Cancel' : 'Add Category'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddCategory} className="mb-4 p-3 bg-gray-50 rounded">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Category Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
              className="p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="p-2 border rounded"
            />
            <div className="flex items-center gap-2">
              <label className="text-sm">Color:</label>
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="h-8 w-20"
              />
              <span className="text-sm text-gray-500">{newColor}</span>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-3 px-4 py-2 bg-black text-white rounded disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Category'}
          </button>
        </form>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between p-2 border rounded"
            style={{ borderLeftColor: category.color, borderLeftWidth: '4px' }}
          >
            <div className="flex-1">
              <div className="font-medium text-sm">{category.name}</div>
              {category.description && (
                <div className="text-xs text-gray-500">{category.description}</div>
              )}
            </div>
            <button
              onClick={() => deleteCategory(category.id)}
              className="ml-2 text-red-500 text-lg leading-none"
              title="Delete category"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}