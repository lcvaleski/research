'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import CategoryManager from '@/components/CategoryManager';
import TagInput from '@/components/TagInput';

type Category = {
  id: string;
  name: string;
  description?: string;
  color: string;
};

type Competitor = {
  id: string;
  name: string;
  url: string;
  category?: string;
  category_id?: string;
  categories?: Category;
  notes?: string;
  created_at: string;
};

type Tag = {
  id: string;
  name: string;
  color: string;
};

type Research = {
  id: string;
  type: 'link' | 'thought';
  title: string;
  content: string;
  url?: string;
  category?: string;
  created_at: string;
  research_tags?: { tags: Tag }[];
};


export default function Home() {
  const [activeTab, setActiveTab] = useState<'competitors' | 'research'>('competitors');
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [research, setResearch] = useState<Research[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  
  // Competitor form state
  const [compName, setCompName] = useState('');
  const [compUrl, setCompUrl] = useState('');
  const [compCategoryId, setCompCategoryId] = useState<string>('');
  const [compNotes, setCompNotes] = useState('');
  
  // Research form state
  const [resType, setResType] = useState<'link' | 'thought'>('link');
  const [resTitle, setResTitle] = useState('');
  const [resContent, setResContent] = useState('');
  const [resUrl, setResUrl] = useState('');
  const [resCategory, setResCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    loadCategories();
    loadCompetitors();
    loadResearch();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (categories.length > 0 && !compCategoryId) {
      setCompCategoryId(categories[0].id);
    }
  }, [categories]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (data) setCategories(data);
  };

  const loadCompetitors = async () => {
    const { data } = await supabase
      .from('competitors')
      .select('*, categories(*)')
      .order('created_at', { ascending: false });
    
    if (data) setCompetitors(data);
  };

  const loadResearch = async () => {
    const { data } = await supabase
      .from('research')
      .select('*, research_tags(tags(*))')
      .order('created_at', { ascending: false });
    
    if (data) setResearch(data);
  };

  const handleCompetitorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compCategoryId) return;
    
    setLoading(true);

    const { error } = await supabase
      .from('competitors')
      .insert([{
        name: compName,
        url: compUrl,
        category_id: compCategoryId,
        notes: compNotes || null
      }]);

    if (!error) {
      setCompName('');
      setCompUrl('');
      setCompNotes('');
      await loadCompetitors();
    }
    setLoading(false);
  };

  const handleResearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: researchData, error: researchError } = await supabase
      .from('research')
      .insert([{
        type: resType,
        title: resTitle,
        content: resContent,
        url: resType === 'link' ? resUrl : null,
        category: resCategory || null
      }])
      .select()
      .single();

    if (!researchError && researchData && selectedTags.length > 0) {
      const tagInserts = selectedTags.map(tagId => ({
        research_id: researchData.id,
        tag_id: tagId
      }));
      
      await supabase
        .from('research_tags')
        .insert(tagInserts);
    }

    if (!researchError) {
      setResTitle('');
      setResContent('');
      setResUrl('');
      setResCategory('');
      setSelectedTags([]);
      await loadResearch();
    }
    setLoading(false);
  };

  const deleteCompetitor = async (id: string) => {
    await supabase.from('competitors').delete().eq('id', id);
    await loadCompetitors();
  };

  const deleteResearch = async (id: string) => {
    await supabase.from('research').delete().eq('id', id);
    await loadResearch();
  };

  const filteredCompetitors = selectedCategory === 'all' 
    ? competitors 
    : competitors.filter(c => c.category_id === selectedCategory);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-8">board</h1>
      
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('competitors')}
          className={`pb-2 px-1 ${activeTab === 'competitors' ? 'border-b-2 border-black font-semibold' : ''}`}
        >
          Competitors
        </button>
        <button
          onClick={() => setActiveTab('research')}
          className={`pb-2 px-1 ${activeTab === 'research' ? 'border-b-2 border-black font-semibold' : ''}`}
        >
          Research & Thoughts
        </button>
      </div>

      {activeTab === 'competitors' ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setShowCategoryManager(!showCategoryManager)}
              className="px-3 py-1 text-sm bg-gray-200 rounded"
            >
              {showCategoryManager ? 'Hide' : 'Manage'} Categories
            </button>
          </div>
          
          {showCategoryManager && (
            <CategoryManager 
              categories={categories} 
              onCategoriesChange={() => {
                loadCategories();
                loadCompetitors();
              }}
            />
          )}

          <form onSubmit={handleCompetitorSubmit} className="mb-8 p-4 border rounded">
            <h3 className="font-semibold mb-4">Add Competitor</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Competitor Name"
                value={compName}
                onChange={(e) => setCompName(e.target.value)}
                required
                className="p-2 border rounded"
              />

              <input
                type="url"
                placeholder="Website URL"
                value={compUrl}
                onChange={(e) => setCompUrl(e.target.value)}
                required
                className="p-2 border rounded"
              />

              <select
                value={compCategoryId}
                onChange={(e) => setCompCategoryId(e.target.value)}
                className="p-2 border rounded"
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>

              <textarea
                placeholder="Notes (optional)"
                value={compNotes}
                onChange={(e) => setCompNotes(e.target.value)}
                rows={1}
                className="p-2 border rounded"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="mt-4 px-4 py-2 bg-black text-white rounded disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Competitor'}
            </button>
          </form>

          <div className="mb-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCompetitors.map((competitor) => (
              <div key={competitor.id} className="p-4 border rounded">
                <div className="flex justify-between items-start mb-2">
                  <span 
                    className="text-xs px-2 py-1 rounded text-white"
                    style={{ backgroundColor: competitor.categories?.color || '#6B7280' }}
                  >
                    {competitor.categories?.name || 'Uncategorized'}
                  </span>
                  <button 
                    onClick={() => deleteCompetitor(competitor.id)}
                    className="text-red-500 text-sm"
                  >
                    ×
                  </button>
                </div>
                
                <h3 className="font-semibold mb-1">{competitor.name}</h3>
                
                <a 
                  href={competitor.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 underline text-sm block mb-2"
                >
                  {competitor.url}
                </a>
                
                {competitor.notes && (
                  <p className="text-sm text-gray-600">{competitor.notes}</p>
                )}
                
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(competitor.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <form onSubmit={handleResearchSubmit} className="mb-8 p-4 border rounded">
            <h3 className="font-semibold mb-4">Add Research</h3>
            
            <div className="mb-4">
              <label className="block mb-2">
                Type:
                <select 
                  value={resType} 
                  onChange={(e) => setResType(e.target.value as 'link' | 'thought')}
                  className="ml-2 p-1 border rounded"
                >
                  <option value="link">Link</option>
                  <option value="thought">Thought</option>
                </select>
              </label>
            </div>

            <input
              type="text"
              placeholder="Title"
              value={resTitle}
              onChange={(e) => setResTitle(e.target.value)}
              required
              className="w-full p-2 mb-2 border rounded"
            />

            {resType === 'link' && (
              <input
                type="url"
                placeholder="URL"
                value={resUrl}
                onChange={(e) => setResUrl(e.target.value)}
                required
                className="w-full p-2 mb-2 border rounded"
              />
            )}

            <textarea
              placeholder={resType === 'link' ? 'Notes about this link' : 'Your thoughts...'}
              value={resContent}
              onChange={(e) => setResContent(e.target.value)}
              required
              rows={3}
              className="w-full p-2 mb-2 border rounded"
            />

            <input
              type="text"
              placeholder="Category (optional)"
              value={resCategory}
              onChange={(e) => setResCategory(e.target.value)}
              className="w-full p-2 mb-2 border rounded"
            />

            {resType === 'thought' && (
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Tags:</label>
                <TagInput 
                  selectedTags={selectedTags}
                  onTagsChange={setSelectedTags}
                />
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </form>

          <div className="space-y-4">
            {research.map((item) => (
              <div key={item.id} className="p-4 border rounded">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded mr-2">
                      {item.type}
                    </span>
                    {item.category && (
                      <span className="text-xs px-2 py-1 bg-blue-100 rounded mr-2">
                        {item.category}
                      </span>
                    )}
                    {item.research_tags?.map(rt => rt.tags).filter(Boolean).map((tag: Tag) => (
                      <span
                        key={tag.id}
                        className="text-xs px-2 py-1 rounded text-white mr-1"
                        style={{ backgroundColor: tag.color }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                  <button 
                    onClick={() => deleteResearch(item.id)}
                    className="text-red-500 text-sm"
                  >
                    Delete
                  </button>
                </div>
                
                <h3 className="font-semibold mb-1">{item.title}</h3>
                
                {item.url && (
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 underline text-sm block mb-2"
                  >
                    {item.url}
                  </a>
                )}
                
                <p className="text-gray-700 whitespace-pre-wrap">{item.content}</p>
                
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(item.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
