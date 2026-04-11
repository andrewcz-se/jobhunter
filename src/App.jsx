import React, { useState, useEffect } from 'react';
import SearchForm from './components/SearchForm';
import JobList from './components/JobList';
import SavedJobs from './components/SavedJobs';
import Login from './components/Login';
import PrivacyModal from './components/PrivacyModal';
import { useJobStore } from './store/jobStore';
import { Trash2, ShieldCheck, Crosshair, Star, Search } from 'lucide-react';
import { clsx } from 'clsx';

export default function App() {
  const { clearSeen, seenJobIds, savedJobs } = useJobStore();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [activeView, setActiveView] = useState('SEARCH');

  const savedCount = Object.keys(savedJobs).length;

  useEffect(() => {
    const access = localStorage.getItem('vault_access');
    if (access === 'true') {
      setIsAuthorized(true);
    }
    setIsChecking(false);
  }, []);

  if (isChecking) {
    return <div className="min-h-screen bg-[#f3f4f6]" />;
  }

  if (!isAuthorized) {
    return (
      <>
        <Login onAccessGranted={() => setIsAuthorized(true)} onShowPrivacy={() => setIsPrivacyOpen(true)} />
        <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6]">
      <header className="bg-white border-b border-black py-4 sticky top-0 z-50">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 self-start md:self-auto">
            <Crosshair className="w-6 h-6 text-nhs-blue" />
            <h1 className="text-xl font-bold uppercase tracking-tight">
              JOB HUNTER <span className="text-nhs-blue">X</span>
            </h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-start md:justify-end">
            <button 
              onClick={() => setActiveView('SEARCH')}
              className={clsx(
                "flex items-center gap-1.5 text-[10px] font-bold uppercase transition-all px-3 py-1.5 clinical-border",
                activeView === 'SEARCH' ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"
              )}
            >
              <Search className="h-3.5 w-3.5" />
              Search
            </button>

            <button 
              onClick={() => setActiveView('SAVED')}
              className={clsx(
                "flex items-center gap-1.5 text-[10px] font-bold uppercase transition-all px-3 py-1.5 clinical-border",
                activeView === 'SAVED' ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"
              )}
            >
              <Star className={clsx("h-3.5 w-3.5", activeView === 'SAVED' ? "fill-white" : "fill-black")} />
              Saved Jobs ({savedCount})
            </button>

            {activeView === 'SEARCH' && seenJobIds.length > 0 && (
              <button 
                onClick={clearSeen}
                className="flex items-center gap-1.5 text-[10px] font-bold uppercase hover:text-red-600 transition-colors md:ml-4"
              >
                <Trash2 className="h-3 w-3" />
                Clear Seen History ({seenJobIds.length})
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8 max-w-5xl">
        {activeView === 'SEARCH' ? (
          <>
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-4 bg-black"></span>
                <h2 className="clinical-label mb-0">Search Interface</h2>
              </div>
              <SearchForm />
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-4 bg-nhs-blue"></span>
                <h2 className="clinical-label mb-0">Results Feed</h2>
              </div>
              <JobList />
            </section>
          </>
        ) : (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 bg-yellow-400"></span>
              <h2 className="clinical-label mb-0">Saved High-Interest Leads</h2>
            </div>
            <SavedJobs />
          </section>
        )}
      </main>

      <footer className="border-t border-black py-6 bg-white">
        <div className="container mx-auto px-4 text-center space-y-2">
          <p className="text-[10px] font-bold uppercase text-gray-500">
            Job Hunter X Search Engine
          </p>
          <button 
            onClick={() => setIsPrivacyOpen(true)}
            className="text-[10px] font-bold uppercase text-[#005eb8] hover:underline"
          >
            Privacy & Data Processing Notice
          </button>
        </div>
      </footer>

      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
    </div>
  );
}
