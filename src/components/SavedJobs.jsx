import React from 'react';
import { useJobStore } from '../store/jobStore';
import JobCard from './JobCard';
import { Download, Calendar } from 'lucide-react';
import { clsx } from 'clsx';

const STATUS_OPTIONS = [
  'Not Yet Applied',
  'Applied',
  'Awaiting Response',
  'Application Declined',
  'Interview Booked',
  'Declined from Interview'
];

export default function SavedJobs() {
  const savedJobs = useJobStore((state) => state.savedJobs);
  const updateSavedJobStatus = useJobStore((state) => state.updateSavedJobStatus);
  const toggleSave = useJobStore((state) => state.toggleSave);

  const savedJobsList = Object.values(savedJobs).sort((a, b) => 
    new Date(b.savedAt) - new Date(a.savedAt)
  );

  const exportToCSV = () => {
    const headers = ['Job Title', 'Job ID', 'Application Date', 'Source', 'Employer', 'Location', 'Salary', 'Status'];
    const rows = savedJobsList.map(({ job, status, appliedDate }) => [
      job.title,
      job.jobId,
      appliedDate || 'N/A',
      job.source,
      job.employer,
      job.location,
      job.salary,
      status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `saved_jobs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (savedJobsList.length === 0) {
    return (
      <div className="clinical-border p-12 bg-gray-50 text-center space-y-2">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">
          No Saved Jobs
        </h3>
        <p className="text-xs uppercase text-gray-400">
          Star a job in the results feed to save it for later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-black pb-4">
        <div className="text-[10px] font-bold uppercase text-gray-400">
          {savedJobsList.length} Saved Leads
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 text-[10px] font-bold uppercase px-3 py-1.5 clinical-border bg-black text-white hover:bg-gray-800 transition-all"
        >
          <Download className="h-3.5 w-3.5" />
          Export to CSV
        </button>
      </div>

      <div className="space-y-8 pb-12">
        {savedJobsList.map(({ job, status, appliedDate }) => (
          <div key={job.jobId} className="space-y-3">
            <JobCard job={job} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-3 clinical-border border-t-0">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-500">
                  Application Status
                </label>
                <select
                  value={status}
                  onChange={(e) => updateSavedJobStatus(job.jobId, e.target.value, appliedDate)}
                  className="w-full text-xs font-bold uppercase p-2 clinical-border bg-white focus:border-nhs-blue outline-none"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-500">
                  Applied Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={appliedDate || ''}
                    onChange={(e) => updateSavedJobStatus(job.jobId, status, e.target.value)}
                    className="w-full text-xs font-bold uppercase p-2 clinical-border bg-white focus:border-nhs-blue outline-none pr-8"
                  />
                  <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
