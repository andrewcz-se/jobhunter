import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useJobStore = create(
  persist(
    (set, get) => ({
      seenJobIds: [],
      savedJobs: {}, // key: jobId, value: { job, status, appliedDate }
      
      markSeen: (jobId) => {
        if (!get().seenJobIds.includes(jobId)) {
          set((state) => ({
            seenJobIds: [...state.seenJobIds, jobId]
          }));
        }
      },
      
      clearSeen: () => {
        set({ seenJobIds: [] });
      },
      
      isSeen: (jobId) => {
        return get().seenJobIds.includes(jobId);
      },

      toggleSave: (job) => {
        const { savedJobs } = get();
        if (savedJobs[job.jobId]) {
          const newSavedJobs = { ...savedJobs };
          delete newSavedJobs[job.jobId];
          set({ savedJobs: newSavedJobs });
        } else {
          set({
            savedJobs: {
              ...savedJobs,
              [job.jobId]: {
                job,
                status: 'Not Yet Applied',
                appliedDate: null,
                savedAt: new Date().toISOString()
              }
            }
          });
        }
      },

      updateSavedJobStatus: (jobId, status, appliedDate) => {
        const { savedJobs } = get();
        if (savedJobs[jobId]) {
          set({
            savedJobs: {
              ...savedJobs,
              [jobId]: {
                ...savedJobs[jobId],
                status,
                appliedDate
              }
            }
          });
        }
      },

      isSaved: (jobId) => {
        return !!get().savedJobs[jobId];
      }
    }),
    {
      name: 'uk-job-scout-storage',
    }
  )
);
