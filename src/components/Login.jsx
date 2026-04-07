import React, { useState } from 'react';
import axios from 'axios';
import { Lock, AlertTriangle, ArrowRight } from 'lucide-react';

export default function Login({ onAccessGranted, onShowPrivacy }) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data } = await axios.post('/api/verify', { password });
      if (data.success) {
        localStorage.setItem('vault_access', 'true');
        onAccessGranted();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authorization failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6] p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-black clinical-border mb-4">
            <Lock className="text-white h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-tight">
            LOGIN <span className="text-nhs-blue">ACCESS</span>
          </h1>
          <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">
            
          </p>
        </div>

        <form onSubmit={handleSubmit} className="clinical-border bg-white p-8 space-y-6 shadow-sm">
          <div>
            <label className="clinical-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="clinical-input w-full"
              placeholder="ENTER PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 clinical-border border-red-600 text-[10px] font-bold uppercase">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !password}
            className="clinical-btn w-full bg-black text-white hover:bg-nhs-blue border-black flex items-center justify-center gap-2"
          >
            {isLoading ? 'Verifying...' : (
              <>
                Login
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-8 space-y-2">
          <p className="text-[10px] font-bold uppercase text-gray-400">
            Job Hunter X
          </p>
          <button 
            onClick={onShowPrivacy}
            className="text-[10px] font-bold uppercase text-[#005eb8] hover:underline"
          >
            Privacy & Data Processing Notice
          </button>
        </div>
      </div>
    </div>
  );
}
