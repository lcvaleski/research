'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

type Post = {
  id: string;
  type: 'link' | 'thought';
  title: string;
  content: string;
  url?: string;
  category?: string;
  created_at: string;
};

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [type, setType] = useState<'link' | 'thought'>('link');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setPosts(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('posts')
      .insert([{
        type,
        title,
        content,
        url: type === 'link' ? url : null,
        category: category || null
      }]);

    if (!error) {
      setTitle('');
      setContent('');
      setUrl('');
      setCategory('');
      await loadPosts();
    }
    setLoading(false);
  };

  const deletePost = async (id: string) => {
    await supabase.from('posts').delete().eq('id', id);
    await loadPosts();
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-8">Research Board</h1>
      
      <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded">
        <div className="mb-4">
          <label className="block mb-2">
            Type:
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value as 'link' | 'thought')}
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
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full p-2 mb-2 border rounded"
        />

        {type === 'link' && (
          <input
            type="url"
            placeholder="URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="w-full p-2 mb-2 border rounded"
          />
        )}

        <textarea
          placeholder={type === 'link' ? 'Notes about this link' : 'Your thoughts...'}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={3}
          className="w-full p-2 mb-2 border rounded"
        />

        <input
          type="text"
          placeholder="Category (optional)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />

        <button 
          type="submit" 
          disabled={loading}
          className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </form>

      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="p-4 border rounded">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-xs px-2 py-1 bg-gray-100 rounded mr-2">
                  {post.type}
                </span>
                {post.category && (
                  <span className="text-xs px-2 py-1 bg-blue-100 rounded">
                    {post.category}
                  </span>
                )}
              </div>
              <button 
                onClick={() => deletePost(post.id)}
                className="text-red-500 text-sm"
              >
                Delete
              </button>
            </div>
            
            <h3 className="font-semibold mb-1">{post.title}</h3>
            
            {post.url && (
              <a 
                href={post.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 underline text-sm block mb-2"
              >
                {post.url}
              </a>
            )}
            
            <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
            
            <p className="text-xs text-gray-400 mt-2">
              {new Date(post.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
