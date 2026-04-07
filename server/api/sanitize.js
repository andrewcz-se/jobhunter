import Groq from "groq-sdk";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { keywords, jobs } = req.body || {};
  
  if (!keywords || !jobs || !Array.isArray(jobs)) {
    return res.status(400).json({ error: 'Missing keywords or jobs array' });
  }

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: 'GROQ_API_KEY is not configured' });
  }

  try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const chunkSize = 25;
      let allRelevantIds = [];
  
      for (let i = 0; i < jobs.length; i += chunkSize) {
        const chunk = jobs.slice(i, i + chunkSize);
        const jobsString = chunk.map(j => `JOB_ID: ${j.jobId} | TITLE: ${j.title} | SNIPPET: ${j.description || ''}`).join('\n');
  
        const prompt = `System: You are a strict job relevance filter. The user is always searching for IT adjacent roles.
User: Keywords: "${keywords}"
Jobs:
${jobsString}
Task: Identify jobs directly relevant to the keywords. Exclude results where keywords appear in unrelated contexts (e.g., if searching for "Developer", exclude "Property Developer" or "Cleaners").
Output: JSON object with a single key "relevantIds" containing an array of the exact JOB_ID strings provided (e.g. 'NHS:12345'). Do not include the 'JOB_ID:' prefix in the array values.`;

      // Use console.error to bypass stdout buffering in piped environments like concurrently
      console.error(`\n>>> GROQ PROMPT (Chunk ${i / chunkSize + 1}) <<<`);
      console.error(prompt);
      console.error('-----------------------------------');

      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
      });

      const content = completion.choices[0]?.message?.content;

      console.error(`\n<<< GROQ RESPONSE (Chunk ${i / chunkSize + 1}) >>>`);
      console.error(content);
      console.error('-------------------------------------');

      if (completion.usage) {
        console.error(`\n--- GROQ TOKEN USAGE (Chunk ${i / chunkSize + 1}) ---`);
        console.error('Input Tokens:', completion.usage.prompt_tokens);
        console.error('Output Tokens:', completion.usage.completion_tokens);
        console.error('Total Tokens:', completion.usage.total_tokens);
        console.error('----------------------------------------\n');
      }
      if (content) {
        try {
          const parsed = JSON.parse(content);
          if (parsed.relevantIds && Array.isArray(parsed.relevantIds)) {
            allRelevantIds.push(...parsed.relevantIds);
          }
        } catch (e) {
          console.error("Failed to parse Groq response:", content);
        }
      }
    }

    return res.status(200).json({ relevantIds: allRelevantIds });

  } catch (error) {
    console.error('Sanitize API Error:', error.message);
    return res.status(500).json({ error: 'Failed to sanitize jobs' });
  }
}
