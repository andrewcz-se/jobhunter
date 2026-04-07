import React, { useState } from 'react';
import JobCard from './JobCard';
import { useJobSearch } from '../hooks/useJobSearch';
import { clsx } from 'clsx';

export default function JobList() {
  const { results, isLoading, isError, error, sanitizeNhs, lastKeywords, isSanitized, isSanitizing } = useJobSearch();
  const [filter, setFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('RECENT');

  const nhsJobs = results.filter(job => job.source === 'NHS');
  const hasNhsJobs = nhsJobs.length > 0;

  const filteredResults = results.filter((job) => {
    if (filter === 'ALL') return true;
    return job.source === filter;
  });

  const sortedResults = [...filteredResults].sort((a, b) => {
    const dateA = new Date(a.postedDate);
    const dateB = new Date(b.postedDate);
    
    if (sortBy === 'RECENT') {
      return dateB - dateA;
    } else {
      return dateA - dateB;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="clinical-border bg-white p-4 h-32 animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 w-1/4"></div>
            <div className="h-6 bg-gray-200 w-1/2"></div>
            <div className="h-4 bg-gray-200 w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="clinical-border p-6 bg-red-50 text-red-600 font-bold uppercase text-sm">
        Error: {error?.response?.data?.error || error?.message || 'Failed to fetch jobs'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {results.length > 0 && (
        <div className="flex flex-col md:flex-row md:items-center gap-4 border-b border-black pb-4">
          <div className="flex items-center gap-2">
            <span className="clinical-label mb-0 mr-4">Filter:</span>
            {['ALL', 'REED', 'JSEARCH', 'ADZUNA', 'NHS'].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={clsx(
                  "text-[10px] font-bold uppercase px-3 py-1 clinical-border transition-all",
                  filter === s ? "bg-black text-white" : "hover:bg-gray-100"
                )}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="clinical-label mb-0 mr-4 md:ml-4">Sort:</span>
            {['RECENT', 'OLDEST'].map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={clsx(
                  "text-[10px] font-bold uppercase px-3 py-1 clinical-border transition-all",
                  sortBy === s ? "bg-black text-white" : "hover:bg-gray-100"
                )}
              >
                {s === 'RECENT' ? 'Most Recent' : 'Oldest First'}
              </button>
            ))}
          </div>

          {hasNhsJobs && (
            <div className="flex items-center gap-2 md:ml-4">
              {isSanitized ? (
                <span className="text-[10px] font-bold uppercase px-3 py-1 clinical-border bg-green-50 text-green-700">
                  NHS Sanitized
                </span>
              ) : (
                <button
                  onClick={() => sanitizeNhs({ keywords: lastKeywords, jobs: nhsJobs })}
                  disabled={isSanitizing}
                  className={clsx(
                    "text-[10px] font-bold uppercase px-3 py-1 clinical-border transition-all",
                    isSanitizing ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-black text-white hover:bg-gray-800"
                  )}
                >
                  {isSanitizing ? 'Sanitizing...' : 'Refine NHS Results (AI)'}
                </button>
              )}
            </div>
          )}

          <div className="md:ml-auto text-[10px] font-bold uppercase text-gray-400">
            {filteredResults.length} Results
          </div>
        </div>
      )}

      {sortedResults.length === 0 ? (
        <div className="clinical-border p-12 bg-gray-50 text-center space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">
            No Results Found
          </h3>
          <p className="text-xs uppercase text-gray-400">
            {results.length > 0 ? "No results for this filter." : "Adjust your search criteria and try again."}
          </p>
        </div>
      ) : (
        <div className="space-y-4 pb-12">
          {sortedResults.map((job) => (
            <JobCard key={job.jobId} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
