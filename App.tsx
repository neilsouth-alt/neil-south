
import React, { useState, useEffect } from 'react';
import { PredictionState } from './types';
import { analyzeMatch } from './geminiService';
import { PredictionDisplay } from './components/PredictionDisplay';

const MAX_RECENT_SEARCHES = 5;

const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [state, setState] = useState<PredictionState>({
    match: '',
    prediction: '',
    isAnalyzing: false,
    links: [],
    stats: []
  });

  // Load favorites and history from localStorage on mount
  useEffect(() => {
    const savedFavs = localStorage.getItem('goalmind_favorites');
    if (savedFavs) {
      try {
        setFavorites(JSON.parse(savedFavs));
      } catch (e) {
        console.error("Failed to parse favorites", e);
      }
    }

    const savedHistory = localStorage.getItem('goalmind_history');
    if (savedHistory) {
      try {
        setRecentSearches(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('goalmind_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('goalmind_history', JSON.stringify(recentSearches));
  }, [recentSearches]);

  const addToHistory = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    
    setRecentSearches(prev => {
      // Remove the item if it already exists to move it to the front
      const filtered = prev.filter(item => item.toLowerCase() !== trimmed.toLowerCase());
      const newHistory = [trimmed, ...filtered];
      // Limit to MAX_RECENT_SEARCHES
      return newHistory.slice(0, MAX_RECENT_SEARCHES);
    });
  };

  const handlePredict = async (e?: React.FormEvent, overrideQuery?: string) => {
    if (e) e.preventDefault();
    const query = overrideQuery || searchQuery;
    if (!query.trim() || state.isAnalyzing) return;

    setState(prev => ({ ...prev, isAnalyzing: true, error: undefined, prediction: '', stats: [] }));
    
    try {
      const result = await analyzeMatch(query);
      setState({
        match: query,
        prediction: result.text,
        isAnalyzing: false,
        links: result.links,
        stats: result.stats
      });
      
      addToHistory(query);
      if (!overrideQuery) setSearchQuery(query);
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: err.message || "Something went wrong. Please try again."
      }));
    }
  };

  const trendingMatches = [
    "Liverpool vs Manchester City",
    "Real Madrid vs Barcelona",
    "Inter Milan vs AC Milan",
    "Bayern Munich vs Bayer Leverkusen"
  ];

  const toggleFavorite = (team: string) => {
    const trimmed = team.trim();
    if (!trimmed) return;
    if (favorites.includes(trimmed)) {
      setFavorites(favorites.filter(f => f !== trimmed));
    } else {
      setFavorites([...favorites, trimmed]);
    }
  };

  const clearHistory = () => {
    setRecentSearches([]);
  };

  const handleQuickSelect = (match: string) => {
    setSearchQuery(match);
    handlePredict(undefined, match);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-green-500/30">
      {/* Header */}
      <nav className="sticky top-0 z-50 glass-panel border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
            <div className="w-10 h-10 accent-gradient rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-white">GoalMind <span className="text-green-500">Predictor</span></h1>
          </div>
          <div className="hidden md:flex gap-6 text-sm font-medium text-slate-400">
            <span className="hover:text-white transition-colors cursor-pointer">Matches</span>
            <span className="hover:text-white transition-colors cursor-pointer">Leagues</span>
            <span className="hover:text-white transition-colors cursor-pointer">Live Stats</span>
            <span className="hover:text-white transition-colors cursor-pointer" onClick={() => window.aistudio?.openSelectKey()}>Pro AI</span>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        {/* Search Hero */}
        <div className="text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Advanced <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">Match Insights</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Get comprehensive AI analysis and live season statistics for any upcoming match worldwide.
          </p>

          <form onSubmit={handlePredict} className="relative max-w-2xl mx-auto mt-8 group">
            <input 
              type="text" 
              placeholder="Enter teams (e.g., 'Chelsea vs Arsenal')" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-16 bg-slate-800/50 border-2 border-slate-700 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:border-green-500/50 transition-all shadow-xl group-hover:border-slate-600"
            />
            <div className="absolute right-3 top-3 bottom-3 flex gap-2">
               {searchQuery && (
                <button
                  type="button"
                  onClick={() => toggleFavorite(searchQuery)}
                  className={`px-4 rounded-xl border border-slate-700 transition-all flex items-center justify-center ${favorites.includes(searchQuery) ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-500' : 'bg-slate-800/80 text-slate-400 hover:text-white'}`}
                  title={favorites.includes(searchQuery) ? "Remove from favorites" : "Add to favorites"}
                >
                  <svg className="w-5 h-5" fill={favorites.includes(searchQuery) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </button>
              )}
              <button 
                type="submit"
                disabled={state.isAnalyzing}
                className="px-6 accent-gradient rounded-xl font-bold text-white shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {state.isAnalyzing ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>
          </form>

          {/* Quick Access Bars */}
          <div className="space-y-6 pt-4">
            {/* Favorites Section */}
            {favorites.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest mr-2 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  Favorites
                </span>
                {favorites.map((fav) => (
                  <div key={fav} className="group flex items-center bg-slate-800/40 border border-slate-700/50 rounded-full pl-3 pr-1 py-1 hover:border-yellow-500/30 transition-all">
                    <button 
                      onClick={() => handleQuickSelect(fav)}
                      className="text-xs font-semibold text-slate-300 hover:text-white transition-colors mr-2"
                    >
                      {fav}
                    </button>
                    <button 
                      onClick={() => toggleFavorite(fav)}
                      className="w-5 h-5 rounded-full hover:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-red-400 transition-all"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Recent History Section */}
            {recentSearches.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mr-2 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Recent
                </span>
                {recentSearches.map((match) => (
                  <button 
                    key={match}
                    onClick={() => handleQuickSelect(match)}
                    className="px-3 py-1.5 rounded-full bg-slate-800/20 border border-slate-700/30 text-xs font-medium text-slate-400 hover:text-white hover:border-slate-500 transition-all"
                  >
                    {match}
                  </button>
                ))}
                <button 
                  onClick={clearHistory}
                  className="text-[10px] text-slate-600 hover:text-red-400 font-bold uppercase transition-colors ml-2"
                >
                  Clear
                </button>
              </div>
            )}

            {/* Trending Section */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mr-2">Trending</span>
              {trendingMatches.map((match) => (
                <button 
                  key={match}
                  onClick={() => handleQuickSelect(match)}
                  className="px-3 py-1.5 rounded-full bg-slate-800/30 border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  {match}
                </button>
              ))}
            </div>
          </div>
        </div>

        {state.error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400 text-sm flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {state.error}
          </div>
        )}

        <PredictionDisplay 
          prediction={state.prediction} 
          links={state.links} 
          stats={state.stats}
          isLoading={state.isAnalyzing} 
        />

        {/* Features Section */}
        {!state.prediction && !state.isAnalyzing && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-slate-800">
            <FeatureCard 
              icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />}
              title="Form Analysis"
              description="Deep dive into recent matches, goals scored, and defensive performance."
            />
            <FeatureCard 
              icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 01-9-3.512m9-4.488a4 4 0 11-5.292 0" />}
              title="Injury Reports"
              description="Real-time monitoring of player availability and potential lineups."
            />
            <FeatureCard 
              icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
              title="Tactical Insight"
              description="AI analysis of manager strategies, pressing intensities, and formation match-ups."
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 mt-12 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-slate-500 text-sm">
            © 2024 GoalMind Predictor. AI-powered sports intelligence.
          </div>
          <div className="flex gap-8 text-slate-500 text-sm font-medium">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-white cursor-pointer transition-colors">Disclaimer</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
  <div className="glass-panel p-6 rounded-2xl hover:border-green-500/30 transition-all group">
    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mb-4 group-hover:accent-gradient transition-all">
      <svg className="w-6 h-6 text-green-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {icon}
      </svg>
    </div>
    <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
    <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
  </div>
);

export default App;
