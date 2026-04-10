import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handleEnglishJobSearch(params) {
  const { action, keywords, location, jobData } = params;

  if (action === 'search') {
    let cleanLoc = '';
    if (location) {
      cleanLoc = location.toLowerCase();
      // Handle Swedish characters and alternatives
      cleanLoc = cleanLoc.replace(/ö/g, 'o').replace(/ä/g, 'a').replace(/å/g, 'a').replace(/é/g, 'e');
      if (cleanLoc.includes('gothenburg') || cleanLoc.includes('goteborg')) {
        cleanLoc = 'goteborg';
      } else if (cleanLoc.includes('malmo')) {
        cleanLoc = 'malmo';
      } else if (cleanLoc.includes('stockholm')) {
        cleanLoc = 'stockholm';
      } else {
        cleanLoc = encodeURIComponent(cleanLoc);
      }
    }

    let queryPart = keywords ? encodeURIComponent(keywords) : '';

    let targetUrl = 'https://englishjobsearch.se';
    
    if (cleanLoc && queryPart) {
      targetUrl += `/in/${cleanLoc}/${queryPart}`;
    } else if (cleanLoc) {
      targetUrl += `/in/${cleanLoc}`;
    } else if (queryPart) {
      targetUrl += `/jobs/${queryPart}`;
    } else {
      targetUrl += `/jobs`;
    }

    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const results = [];

    $('.job').each((i, el) => {
      const $job = $(el);
      const $anchor = $job.find('a[href*="/clickout/"]');
      if (!$anchor.length) return;

      const title = $anchor.find('h3').text().trim();
      if (!title) return;

      const href = $anchor.attr('href');
      const applyUrl = href.startsWith('http') ? href : `https://englishjobsearch.se${href}`;
      
      let jobId = applyUrl.split('?')[0].split('/').pop();
      if (!jobId) jobId = `ejs-${i}`;

      const $liItems = $job.find('ul > li');
      const employer = $liItems.eq(0).text().trim() || 'Unknown Employer';
      const locationText = $liItems.eq(1).text().trim() || 'Sweden';
      const dateText = $liItems.eq(2).text().trim() || 'Unknown Date';

      const description = $job.find('.text-gray-400').text().replace(/\s+/g, ' ').trim() || 'No description available';

      results.push({
        source: 'ENGLISHJOBSEARCH',
        jobId: `EJS:${jobId}`,
        title,
        employer,
        location: locationText,
        salary: 'Competitive',
        postedDate: dateText,
        description,
        applyUrl,
        contractType: 'N/A'
      });
    });

    return results;
  }

  if (action === 'detail') {
    if (jobData) return jobData;
    throw new Error('Detail fetch not supported for English Job Search (data should be pre-fetched).');
  }

  throw new Error('Invalid action for English Job Search');
}
