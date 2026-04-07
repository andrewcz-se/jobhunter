import React, { useState, useEffect } from 'react';
import SearchForm from './components/SearchForm';
import JobList from './components/JobList';
import Login from './components/Login';
import PrivacyModal from './components/PrivacyModal';
import { useJobStore } from './store/jobStore';
import { Trash2, ShieldCheck, Crosshair } from 'lucide-react';

export default function App() {
  const { clearSeen, seenJobIds } = useJobStore();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

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
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crosshair className="w-6 h-6 text-nhs-blue" />
            <h1 className="text-xl font-bold uppercase tracking-tight">
              JOB HUNTER <span className="text-nhs-blue">X</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-6">

            {seenJobIds.length > 0 && (
              <button 
                onClick={clearSeen}
                className="flex items-center gap-1.5 text-[10px] font-bold uppercase hover:text-red-600 transition-colors"
              >
                <Trash2 className="h-3 w-3" />
                Clear Seen History ({seenJobIds.length})
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8 max-w-5xl">
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
