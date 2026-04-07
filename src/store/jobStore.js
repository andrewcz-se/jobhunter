import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useJobStore = create(
  persist(
    (set, get) => ({
      seenJobIds: [],
      
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
    }),
    {
      name: 'uk-job-scout-storage',
    }
  )
);
