'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';


type Competitor = {
  id: string;
  name: string;
  url: string;
  notes?: string;
  created_at: string;
};


type Research = {
  id: string;
  type: 'link' | 'thought';
  title: string;
  content: string;
  url?: string;
  created_at: string;
};


type Invitation = {
  id: string;
  content: string;
  created_at: string;
};


export default function Home() {
  const [activeTab, setActiveTab] = useState<'competitors' | 'research' | 'invitations' | 'timeline'>('research');
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [research, setResearch] = useState<Research[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  
  // Competitor form state
  const [compName, setCompName] = useState('');
  const [compUrl, setCompUrl] = useState('');
  const [compNotes, setCompNotes] = useState('');
  
  // Research form state
  const [resContent, setResContent] = useState('');

  // Invitation form state
  const [invContent, setInvContent] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [showCompetitorForm, setShowCompetitorForm] = useState(false);
  const [showThoughtsForm, setShowThoughtsForm] = useState(false);
  const [showInvitationForm, setShowInvitationForm] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    loadCompetitors();
    loadResearch();
    loadInvitations();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  const loadCompetitors = async () => {
    const { data } = await supabase
      .from('competitors')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setCompetitors(data);
  };

  const loadResearch = async () => {
    const { data } = await supabase
      .from('research')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setResearch(data);
  };

  const loadInvitations = async () => {
    const { data } = await supabase
      .from('invitations')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setInvitations(data);
  };

  const handleCompetitorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);

    const competitorData = {
      name: compName,
      url: compUrl,
      notes: compNotes || null
    };

    const { error } = await supabase
      .from('competitors')
      .insert([competitorData]);

    if (!error) {
      setCompName('');
      setCompUrl('');
      setCompNotes('');
      setShowCompetitorForm(false);
      await loadCompetitors();
    } else {
      console.error('Error saving competitor:', error);
      alert('Failed to save competitor. Please try again.');
    }
    setLoading(false);
  };

  const handleResearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('research')
      .insert([{
        type: 'thought',
        title: resContent.substring(0, 50) + (resContent.length > 50 ? '...' : ''),
        content: resContent,
        url: null
      }]);

    if (!error) {
      setResContent('');
      setShowThoughtsForm(false);
      await loadResearch();
    }
    setLoading(false);
  };

  const handleInvitationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('invitations')
      .insert([{ content: invContent }]);

    if (!error) {
      setInvContent('');
      setShowInvitationForm(false);
      await loadInvitations();
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

  const deleteInvitation = async (id: string) => {
    await supabase.from('invitations').delete().eq('id', id);
    await loadInvitations();
  };


  return (
    <div className="max-w-6xl mx-auto p-4">
      
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
          Thoughts
        </button>
        <button
          onClick={() => setActiveTab('invitations')}
          className={`pb-2 px-1 ${activeTab === 'invitations' ? 'border-b-2 border-black font-semibold' : ''}`}
        >
          Invitations
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`pb-2 px-1 ${activeTab === 'timeline' ? 'border-b-2 border-black font-semibold' : ''}`}
        >
          Timeline
        </button>
      </div>

      {activeTab === 'invitations' ? (
        <>
          <div className="mb-8">
            <button
              onClick={() => setShowInvitationForm(!showInvitationForm)}
              className="flex items-center gap-2 p-2 text-lg font-semibold hover:bg-gray-50 rounded"
            >
              <span className={`transform transition-transform ${showInvitationForm ? 'rotate-45' : ''}`}>+</span>
              Add Content Idea
            </button>

            {showInvitationForm && (
              <form onSubmit={handleInvitationSubmit} className="mt-4 p-4 border rounded">
                <textarea
                  placeholder="Content idea..."
                  value={invContent}
                  onChange={(e) => setInvContent(e.target.value)}
                  required
                  rows={4}
                  className="w-full p-2 mb-3 border rounded"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Idea'}
                </button>
              </form>
            )}
          </div>

          <div className="space-y-4">
            {invitations.map((item) => (
              <div key={item.id} className="p-4 border rounded">
                <div className="flex justify-between items-start mb-2">
                  <button
                    onClick={() => deleteInvitation(item.id)}
                    className="text-red-500 text-sm ml-auto"
                  >
                    ×
                  </button>
                </div>

                <p className="text-gray-700 whitespace-pre-wrap">{item.content}</p>

                <p className="text-xs text-gray-400 mt-2">
                  {new Date(item.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </>
      ) : activeTab === 'competitors' ? (
        <>

          <div className="mb-8">
            <button
              onClick={() => setShowCompetitorForm(!showCompetitorForm)}
              className="flex items-center gap-2 p-2 text-lg font-semibold hover:bg-gray-50 rounded"
            >
              <span className={`transform transition-transform ${showCompetitorForm ? 'rotate-45' : ''}`}>+</span>
              Add Competitor
            </button>
            
            {showCompetitorForm && (
              <form onSubmit={handleCompetitorSubmit} className="mt-4 p-4 border rounded">
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

                  <textarea
                    placeholder="Notes (optional)"
                    value={compNotes}
                    onChange={(e) => setCompNotes(e.target.value)}
                    rows={1}
                    className="p-2 border rounded col-span-2"
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
            )}
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {competitors.map((competitor) => (
              <div key={competitor.id} className="p-4 border rounded">
                <div className="flex justify-between items-start mb-2">
                  <button 
                    onClick={() => deleteCompetitor(competitor.id)}
                    className="text-red-500 text-sm"
                  >
                    ×
                  </button>
                </div>
                
                <a
                  href={competitor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold mb-1 text-blue-500 hover:underline block break-words"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 100,
                    WebkitBoxOrient: 'vertical',
                    wordBreak: 'break-all',
                    maxWidth: '70ch'
                  }}
                >
                  {competitor.name}
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
      ) : activeTab === 'timeline' ? (
        <>
          <div className="p-4">
            <div className="flex flex-col items-center">
              {/* Past weeks */}
              <div className="border-2 border-gray-300 rounded-lg px-6 py-3 mb-0 bg-gray-50">
                <p className="text-center font-medium">Week 1: Ideation</p>
              </div>
              <div className="w-0.5 h-8 bg-gray-300"></div>

              <div className="border-2 border-gray-300 rounded-lg px-6 py-3 mb-0 bg-gray-50">
                <p className="text-center font-medium">Week 2: Ideation</p>
              </div>
              <div className="w-0.5 h-8 bg-gray-300"></div>

              <div className="border-2 border-gray-300 rounded-lg px-6 py-3 mb-0 bg-gray-50">
                <p className="text-center font-medium">Week 3: Ideation</p>
              </div>
              <div className="w-0.5 h-8 bg-gray-300"></div>

              <div className="border-2 border-gray-300 rounded-lg px-6 py-3 mb-0 bg-gray-50">
                <p className="text-center font-medium">Week 4: Ideation</p>
              </div>
              <div className="w-0.5 h-8 bg-gray-300"></div>

              {/* Current week - highlighted */}
              <div className="border-2 border-black rounded-lg px-8 py-4 mb-0 bg-yellow-50">
                <p className="text-center font-semibold text-lg">Week 5: Ideation (Current)</p>
              </div>
              <div className="w-0.5 h-8 bg-gray-400"></div>

              {/* Future weeks */}
              <div className="border-2 border-blue-400 rounded-lg px-6 py-3 mb-0 bg-blue-50">
                <p className="text-center font-medium">Week 6: Invitation Content</p>
              </div>
              <div className="w-0.5 h-8 bg-gray-400"></div>

              <div className="border-2 border-blue-400 rounded-lg px-6 py-3 mb-0 bg-blue-50">
                <p className="text-center font-medium">Week 7: Invitation Content</p>
              </div>
              <div className="w-0.5 h-8 bg-gray-400"></div>

              <div className="border-2 border-green-500 rounded-lg px-6 py-3 mb-0 bg-green-50">
                <p className="text-center font-medium">Week 8: MVP Creation</p>
              </div>
              <div className="w-0.5 h-8 bg-gray-400"></div>

              <div className="border-2 border-green-500 rounded-lg px-6 py-3 mb-0 bg-green-50">
                <p className="text-center font-medium">Week 9: MVP Creation</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="mb-8">
            <button
              onClick={() => setShowThoughtsForm(!showThoughtsForm)}
              className="flex items-center gap-2 p-2 text-lg font-semibold hover:bg-gray-50 rounded"
            >
              <span className={`transform transition-transform ${showThoughtsForm ? 'rotate-45' : ''}`}>+</span>
              Add Thought
            </button>
            
            {showThoughtsForm && (
              <form onSubmit={handleResearchSubmit} className="mt-4 p-4 border rounded">
                <textarea
                  placeholder="What's on your mind?"
                  value={resContent}
                  onChange={(e) => setResContent(e.target.value)}
                  required
                  rows={4}
                  className="w-full p-2 mb-3 border rounded"
                />

                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Thought'}
                </button>
              </form>
            )}
          </div>


          <div className="space-y-4">
            {research.map((item) => (
              <div key={item.id} className="p-4 border rounded">
                <div className="flex justify-between items-start mb-2">
                  <button 
                    onClick={() => deleteResearch(item.id)}
                    className="text-red-500 text-sm ml-auto"
                  >
                    ×
                  </button>
                </div>
                
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
