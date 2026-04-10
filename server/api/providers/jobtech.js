import axios from 'axios';

export default async function handleJobTech(params) {
  const { action, keywords, location, radius, jobData } = params;

  if (action === 'search') {
    const searchParams = new URLSearchParams();
    
    searchParams.append('published-after', '10080'); // 7 days in minutes
    searchParams.append('limit', '50');
    searchParams.append('sort', 'pubdate-desc');

    let q = keywords || '';
    const locLower = (location || '').toLowerCase();

    const municipalities = {
      'stockholm': '0i77_o7u_3hg',
      'gothenburg': 'PVZL_BQT_XtL',
      'göteborg': 'PVZL_BQT_XtL',
      'goteborg': 'PVZL_BQT_XtL',
      'malmö': 'ONpW_86P_h7g',
      'malmo': 'ONpW_86P_h7g'
    };

    const coordinates = {
      'stockholm': { lat: '59.3293', lan: '18.0686' },
      'gothenburg': { lat: '57.7089', lan: '11.9746' },
      'göteborg': { lat: '57.7089', lan: '11.9746' },
      'goteborg': { lat: '57.7089', lan: '11.9746' },
      'malmö': { lat: '55.6050', lan: '13.0038' },
      'malmo': { lat: '55.6050', lan: '13.0038' }
    };

    if (locLower) {
      if (municipalities[locLower]) {
        searchParams.append('municipality', municipalities[locLower]);
        
        if (radius && radius > 0 && coordinates[locLower]) {
          searchParams.append('lat', coordinates[locLower].lat);
          searchParams.append('lan', coordinates[locLower].lan);
          searchParams.append('radius', radius.toString());
        }
      } else {
        q = q ? `${q} ${location}` : location;
      }
    }

    if (q) {
      searchParams.append('q', q);
    }

    const url = `https://jobsearch.api.jobtechdev.se/search?${searchParams.toString()}`;
    // Log using console.error as per instruction
    console.error(`API Request: ${url}`);

    const response = await axios.get(url);
    const hits = response.data.hits || [];

    return hits.map(job => {
      const workplace = job.workplace_address;
      const jobLocation = workplace?.city || workplace?.municipality || 'Sweden';
      
      return {
        source: 'ARBETS',
        jobId: `ARBETS:${job.id}`,
        title: job.headline || job.occupation?.label || 'Unknown Title',
        employer: job.employer?.name || 'Unknown Employer',
        location: jobLocation,
        salary: job.salary_type?.label || 'Not disclosed',
        postedDate: job.publication_date || new Date().toISOString(),
        description: job.description?.text || '',
        applyUrl: job.webpage_url,
      };
    });
  }

  if (action === 'detail') {
    if (jobData) return jobData;
    throw new Error('Detail fetch not supported for Arbetsformedlingen (data should be pre-fetched).');
  }

  throw new Error('Invalid action for Arbetsformedlingen');
}
