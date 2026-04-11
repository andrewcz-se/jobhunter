import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { clsx } from 'clsx';
import { useJobSearch } from '../hooks/useJobSearch';

export default function SearchForm() {
  const { search, isLoading } = useJobSearch();
  const [formData, setFormData] = useState({
    keywords: '',
    location: '',
    radius: 10,
    fullTime: false,
    country: 'gb',
    sources: ['reed', 'jsearch', 'adzuna', 'nhs']
  });

  const handleSourceToggle = (source) => {
    setFormData(prev => {
      const sources = prev.sources.includes(source)
        ? prev.sources.filter(s => s !== source)
        : [...prev.sources, source];
      return { ...prev, sources };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let filteredSources = formData.sources;
    if (formData.country === 'us') {
      filteredSources = formData.sources.filter(s => s !== 'reed' && s !== 'nhs' && s !== 'arbets' && s !== 'englishjobsearch');
    } else if (formData.country === 'se') {
      filteredSources = formData.sources.filter(s => s === 'jsearch' || s === 'arbets' || s === 'englishjobsearch');
    } else if (formData.country === 'gb') {
      filteredSources = formData.sources.filter(s => s !== 'arbets' && s !== 'englishjobsearch');
    }
    
    if (filteredSources.length === 0) {
      alert('Please select at least one job source.');
      return;
    }
    search({ ...formData, sources: filteredSources });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 clinical-border space-y-4 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="md:col-span-3">
          <label className="clinical-label" htmlFor="keywords">Keywords</label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <input
              id="keywords"
              type="text"
              placeholder="e.g. Developer, NHS, Nurse"
              className="clinical-input w-full !pl-10"
              value={formData.keywords}
              onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
            />
          </div>
        </div>
        <div className="md:col-span-1">
          <label className="clinical-label" htmlFor="country">Country</label>
          <select
            id="country"
            className="clinical-input w-full"
            value={formData.country}
            onChange={(e) => {
              const newCountry = e.target.value;
              let newSources = formData.sources;
              if (newCountry === 'us') {
                newSources = formData.sources.filter(s => s !== 'reed' && s !== 'nhs' && s !== 'arbets' && s !== 'englishjobsearch');
              } else if (newCountry === 'se') {
                newSources = formData.sources.filter(s => s === 'jsearch' || s === 'arbets' || s === 'englishjobsearch');
                if (!newSources.includes('arbets')) newSources.push('arbets');
                if (!newSources.includes('englishjobsearch')) newSources.push('englishjobsearch');
              } else if (newCountry === 'gb') {
                newSources = formData.sources.filter(s => s !== 'arbets' && s !== 'englishjobsearch');
              }
              setFormData({ 
                ...formData, 
                country: newCountry,
                sources: newSources
              });
            }}
          >
            <option value="gb">UK</option>
            <option value="us">US</option>
            <option value="se">Sweden</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="clinical-label" htmlFor="location">Location</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              id="location"
              type="text"
              placeholder="e.g. London, New York"
              className="clinical-input w-full !pl-10"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-end gap-6 pt-2">
        <div className="w-full md:w-32">
          <label className="clinical-label" htmlFor="radius">Radius (miles)</label>
          <select
            id="radius"
            className="clinical-input w-full"
            value={formData.radius}
            onChange={(e) => setFormData({ ...formData, radius: Number(e.target.value) })}
          >
            <option value={5}>5 miles</option>
            <option value={10}>10 miles</option>
            <option value={20}>20 miles</option>
            <option value={50}>50 miles</option>
          </select>
        </div>

        <div className="flex-1 w-full md:min-w-[200px]">
          <label className="clinical-label">Job Sources</label>
          <div className="flex flex-wrap gap-4 pt-2">
            {['reed', 'jsearch', 'adzuna', 'nhs', 'arbets', 'englishjobsearch'].map(source => {
              let isDisabled = false;
              let suffix = '';
              if (formData.country === 'us') {
                if (source === 'reed' || source === 'nhs') {
                  isDisabled = true;
                  suffix = ' (UK ONLY)';
                } else if (source === 'arbets' || source === 'englishjobsearch') {
                  isDisabled = true;
                  suffix = ' (SE ONLY)';
                }
              } else if (formData.country === 'se') {
                if (source === 'reed' || source === 'nhs' || source === 'adzuna') {
                  isDisabled = true;
                  suffix = source === 'adzuna' ? ' (UK/US)' : ' (UK ONLY)';
                }
              } else if (formData.country === 'gb') {
                if (source === 'arbets' || source === 'englishjobsearch') {
                  isDisabled = true;
                  suffix = ' (SE ONLY)';
                }
              }

              return (
              <div key={source} className="flex items-center space-x-2">
                <input
                  id={`source-${source}`}
                  type="checkbox"
                  className="w-4 h-4 clinical-border accent-nhs-blue disabled:opacity-50"
                  checked={formData.sources.includes(source) && !isDisabled}
                  onChange={() => handleSourceToggle(source)}
                  disabled={isDisabled}
                />
                <label 
                  htmlFor={`source-${source}`} 
                  className={clsx(
                    "text-[10px] font-bold uppercase cursor-pointer",
                    isDisabled ? "text-gray-400" : "text-black"
                  )}
                >
                  {source} {isDisabled && suffix}
                </label>
              </div>
            )})}
          </div>
        </div>

        <div className="flex items-center space-x-2 py-3 md:py-1">
          <input
            id="fullTime"
            type="checkbox"
            className="w-4 h-4 clinical-border accent-nhs-blue"
            checked={formData.fullTime}
            onChange={(e) => setFormData({ ...formData, fullTime: e.target.checked })}
          />
          <label htmlFor="fullTime" className="clinical-label mb-0 cursor-pointer">
            Full-time
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="clinical-btn w-full md:w-auto md:min-w-[200px] mt-2 md:mt-0"
        >
          {isLoading ? 'Searching...' : 'Search Jobs'}
        </button>
      </div>
    </form>
  );
}
