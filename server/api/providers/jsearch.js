import axios from 'axios';

export default async function handleJSearch(params) {
  const { action, keywords, location, radius, fullTime, country = 'gb', jobId, jobData } = params;
  const JSEARCH_KEY = process.env.OPENWEBNINJA_KEY;

  if (!JSEARCH_KEY) throw new Error('OPENWEBNINJA_KEY not configured');

  const normalizeJob = (job) => {
    const currencySymbol = country === 'gb' ? '£' : '$';
    
    // Improved Location Normalization
    // 1. Use job_location if present (usually a full string like "Dearborn, MI")
    // 2. Fallback to city/country construction
    // 3. Fallback to default country label
    const rawLocation = job.job_location || 
      `${job.job_city || ''}${job.job_city && job.job_country ? ', ' : ''}${job.job_country || ''}`.trim();
    
    const finalLocation = rawLocation || (country === 'gb' ? 'UK' : 'USA');

    return {
      source: 'JSEARCH',
      jobId: `JSEARCH:${job.job_id}`,
      title: job.job_title,
      employer: job.employer_name,
      location: finalLocation,
      salary: job.job_min_salary ? `${currencySymbol}${job.job_min_salary} - ${currencySymbol}${job.job_max_salary}` : 'Not disclosed',
      postedDate: job.job_posted_at_timestamp 
        ? new Date(job.job_posted_at_timestamp * 1000).toISOString() 
        : new Date().toISOString(),
      description: job.job_description || job.description || job.snippet || '',
      applyUrl: job.job_apply_link,
      applyOptions: job.apply_options || [],
      contractType: job.job_employment_type,
      highlights: job.job_highlights || {}
    };
  };

  if (action === 'search') {
    const searchParams = { 
      query: keywords || 'jobs', 
      location: location || (country === 'gb' ? 'UK' : 'USA'),
      country: country,
      num_pages: 3,
      date_posted: 'week'
    };

    if (radius) {
      searchParams.radius = radius;
    }

    if (fullTime) {
      searchParams.employment_types = 'FULLTIME';
    }

    const response = await axios.get('https://api.openwebninja.com/jsearch/search', {
      params: searchParams,
      headers: { 'x-api-key': JSEARCH_KEY },
    });

    console.log('API: JSearch response received. Result count:', response.data.data?.length);
    
    return response.data.data.map(normalizeJob);
  }

  if (action === 'detail') {
    // If we have full data already (with description), return it
    if (jobData && jobData.description) return jobData;

    // Otherwise fetch from the job-details endpoint
    const cleanJobId = jobId.replace('JSEARCH:', '');
    console.log(`API: Fetching JSearch details from OpenWebNinja for: ${cleanJobId}`);
    
    const response = await axios.get('https://api.openwebninja.com/jsearch/job-details', {
      params: { job_id: cleanJobId },
      headers: { 'x-api-key': JSEARCH_KEY },
    });

    if (!response.data.data || response.data.data.length === 0) {
      throw new Error('Job details not found in JSearch API');
    }

    return normalizeJob(response.data.data[0]);
  }

  throw new Error('Invalid action for JSearch');
}
