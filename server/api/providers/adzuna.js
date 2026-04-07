import axios from 'axios';

export default async function handleAdzuna(params) {
  const { action, keywords, location, radius, country = 'gb', jobData } = params;
  const ADZUNA_API_ID = process.env.ADZUNA_API_ID;
  const ADZUNA_API_KEY = process.env.ADZUNA_API_KEY;

  if (!ADZUNA_API_ID || !ADZUNA_API_KEY) {
    throw new Error('ADZUNA_API_ID or ADZUNA_API_KEY not configured');
  }

  if (action === 'search') {
    const response = await axios.get(`https://api.adzuna.com/v1/api/jobs/${country}/search/1`, {
      params: {
        app_id: ADZUNA_API_ID,
        app_key: ADZUNA_API_KEY,
        results_per_page: 50,
        what: keywords,
        where: location,
        distance: radius || 10,
        max_days_old: 7,
        sort_by: 'date',
        'content-type': 'application/json'
      }
    });

    return response.data.results.map((job) => {
      const currencySymbol = country === 'gb' ? '£' : '$';
      return {
        source: 'ADZUNA',
        jobId: `ADZUNA:${job.id}`,
        title: job.title,
        employer: job.company?.display_name || 'Unknown Employer',
        location: job.location?.display_name || (country === 'gb' ? 'UK' : 'USA'),
        salary: job.salary_min && job.salary_max 
          ? `${currencySymbol}${Math.round(job.salary_min).toLocaleString()} - ${currencySymbol}${Math.round(job.salary_max).toLocaleString()}`
          : 'Competitive',
        postedDate: job.created,
        description: job.description || 'No description available',
        applyUrl: job.redirect_url,
        contractType: job.contract_type || job.contract_time || 'N/A'
      };
    });
  }

  if (action === 'detail') {
    if (jobData) return jobData;
    throw new Error('Detail data missing for Adzuna');
  }

  throw new Error('Invalid action for Adzuna');
}
