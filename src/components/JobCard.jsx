import React, { useState } from 'react';
import { Calendar, Building2, MapPin, PoundSterling, ChevronDown, ChevronUp } from 'lucide-react';
import { clsx } from 'clsx';
import { useJobStore } from '../store/jobStore';
import JobDetail from './JobDetail';

export default function JobCard({ job }) {
  const [isOpen, setIsOpen] = useState(false);
  const markSeen = useJobStore((state) => state.markSeen);
  const isSeen = useJobStore((state) => state.seenJobIds.includes(job.jobId));

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      markSeen(job.jobId);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).toUpperCase();
  };

  return (
    <div 
      className={clsx(
        "clinical-border bg-white transition-all duration-200",
        isSeen ? "border-red-600" : "border-black"
      )}
    >
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 flex items-start justify-between gap-4"
        onClick={handleToggle}
      >
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-1.5 py-0.5 clinical-border bg-black text-white uppercase tracking-tighter">
              {job.source}
            </span>
            {isSeen && (
              <span className="text-[10px] font-bold text-red-600 uppercase tracking-tighter">
                PREVIOUSLY VIEWED
              </span>
            )}
            {job.isIrrelevant && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 clinical-border bg-red-100 text-red-800 uppercase tracking-tighter">
                POSSIBLY NOT RELEVANT
              </span>
            )}
          </div>
          
          <h3 className="text-lg font-bold uppercase leading-tight">{job.title}</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-2 gap-x-4 text-xs font-medium uppercase text-gray-600">
            <div className="flex items-center gap-1.5">
              <Building2 className="h-3 w-3" />
              <span className="truncate">{job.employer}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <PoundSterling className="h-3 w-3" />
              <span>{job.salary}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(job.postedDate)}</span>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 pt-1">
          {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-black">
          <JobDetail jobId={job.jobId} isOpen={isOpen} />
        </div>
      )}
    </div>
  );
}
