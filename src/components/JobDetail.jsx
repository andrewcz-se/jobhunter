import React from 'react';
import { useJobDetail } from '../hooks/useJobSearch';
import { ExternalLink, Briefcase } from 'lucide-react';

export default function JobDetail({ jobId, isOpen }) {
  const { data: job, isLoading, isError } = useJobDetail(jobId, isOpen);

  if (isLoading) {
    return (
      <div className="p-6 space-y-4 animate-pulse">
        <div className="h-4 bg-gray-200 w-3/4"></div>
        <div className="h-4 bg-gray-200 w-full"></div>
        <div className="h-4 bg-gray-200 w-5/6"></div>
        <div className="h-4 bg-gray-200 w-2/3"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-red-600 bg-red-50 font-bold uppercase text-xs">
        Failed to load job details. Please try again.
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="p-6 bg-gray-50 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold uppercase tracking-wider">
        <div className="flex items-center gap-2">
          <Briefcase className="h-3 w-3 text-nhs-blue" />
          <span>Type: {job.contractType || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>ID: {job.jobId}</span>
        </div>
      </div>

      {job.highlights && (
        <div className="space-y-4">
          {Object.entries(job.highlights).map(([key, list]) => (
            <div key={key}>
              <h4 className="clinical-label mb-2">{key.replace(/_/g, ' ')}</h4>
              <ul className="list-disc list-inside text-sm space-y-1">
                {list.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <div className="prose prose-sm max-w-none">
        <h4 className="clinical-label mb-2">Description</h4>
        {job.description ? (
          job.source === 'REED' ? (
            <div 
              className="text-sm leading-relaxed font-sans"
              dangerouslySetInnerHTML={{ __html: job.description }}
            />
          ) : (
            <div 
              className="text-sm leading-relaxed whitespace-pre-wrap font-sans"
            >
              {job.description}
            </div>
          )
        ) : (
          <p className="text-sm italic text-gray-500 font-sans">
            No detailed description available. Please check the application link for more details.
          </p>
        )}
      </div>

      <div className="pt-4 border-t border-gray-200 space-y-4">
        <h4 className="clinical-label">Apply via:</h4>
        <div className="flex flex-wrap gap-2">
          {job.applyOptions && job.applyOptions.length > 0 ? (
            job.applyOptions.map((option, idx) => (
              <a 
                key={idx}
                href={option.apply_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="clinical-btn bg-nhs-blue text-white border-nhs-blue hover:bg-[#004a91] flex items-center gap-2 text-[10px]"
              >
                {option.publisher}
                <ExternalLink className="h-3 w-3" />
              </a>
            ))
          ) : (
            <a 
              href={job.applyUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="clinical-btn bg-nhs-blue text-white border-nhs-blue hover:bg-[#004a91] flex items-center gap-2 text-[10px]"
            >
              Apply via {job.source}
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
