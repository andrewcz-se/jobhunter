import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

export default async function handleNhs(params) {
  const { action, keywords, location, radius, jobId, jobData } = params;

  const normalizeJob = (job) => {
    let loc = 'UK';
    if (job.locations && job.locations.location) {
      if (Array.isArray(job.locations.location)) {
        loc = job.locations.location.join(', ');
      } else {
        loc = job.locations.location;
      }
    }

    return {
      source: 'NHS',
      jobId: `NHS:${job.id}`,
      title: job.title,
      employer: job.employer,
      location: loc,
      salary: job.salary || 'Not disclosed',
      postedDate: job.postDate ? new Date(job.postDate).toISOString() : new Date().toISOString(),
      description: job.description || '',
      applyUrl: job.url,
      contractType: job.type,
    };
  };

  if (action === 'search') {
    const queryParams = new URLSearchParams();
    if (keywords) queryParams.append('keyword', keywords);
    if (location) queryParams.append('location', location);
    if (radius) queryParams.append('distance', radius.toString());
    queryParams.append('sort', 'publicationDate');
    queryParams.append('page', '1');
    queryParams.append('limit', '50');
    queryParams.append('staffGroup', 'ADMINISTRATIVE_AND_CLERICAL');

    const url = `https://www.jobs.nhs.uk/api/v1/search_xml?${queryParams.toString().replace(/\+/g, '%20')}`;
    console.log('API: Fetching NHS jobs:', url);

    const response = await axios.get(url, {
      responseType: 'text',
      headers: {
        'Accept': 'application/xml'
      }
    });

    const parser = new XMLParser();
    const result = parser.parse(response.data);
    
    let jobs = [];
    if (result && result.nhsJobs && result.nhsJobs.vacancyDetails) {
      if (Array.isArray(result.nhsJobs.vacancyDetails)) {
        jobs = result.nhsJobs.vacancyDetails;
      } else {
        jobs = [result.nhsJobs.vacancyDetails];
      }
    }

    console.log(`API: NHS response received. Result count:`, jobs.length);

    return jobs.map(normalizeJob);
  }

  if (action === 'detail') {
    if (jobData && jobData.description) return jobData;
    
    // If not fully populated, we can return the jobData as is, 
    // or implement searchByReferenceNumberOnly if needed. 
    // Since NHS xml includes description, it should already be populated.
    if (jobData) return jobData;
    
    throw new Error('NHS detail fetch not implemented or jobData missing');
  }

  throw new Error('Invalid action for NHS');
}
