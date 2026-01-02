
import React from 'react';
import { GroundingLink, TeamStats } from '../types';

interface PredictionDisplayProps {
  prediction: string;
  links: GroundingLink[];
  stats?: TeamStats[];
  isLoading: boolean;
}

const FormIndicator: React.FC<{ result: string }> = ({ result }) => {
  const colors = {
    W: 'bg-green-500 text-white',
    D: 'bg-slate-500 text-white',
    L: 'bg-red-500 text-white'
  };
  const color = colors[result as keyof typeof colors] || 'bg-slate-700 text-slate-400';
  
  return (
    <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shadow-sm ${color}`}>
      {result}
    </div>
  );
};

const StatCard: React.FC<{ team: TeamStats }> = ({ team }) => {
  const total = team.win + team.draw + team.loss || 1;
  const winRate = Math.round((team.win / total) * 100);

  return (
    <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-5 space-y-4">
      <div className="flex justify-between items-start">
        <h4 className="font-bold text-lg text-white truncate max-w-[150px]">{team.name}</h4>
        <div className="text-right">
          <span className="text-2xl font-black text-green-400">{winRate}%</span>
          <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Win Rate</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-700/50">
          <p className="text-xl font-bold text-white">{team.win}</p>
          <p className="text-[10px] text-slate-500 uppercase font-bold">W</p>
        </div>
        <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-700/50">
          <p className="text-xl font-bold text-slate-300">{team.draw}</p>
          <p className="text-[10px] text-slate-500 uppercase font-bold">D</p>
        </div>
        <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-700/50">
          <p className="text-xl font-bold text-red-400">{team.loss}</p>
          <p className="text-[10px] text-slate-500 uppercase font-bold">L</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase">Form:</span>
        <div className="flex gap-1">
          {team.form.map((r, i) => <FormIndicator key={i} result={r} />)}
        </div>
      </div>
    </div>
  );
};

export const PredictionDisplay: React.FC<PredictionDisplayProps> = ({ prediction, links, stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-12 space-y-4">
        <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-medium animate-pulse">Deep-diving into tactical stats and recent form...</p>
      </div>
    );
  }

  if (!prediction) return null;

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      {/* Statistics Section */}
      {stats && stats.length > 0 && (
        <div className="glass-panel rounded-2xl p-6 md:p-8">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Team Statistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats.map((team, idx) => (
              <StatCard key={idx} team={team} />
            ))}
          </div>
        </div>
      )}

      {/* Analysis Section */}
      <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-700 pb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Expert AI Analysis
          </h2>
        </div>
        
        <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap">
          {prediction}
        </div>

        {links.length > 0 && (
          <div className="pt-6 border-t border-slate-700">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Verification Sources</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {links.map((link, idx) => (
                <a 
                  key={idx} 
                  href={link.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center p-3 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors border border-slate-700 group"
                >
                  <div className="flex-1 truncate">
                    <p className="text-sm font-medium text-slate-200 truncate group-hover:text-green-400">{link.title || 'Source'}</p>
                    <p className="text-xs text-slate-500 truncate">{link.uri}</p>
                  </div>
                  <svg className="w-4 h-4 text-slate-500 group-hover:text-green-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
