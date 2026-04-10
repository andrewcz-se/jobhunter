import handleReed from './providers/reed.js';
import handleJSearch from './providers/jsearch.js';
import handleAdzuna from './providers/adzuna.js';
import handleNhs from './providers/nhs.js';
import handleJobTech from './providers/jobtech.js';
import handleEnglishJobSearch from './providers/englishjobsearch.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { action, source, keywords, location, radius, fullTime, jobId, jobData, country = 'gb' } = req.body || {};
  console.log('API Request:', { action, source, keywords, location, radius, fullTime, jobId, country });

  try {
    let result;

    if (source === 'adzuna') {
      result = await handleAdzuna({ action, keywords, location, radius, country, jobData });
    } else if (source === 'reed' || (!source && action === 'search')) {
      // Default to Reed if no source is specified for search (Phase 1 legacy)
      result = await handleReed({ action, keywords, location, radius, fullTime, country, jobId });
    } else if (source === 'jsearch') {
      result = await handleJSearch({ action, keywords, location, radius, fullTime, country, jobId, jobData });
    } else if (source === 'nhs') {
      if (country !== 'gb') {
         return res.status(400).json({ error: 'NHS jobs are only available in the UK' });
      }
      result = await handleNhs({ action, keywords, location, radius, jobId, jobData });
    } else if (source === 'arbets') {
      if (country !== 'se') {
         return res.status(400).json({ error: 'Arbetsformedlingen jobs are only available in Sweden' });
      }
      result = await handleJobTech({ action, keywords, location, radius, jobId, jobData });
    } else if (source === 'englishjobsearch') {
      if (country !== 'se') {
         return res.status(400).json({ error: 'English Job Search jobs are only available in Sweden' });
      }
      result = await handleEnglishJobSearch({ action, keywords, location, jobId, jobData });
    } else {
      return res.status(400).json({ error: 'Invalid source' });
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error('API Proxy Error:', error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      error: error.response?.data?.message || error.message || 'Failed to fetch from API',
    });
  }
}
