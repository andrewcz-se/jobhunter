import axios from 'axios';

export default async function handleReed(params) {
  const { action, keywords, location, radius, fullTime, country = 'gb', jobId } = params;
  const REED_KEY = process.env.REED_KEY;

  if (country !== 'gb') return [];
  if (!REED_KEY) throw new Error('REED_KEY not configured');

  const authHeader = `Basic ${Buffer.from(`${REED_KEY}:`).toString('base64')}`;

  if (action === 'search') {
    const response = await axios.get('https://www.reed.co.uk/api/1.0/search', {
      params: {
        keywords,
        locationName: location,
        distanceFromLocation: radius || 10,
        fullTime: fullTime === true ? 'true' : 'false',
      },
      headers: { Authorization: authHeader },
    });

    return response.data.results.map((job) => {
      const [day, month, year] = job.date.split('/');
      const isoDate = new Date(`${year}-${month}-${day}`).toISOString();

      return {
        source: 'REED',
        jobId: `REED:${job.jobId}`,
        title: job.jobTitle,
        employer: job.employerName,
        location: job.locationName,
        salary: job.minimumSalary && job.maximumSalary 
          ? `£${job.minimumSalary} - £${job.maximumSalary}`
          : job.salary || 'Competitive',
        postedDate: isoDate,
        description: job.jobDescription,
      };
    });
  }

  if (action === 'detail') {
    const cleanJobId = jobId.replace('REED:', '');
    const response = await axios.get(`https://www.reed.co.uk/api/1.0/jobs/${cleanJobId}`, {
      headers: { Authorization: authHeader },
    });
    const job = response.data;
    
    let isoDate = new Date().toISOString();
    if (job.date && job.date.includes('/')) {
      const [day, month, year] = job.date.split('/');
      isoDate = new Date(`${year}-${month}-${day}`).toISOString();
    }

    return {
      source: 'REED',
      jobId: `REED:${job.jobId}`,
      title: job.jobTitle,
      employer: job.employerName,
      location: job.locationName,
      salary: job.minimumSalary && job.maximumSalary 
        ? `£${job.minimumSalary} - £${job.maximumSalary}`
        : job.salary || 'Competitive',
      postedDate: isoDate,
      description: job.jobDescription,
      applyUrl: job.jobUrl,
      contractType: job.contractType,
    };
  }

  throw new Error('Invalid action for Reed');
}
