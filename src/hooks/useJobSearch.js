import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export function useJobSearch() {
  const queryClient = useQueryClient();

  const searchMutation = useMutation({
    mutationKey: ['jobSearch'],
    mutationFn: async (params) => {
      console.log('Frontend: Initiating search with params:', params);
      
      const searchPromises = params.sources.map(source => 
        axios.post('/api/search', { action: 'search', source, ...params })
      );

      const responses = await Promise.allSettled(searchPromises);
      
      const allResults = responses
        .filter(res => res.status === 'fulfilled')
        .flatMap(res => res.value.data);

      console.log('Frontend: All search results received:', allResults.length);
      return { results: allResults, keywords: params.keywords };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['jobResults'], data.results);
      queryClient.setQueryData(['lastKeywords'], data.keywords);
    },
  });

  const sanitizeMutation = useMutation({
    mutationKey: ['sanitizeNhs'],
    mutationFn: async ({ keywords, jobs }) => {
      console.log('Frontend: Initiating NHS sanitization...');
      const response = await axios.post('/api/sanitize', { keywords, jobs });
      return response.data.relevantIds;
    },
    onSuccess: (relevantIds) => {
      const currentJobs = queryClient.getQueryData(['jobResults']) || [];
      const updatedJobs = currentJobs.map(job => {
        if (job.source === 'NHS') {
          // If the job ID is not in the relevantIds array, mark it as irrelevant
          const isRelevant = relevantIds.some(id => {
            const cleanId = String(id).replace(/^(ID:|JOB_ID:)/i, '').trim();
            const cleanJobId = String(job.jobId).replace(/^(ID:|JOB_ID:)/i, '').trim();
            return cleanId === cleanJobId;
          });
          if (!isRelevant) {
            return { ...job, isIrrelevant: true };
          }
        }
        return job;
      });
      queryClient.setQueryData(['jobResults'], updatedJobs);
      queryClient.setQueryData(['nhsSanitized'], true);
    },
  });

  const { data: results = [] } = useQuery({
    queryKey: ['jobResults'],
    queryFn: () => queryClient.getQueryData(['jobResults']) || [],
    staleTime: Infinity,
    initialData: [],
  });

  const { data: lastKeywords = '' } = useQuery({
    queryKey: ['lastKeywords'],
    queryFn: () => queryClient.getQueryData(['lastKeywords']) || '',
    staleTime: Infinity,
    initialData: '',
  });

  const { data: isSanitized = false } = useQuery({
    queryKey: ['nhsSanitized'],
    queryFn: () => queryClient.getQueryData(['nhsSanitized']) || false,
    staleTime: Infinity,
    initialData: false,
  });

  return {
    search: (params) => {
      queryClient.setQueryData(['nhsSanitized'], false); // Reset sanitization state on new search
      searchMutation.mutate(params);
    },
    sanitizeNhs: (params) => sanitizeMutation.mutate(params),
    results,
    lastKeywords,
    isSanitized,
    isLoading: searchMutation.isPending,
    isSanitizing: sanitizeMutation.isPending,
    isError: searchMutation.isError,
    error: searchMutation.error,
  };
}

export function useJobDetail(jobId, isOpen = false) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['jobDetail', jobId],
    queryFn: async () => {
      // Always get the latest results from cache inside the queryFn
      const results = queryClient.getQueryData(['jobResults']) || [];
      const jobInResults = results.find(j => j.jobId === jobId);

      // JSEARCH, ADZUNA, NHS, ARBETS and ENGLISHJOBSEARCH data is often self-contained
      if (jobInResults && (['JSEARCH', 'ADZUNA', 'NHS', 'ARBETS', 'ENGLISHJOBSEARCH'].includes(jobInResults.source))) {
        if (jobInResults.description) {
          console.log(`Frontend: Returning cached ${jobInResults.source} detail`);
          return jobInResults;
        }
        // If it's ARBETS or ENGLISHJOBSEARCH and we have it, return it even if description is empty (it's all we have)
        if (jobInResults.source === 'ARBETS' || jobInResults.source === 'ENGLISHJOBSEARCH') {
          return jobInResults;
        }
        console.log(`Frontend: ${jobInResults.source} result missing description, fetching detail...`);
      }

      // REED needs a separate fetch if it's not a detailed object (though we cache it once fetched)
      if (jobInResults?.source === 'REED' && jobInResults.applyUrl) {
        return jobInResults;
      }

      const source = jobId.split(':')[0].toLowerCase();
      console.log(`Frontend: Fetching ${source} detail from API for:`, jobId);
      const { data } = await axios.post('/api/search', {
        action: 'detail',
        source: source,
        jobId,
        jobData: jobInResults
      });
      return data;
    },
    enabled: !!jobId && isOpen,
    staleTime: Infinity,
  });
}
