'use client';

import React, { useState, useEffect } from 'react';
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



type Artist = {
  id: string;
  name: string;
  profile_url: string;
  specialty?: string;
  notes?: string;
  created_at: string;
};


type SME = {
  id: string;
  name: string;
  profile_url: string;
  expertise?: string;
  organization?: string;
  notes?: string;
  created_at: string;
};


export default function Home() {
  const [activeTab, setActiveTab] = useState<'competitors' | 'research' | 'timeline' | 'artists' | 'sme'>('research');
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [research, setResearch] = useState<Research[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [smeList, setSmeList] = useState<SME[]>([]);
  
  // Competitor form state
  const [compName, setCompName] = useState('');
  const [compUrl, setCompUrl] = useState('');
  const [compNotes, setCompNotes] = useState('');
  


  // Artist form state
  const [artistName, setArtistName] = useState('');
  const [artistUrl, setArtistUrl] = useState('');
  const [artistSpecialty, setArtistSpecialty] = useState('');
  const [artistNotes, setArtistNotes] = useState('');

  // SME form state
  const [smeName, setSmeName] = useState('');
  const [smeUrl, setSmeUrl] = useState('');
  const [smeExpertise, setSmeExpertise] = useState('');
  const [smeOrganization, setSmeOrganization] = useState('');
  const [smeNotes, setSmeNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [showCompetitorForm, setShowCompetitorForm] = useState(false);
  const [showArtistForm, setShowArtistForm] = useState(false);
  const [showSmeForm, setShowSmeForm] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    loadCompetitors();
    loadResearch();
    loadArtists();
    loadSmeList();
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


  const loadArtists = async () => {
    const { data } = await supabase
      .from('artists')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setArtists(data);
  };

  const loadSmeList = async () => {
    const { data } = await supabase
      .from('sme')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setSmeList(data);
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



  const deleteCompetitor = async (id: string) => {
    await supabase.from('competitors').delete().eq('id', id);
    await loadCompetitors();
  };

  const deleteResearch = async (id: string) => {
    await supabase.from('research').delete().eq('id', id);
    await loadResearch();
  };


  const handleArtistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('artists')
      .insert([{
        name: artistName,
        profile_url: artistUrl,
        specialty: artistSpecialty || null,
        notes: artistNotes || null
      }]);

    if (!error) {
      setArtistName('');
      setArtistUrl('');
      setArtistSpecialty('');
      setArtistNotes('');
      setShowArtistForm(false);
      await loadArtists();
    }
    setLoading(false);
  };

  const handleSmeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('sme')
      .insert([{
        name: smeName,
        profile_url: smeUrl,
        expertise: smeExpertise || null,
        organization: smeOrganization || null,
        notes: smeNotes || null
      }]);

    if (!error) {
      setSmeName('');
      setSmeUrl('');
      setSmeExpertise('');
      setSmeOrganization('');
      setSmeNotes('');
      setShowSmeForm(false);
      await loadSmeList();
    }
    setLoading(false);
  };

  const deleteArtist = async (id: string) => {
    await supabase.from('artists').delete().eq('id', id);
    await loadArtists();
  };

  const deleteSme = async (id: string) => {
    await supabase.from('sme').delete().eq('id', id);
    await loadSmeList();
  };


  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <div />
        <a
          href="/admin/unbound"
          className="px-4 py-2 border border-black rounded hover:bg-gray-50 text-sm"
        >
          Unbound Admin
        </a>
      </div>

      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('competitors')}
          className={`pb-2 px-1 ${activeTab === 'competitors' ? 'border-b-2 border-black font-semibold' : ''}`}
        >
          Competitors
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`pb-2 px-1 ${activeTab === 'timeline' ? 'border-b-2 border-black font-semibold' : ''}`}
        >
          Timeline
        </button>
        <button
          onClick={() => setActiveTab('artists')}
          className={`pb-2 px-1 ${activeTab === 'artists' ? 'border-b-2 border-black font-semibold' : ''}`}
        >
          Artists
        </button>
        <button
          onClick={() => setActiveTab('sme')}
          className={`pb-2 px-1 ${activeTab === 'sme' ? 'border-b-2 border-black font-semibold' : ''}`}
        >
          SME
        </button>
      </div>

      {activeTab === 'competitors' ? (
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
              {(() => {
                const startDate = new Date('2025-09-01'); // Project start date
                const today = new Date();
                const msPerWeek = 7 * 24 * 60 * 60 * 1000;
                const totalWeeks = Math.ceil((today.getTime() - startDate.getTime()) / msPerWeek);

                const weeks = [];

                for (let i = 1; i <= totalWeeks; i++) {
                  const weekStart = new Date(startDate.getTime() + (i - 1) * msPerWeek);
                  const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
                  const isCurrentWeek = today >= weekStart && today <= weekEnd;

                  weeks.push(
                    <React.Fragment key={i}>
                      <div className={`border-2 ${isCurrentWeek ? 'border-black' : 'border-gray-300'} rounded-lg px-6 py-3 mb-0 ${isCurrentWeek ? 'bg-yellow-50' : 'bg-gray-50'}`}>
                        <p className={`text-center ${isCurrentWeek ? 'font-semibold text-lg' : 'font-medium'}`}>
                          Week {i}
                          {isCurrentWeek && ' (Current)'}
                        </p>
                        <p className="text-xs text-gray-500 text-center mt-1">
                          {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      {i < totalWeeks && <div className="w-0.5 h-8 bg-gray-300"></div>}
                    </React.Fragment>
                  );
                }

                return (
                  <>
                    {/* Start marker */}
                    <div className="border-2 border-green-500 rounded-lg px-8 py-4 mb-0 bg-green-50">
                      <p className="text-center font-bold text-lg">Project Started</p>
                      <p className="text-xs text-gray-600 text-center mt-1">
                        {startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="w-0.5 h-8 bg-gray-300"></div>

                    {weeks}

                    {/* Today marker */}
                    <div className="border-2 border-blue-500 rounded-lg px-8 py-4 mt-0 bg-blue-50">
                      <p className="text-center font-bold text-lg">Today</p>
                      <p className="text-xs text-gray-600 text-center mt-1">
                        {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className="text-sm text-gray-700 text-center mt-2">
                        {totalWeeks} weeks in progress
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </>
      ) : activeTab === 'artists' ? (
        <>
          <div className="mb-8">
            <button
              onClick={() => setShowArtistForm(!showArtistForm)}
              className="flex items-center gap-2 p-2 text-lg font-semibold hover:bg-gray-50 rounded"
            >
              <span className={`transform transition-transform ${showArtistForm ? 'rotate-45' : ''}`}>+</span>
              Add Artist
            </button>

            {showArtistForm && (
              <form onSubmit={handleArtistSubmit} className="mt-4 p-4 border rounded">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Artist Name"
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                    required
                    className="p-2 border rounded"
                  />

                  <input
                    type="url"
                    placeholder="Profile URL"
                    value={artistUrl}
                    onChange={(e) => setArtistUrl(e.target.value)}
                    required
                    className="p-2 border rounded"
                  />

                  <input
                    type="text"
                    placeholder="Specialty (optional)"
                    value={artistSpecialty}
                    onChange={(e) => setArtistSpecialty(e.target.value)}
                    className="p-2 border rounded"
                  />

                  <textarea
                    placeholder="Notes (optional)"
                    value={artistNotes}
                    onChange={(e) => setArtistNotes(e.target.value)}
                    rows={1}
                    className="p-2 border rounded"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 px-4 py-2 bg-black text-white rounded disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Artist'}
                </button>
              </form>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {artists.map((artist) => (
              <div key={artist.id} className="p-4 border rounded">
                <div className="flex justify-between items-start mb-2">
                  <button
                    onClick={() => deleteArtist(artist.id)}
                    className="text-red-500 text-sm"
                  >
                    ×
                  </button>
                </div>

                <a
                  href={artist.profile_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold mb-1 text-blue-500 hover:underline block"
                >
                  {artist.name}
                </a>

                {artist.specialty && (
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Specialty:</span> {artist.specialty}
                  </p>
                )}

                {artist.notes && (
                  <p className="text-sm text-gray-600">{artist.notes}</p>
                )}

                <p className="text-xs text-gray-400 mt-2">
                  {new Date(artist.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </>
      ) : activeTab === 'sme' ? (
        <>
          <div className="mb-8">
            <button
              onClick={() => setShowSmeForm(!showSmeForm)}
              className="flex items-center gap-2 p-2 text-lg font-semibold hover:bg-gray-50 rounded"
            >
              <span className={`transform transition-transform ${showSmeForm ? 'rotate-45' : ''}`}>+</span>
              Add Subject Matter Expert
            </button>

            {showSmeForm && (
              <form onSubmit={handleSmeSubmit} className="mt-4 p-4 border rounded">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Expert Name"
                    value={smeName}
                    onChange={(e) => setSmeName(e.target.value)}
                    required
                    className="p-2 border rounded"
                  />

                  <input
                    type="url"
                    placeholder="Profile URL"
                    value={smeUrl}
                    onChange={(e) => setSmeUrl(e.target.value)}
                    required
                    className="p-2 border rounded"
                  />

                  <input
                    type="text"
                    placeholder="Expertise (optional)"
                    value={smeExpertise}
                    onChange={(e) => setSmeExpertise(e.target.value)}
                    className="p-2 border rounded"
                  />

                  <input
                    type="text"
                    placeholder="Organization (optional)"
                    value={smeOrganization}
                    onChange={(e) => setSmeOrganization(e.target.value)}
                    className="p-2 border rounded"
                  />

                  <textarea
                    placeholder="Notes (optional)"
                    value={smeNotes}
                    onChange={(e) => setSmeNotes(e.target.value)}
                    rows={2}
                    className="p-2 border rounded col-span-2"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 px-4 py-2 bg-black text-white rounded disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Expert'}
                </button>
              </form>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {smeList.map((expert) => (
              <div key={expert.id} className="p-4 border rounded">
                <div className="flex justify-between items-start mb-2">
                  <button
                    onClick={() => deleteSme(expert.id)}
                    className="text-red-500 text-sm"
                  >
                    ×
                  </button>
                </div>

                <a
                  href={expert.profile_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold mb-1 text-blue-500 hover:underline block"
                >
                  {expert.name}
                </a>

                {expert.expertise && (
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Expertise:</span> {expert.expertise}
                  </p>
                )}

                {expert.organization && (
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Organization:</span> {expert.organization}
                  </p>
                )}

                {expert.notes && (
                  <p className="text-sm text-gray-600">{expert.notes}</p>
                )}

                <p className="text-xs text-gray-400 mt-2">
                  {new Date(expert.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
