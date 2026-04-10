# CONTEXT
Job Hunter is a job search tool using React (Vite) and an Express backend. It searches and aggregates job results from Reed UK, NHS UK, jSearch (US, SE and UK), Arbetsförmedlingen (SE) and Adzuna (US and UK). Seen jobs are marked, and it uses Zustand and TanQuery for storing and caching. It has a beta AI filter using Groq to determine relevance of NHS job results which use a very broad keyword search.

# TECHNICAL STACK
- Frontend:     React (Vite + JSX)
- Styling:      Tailwind CSS (latest version)
- Backend:      Express (Node.js, /server directory)
- State:        Zustand with persist middleware (for seenJobIds in localStorage)
- Data fetching: TanStack Query (React Query v5)
- Fonts:        JetBrains Mono or IBM Plex Mono — downloaded locally via pnpm, NOT via CDN
- Design:       "Clinical/Industrial" — high data density, monospaced labels, 1px solid borders, NHS Blue (#005eb8) accents. No gradients. No generic AI SaaS aesthetics.
- NO CDNs — all packages including fonts installed locally as pnpm dependencies.

# Local Development

## Prerequisites
- Node.js (v18+)
- `pnpm`

## Install Packages

```bash
pnpm install
```

## Setup Environment Variables
Ensure you have the required API keys and secrets set up. Create a `.env` file in the root directory and add any necessary environment variables (see `.env.example`).

```env
# Example .env configuration
PORT=3000
SITE_PASSWORD=your_password
GROQ_API_KEY=your_key
REED_KEY=your_key
ADZUNA_API_ID=your_id
ADZUNA_API_KEY=your_key
OPENWEBNINJA_KEY=your_key
```

## Running the App Locally
You can run both the Vite frontend development server and the Express backend simultaneously with a single command:

```bash
pnpm dev
```

This will:
- Start the Express API server on `http://localhost:3000` (watching for changes with `nodemon`).
- Start the Vite dev server (usually `http://localhost:5173`).
- Proxy any `/api` requests from Vite to the Express server automatically.

# PROJECT STRUCTURE
```
/server
  index.js ← Express entry point
  /api
    /providers
      nhs.js
      adzuna.js
      jsearch.js
      reed.js
	  jobtech.js
    search.js ← Central API proxying route
    verify.js
    sanitize.js
/src
  /components
    SearchForm.jsx
    JobList.jsx
    JobCard.jsx
    JobDetail.jsx
	Login.jsx
	PrivacyModal.jsx
  /hooks
    useJobSearch.js
  /store
    jobStore.js
  App.jsx
  main.jsx
vite.config.js
.env.example
```

# SECURITY CONSTRAINTS
- API keys (REED_KEY, TAVILY_KEY, OPENWEBNINJA_KEY, GROQ_API_KEY) must only exist in .env and be accessed via process.env inside the Express backend
- The frontend must never import or reference any API key
- .env must be in .gitignore; only .env.example is committed
- CRITICAL - AXIOS MUST BE PINNED TO 1.14.0

# API AUTHENTICATION NOTES
**Reed API:**
- HTTP Basic Auth — use REED_KEY as the username, empty string as password.
- Encode as Authorisation: Basic base64(REED_KEY:)
- Base URL: https://www.reed.co.uk/api/1.0
- Docs: https://www.reed.co.uk/developers/Jobseeker

**JSearch:**      
- x-api-key header auth via JSEARCH_KEY: OPENWEBNINJA_KEY
- Base URL: https://api.openwebninja.com/jsearch/search
- Docs: https://www.openwebninja.com/api/jsearch/docs

**Adzuna:**      
- app_id via ADZUNA_API_ID} and app_key via {ADZUNA_API_KEY}
- Base URL: http://api.adzuna.com/v1/api/
- Docs: https://developer.adzuna.com/swagger/spec/test2.json
	
**NHS:**
- There is no authentication required.
- Example URL: https://www.jobs.nhs.uk/api/v1/search_xml?keyword=HL7&location=london&distance=30&sort=publicationDate&page=1&limit=50&staffGroup=ADMINISTRATIVE_AND_CLERICAL

# Development Conventions

## Aesthetic Standards ("Clinical/Industrial")
- **Typography:** JetBrains Mono (monospaced) for all labels, data points, and UI elements. Standard sans-serif is only used for long-form job descriptions to improve readability.
- **Borders:** Strict 1px solid borders (`#000` or `NHS Blue`).
- **Colors:** 
  - **NHS Blue:** `#005eb8` used for focus states, primary buttons, and accents.
  - **Status Red:** Used for "Previously Viewed" indicators and error states.
- **Data Density:** High information density. Minimise white space where it serves no structural purpose.

## Technical Guidelines
- **No CDNs:** All assets, including fonts, must be installed via `pnpm`.
- **API Security:** Frontend must **never** make direct calls to external APIs. All requests must go through the `/api` prefix on the Express server to protect API keys.
- **Data Normalisation:** All job sources must be normalised to a consistent schema in the backend proxy before being sent to the frontend.
- **Testing:** New features or bug fixes must be verified with the corresponding API keys in a local environment using `pnpm dev`.

## Key Files
- `server/index.js`: Main Express entry point and server configuration.
- `server/api/search.js`: The central Express route handler for all API proxying (Reed, JSearch).
- `src/hooks/useJobSearch.js`: Custom TanStack Query hooks for parallel searching and detail fetching.
- `src/store/jobStore.js`: Persistent Zustand store for "seen" state tracking.
- `src/index.css`: Definition of the Clinical Aesthetic System.
- `vite.config.js`: Configuration for the Vite frontend and proxying `/api` to the Express backend.

# PHASED DEVELOPMENT PLAN

## COMPLETED PHASES:

## PHASE 1 COMPLETED: Express API & Search Foundation

### Backend
- Created server/index.js and server/api/search.js as a POST endpoint
- Implemented the Reed lane: call the Reed Search endpoint, return normalised results
- Implemented the Reed Detail lane: given a jobId, call the Reed Job Details endpoint
- Used process.env.REED_KEY for Basic Auth (see auth notes above)
- Returned a consistent JSON shape: { source, jobId, title, employer, location, salary, postedDate, description?, applyUrl? }

### Frontend
- SearchForm.jsx: fields for Keywords, UK Location, Radius (miles), Full/Part time toggle Style with high-contrast 1px borders, monospaced labels, NHS Blue focus states
- JobList.jsx + JobCard.jsx: render list of results. Each card must include a source badge (REED / JSEARCH / TAVILY) in monospaced uppercase.
  - Seen-state prop placeholder (opacity + "PREVIOUSLY VIEWED" label) — wired up in Phase 2
- JobDetail.jsx: inline accordion that expands beneath the clicked card. On first open, fetch from the Reed Detail endpoint using the card's jobId.
  - Show: full description, salary, contract type, posted date, application URL
  - Subsequent opens use cached TanStack Query result — do not re-fetch
- Included skeleton loaders for the results list
- Included inline error states styled to match the clinical aesthetic (no toast libraries)

### Config & Infrastructure
- vite.config.js: proxy /api to http://localhost:3000 for local dev
- App.jsx + main.jsx: full TanStack Query Provider setup

## PHASE 2 COMPLETED: State & Persistence (Zustand)
- jobStore.js: Zustand store with persist middleware saving seenJobIds to localStorage
- Actions: markSeen(jobId), clearSeen(), isSeen(jobId)
- useJobSearch.js: custom hook wrapping TanStack Query; calls markSeen when a job detail is opened
- Wired seen state into JobCard.jsx

## PHASE 3 COMPLETED: JSearch Lane
- Extended /api/search.js to accept a source param ("reed" | "jsearch" | "tavily")
- Implemented JSearch lane: call JSearch via OpenWebNinja, normalised results to the shared schema
- JSearch detail behaviour: clicking a JSearch card expands the same inline accordion as Reed, populated directly from the search response fields — no secondary fetch was required. Included the job_apply_link as the application button within the accordion.
- Displayed JSearch results in the same JobList with JSEARCH source badge
- Added a source filter toggle in the UI (ALL / REED / JSEARCH)

## PHASE 4 COMPLETED: Enhancements
- Add a filter to sort search results by posting date. Default sort to most recent first
- Increase results for JSearch which are currently limited to 10 results by default by the API
	- Send numPages=3 in the request to get 30 results. Do not arbitrarily increase more than this as the API counts each numPages as 1 API request.
	- Set date_posted to "week" to get the jobs posted in the last week.

## PHASE 5 COMPLETED: Adzuna Search Lane
- Extended /api/search.js to accept a source param of "adzuna"
- Implemented Adzuna lane: call Adzuna API, normalise results to the shared schema
- Adzuna detail behaviour: clicking a Adzuna card expands the same inline accordion as Reed & JSearch, populated directly from the search response fields — no secondary fetch required. Included the redirect_url as the application button within the accordion.
- Display Adzuna results in the same JobList with Adzuna source badge
- Added a source filter toggle in the UI (ALL / REED / JSEARCH / ADZUNA)

## PHASE 6 COMPLETED: US JOB SEARCH SUPPORT

Added support to search the US job market as well:

- Added a Country entry to @SearchForm.jsx with 2 drop down inputs, US (value of "us") and UK (value of "gb") to allow the user to choose the Country
- Adzuna:
	- Do not hardcode GB to the URL: https://api.adzuna.com/v1/api/jobs/gb/search/1
	- Added the Country input from the SearchForm to dynamically construct the URL with the correct country
- jSearch:
	- Do not hardcode the params.country to GB. Add the Country input from the SearchForm to the params.country to dynamically add the country
- Reed:
	- If a user selects "US" as the country DO NOT RUN the Reed search as Reed only posts jobs from the UK/GB

## PHASE 7 COMPLETED: Add a Privacy Modal
- Created a privacy modal using the text in @privacy.md as an example if hosted on Vercel.
- Put a link to the Privacy Modal at the bottom of @Login.jsx
- Put a link to the Privacy Modal in the footer of @App.jsx

## PHASE 8 COMPLETED: Secure Login

Implemented a basic secure password-protected entry for the project.

- **Environment Variables**: Uses `SITE_PASSWORD` from `.env`.
- **Express Route**: Created an Express API route at `server/api/verify.js` that compares a POSTed password against `process.env.SITE_PASSWORD`. This is a server-side check to prevent the password from being exposed in the client-side bundle.
- **Login Component**: Creates a `Login.jsx` component that sends the user's input to the API. 
- **App Logic**: Wrapped the main application in `App.jsx` so that content only renders if a `vault_access` key is present and valid in `localStorage`. 
- **Persistence**: Ensured the "authorised" state persists across page refreshes using `useEffect`.

## PHASE 9 COMPLETED: Modularised api/search.js 

Modularised `server/api/search.js`:

- Split this into provider-specific modules (e.g., `server/api/providers/reed.js`, `server/api/providers/adzuna.js`) to improve maintainability and simplify testing.
- Created `server/api/providers/` directory.
- Implemented `server/api/providers/adzuna.js`: Encapsulates Adzuna search and detail logic.
- Implemented `server/api/providers/reed.js`: Encapsulates Reed search and detail logic, including Basic Auth handling.
- Implemented `server/api/providers/jsearch.js`: Encapsulates JSearch search and detail logic.
- Refactored `server/api/search.js`: Simplified the main handler to import and delegate to the new provider modules based on the source parameter.

This refactoring improves maintainability and simplifies the addition of new providers without further bloating the main search handler. The unified data normalisation has been preserved in each module to ensure no impact on the frontend.

## PHASE 10 COMPLETED: Allowed the user to select which sites to Search

- Added functionality to allow the user to choose which sites to query each time. For example they can choose All, or Reed and Adzuna, or Jsearch and Reed etc
- Ensured that only the search handlers that they chose are run when they submit their query.
- Notifies the user if they choose US as the Location and then tick Reed, that this is not a valid combination as Reed is only for the UK. 

## PHASE 11 COMPLETED: jSearch Bug fixes

1. Fields Captured from Frontend (`server/api/search.js`)

	The main handler captures the following fields from the request body:
	 * keywords
	 * location
	 * radius
	 * fullTime (Toggle for Full/Part time)
	 * country (Defaults to 'gb')
	 * action ('search' or 'detail')
	 * jobId
	 * jobData

2. Fields Sent to JSearch (`server/api/providers/jsearch.js`)

	When the source is set to jsearch, the fields are handled as follows:

	Field / Status / How it is sent to JSearch API

	- Keywords - Sent    - Concatenated into the query string: ${keywords} in ${location}  
	- Location - Sent    - Concatenated into the query string: ${keywords} in ${location}
	- Country  - Sent    - Sent as a dedicated country parameter in the API request.
	- Radius   - Dropped - Captured in search.js but not passed to the JSearch handler.
	- FullTime - Dropped - Captured in search.js but not passed to the JSearch handler.

3. Summary of Discrepancies

	 * Query-based Location: For some reason the JSearch search relies entirely on a natural language string (e.g., "Developer in London"). The location is now sent as a parameter as captured by the main handler.
	 * Missing Parameters: The JSearch API supports radius and employment_types parameters, but were currently being ignored in both the `server/api/search.js` jSearch routing logic and the jsearch.js provider implementation. They are now implemented in the jSearch Search params.

## PHASE 12 COMPLETED: Add NHS Job Searching

- The NHS has a job API called "NHS Jobs Self-Serve Job Adverts API" which allows a URL call to return an XML payload with jobs in. The specification is in @nhs_self_serve_api_v0.6.json (search_xml)
- There is no authentication required.
- XML Parsing: Installed an XML Parser (via pnpm) to process the NHS API's XML responses.
- Constraints: The NHS search only executes when the country is set to gb (UK).
- Example payload response: @nhs.xml
- The Number of results in the Response is controlled by `page` and `limit`.
- URL Encoding:
	- All characters are URL encoded, e.g. spaces replaced with %20, e.g. day%20care
	- & is replaced with %26
	- Double quotes replaced with %22
	- To use parameters in combination, use & between them.
- We MUST use &staffGroup=ADMINISTRATIVE_AND_CLERICAL to filter clinical roles out that may partially match the keyword
- Example URL: https://www.jobs.nhs.uk/api/v1/search_xml?keyword=HL7&location=london&distance=30&sort=publicationDate&page=1&limit=50&staffGroup=ADMINISTRATIVE_AND_CLERICAL

## PHASE 13 COMPLETED : GROQ SANITISATION OF NHS SEARCH results

Problem: The NHS API uses the keywords in an extremely broad manner. For example a search for "java developer" will return all results with the word "develop" which could be a completely irrelevant job for a cleaner or warehouse worker, as the job advert had the word "develop" in. To address the issue of broad keyword matching in the NHS API while respecting Groq's token-per-minute (TPM) limits and minimising API costs, implemented a "User-Initiated Smart Sanitisation" strategy using the groq-sdk.

1. Technical Architecture

A. Backend: Sanitisation Endpoint
 * Action-Based Routing: Created a dedicated `server/api/sanitize.js` endpoint to handle the sanitisation request.
 * Prompt Engineering: Used a "Few-Shot" or "System Role" prompt optimised for extreme brevity.
     * Input: The original search keywords and a list of NHS job objects containing only jobId, title, and the truncated description.
     * Example Prompt Template:

		System: You are a strict job relevance filter. The user is always searching for IT adjacent roles.
		User: Keywords: "{{keywords}}"
		Jobs:
		[ID:{{id}}, Title:{{title}}, Snippet:{{description}}]
		Task: Identify jobs directly return relevant to the keywords. Exclude results where keywords appear in unrelated contexts (e.g., if searching for "Developer", exclude "Property Developer" or "Cleaners").
		Output: JSON array of relevant IDs only.
		
 * Token Optimisation:
     * Field Selection: Send only the jobId, title, and the already-truncated NHS description.
     * Efficiency Calculation: An average NHS snippet is ~60 tokens. 50 jobs × 60 tokens ≈ 3,000 tokens. Adding titles and prompt overhead, a single request totals ~4,000–5,000 tokens, fitting comfortably within the 8,000–12,000 TPM on Groq limit for models like llama-3.3-70b-versatile and gpt-oss-120b.

B. Frontend: Trigger & State Management
 * Sanitisation Trigger: Added a "Refine NHS Results (AI)" button in the JobList component. This button will only appear when NHS results are visible.
 * Mutation Hook: Added a useSanitizeNhs mutation to the useJobSearch hook.
     * Execution: When clicked, the frontend gathers all current NHS jobs from the cache and sends them to the backend.
     * State Update: Upon receiving the "Relevant IDs" array from Groq, the frontend updates the jobResults cache by updating (Phase 1) or removing (Phase 2) the irrelevant NHS entries. This ensures the UI updates instantly without a full page re-fetch.

2. Workflow Summary
 1. Search Phase: User performs a standard search; raw NHS results are displayed.
 2. Observation Phase: User notices irrelevant results (e.g., "Cleaner" appearing in a "Java Developer" search).
 3. Sanitisation Phase: User clicks "Refine NHS Results."
 4. Processing Phase:
     * Frontend sends NHS data + keywords to dedicated `server/api/sanitize.js` endpoint
     * Backend prompts Groq using a highly compressed format.
     * Groq returns a simple list of "Good IDs."
 5. Finalisation: 
	 * PHASE 1 - TESTING THE SANITISATION: Irrelevant jobs stay in the list, but are marked as "POSSIBLY NOT RELEVANT"; the "Refine" button is replaced with a "Sanitized" badge.
	 * PHASE 2 - ONCE TESTING IS APPROVED: Update code so irrelevant jobs disappear from the list.

3. Key Benefits
 * Token-Efficient: By sending only truncated descriptions and requesting a minimalist JSON array as output, we stay well under the TPM ceiling.
 * Cost-Controlled: No automatic calls. Every LLM request is a deliberate user choice.
 * High Precision: LLMs are excellent at identifying semantic "mismatches" that simple keyword filters miss.
 * Low Latency: Groq's high-speed inference ensures the "sanitization" feels near-instant to the user.

4. Limitations & Mitigation
 * TPM Spikes: If a user tries to sanitise 100+ jobs at once, the backend will automatically chunk the request into groups of 25 to avoid hitting the 8k limit in a single burst.
 * Packages should be installed using pnpm

## PHASE 14 COMPLETED: Migration to Express Backend

Migrated the backend from Vercel Serverless Functions to a standalone Express server to improve local development, simplify deployment and remove Vercel dependence for those who do not use it.

- **Backend Structure**: Moved all API logic into the `/server` directory.
  - `server/index.js`: Main Express entry point with middleware for JSON parsing and CORS.
  - `server/api/`: Contains route handlers for `search`, `verify`, and `sanitize`.
- **Frontend Integration**: Updated `vite.config.js` to proxy `/api` requests to the Express server (port 3000).
- **Development Workflow**: Updated `package.json` to allow running both frontend and backend concurrently via `pnpm dev`.
- **Cleanup**: Removed `vercel.json` and the root-level `/api` directory.

## PHASE 15 COMPLETED: Added support for Sweden to search Arbetsförmedlingen

1. Created server/api/providers/jobtech.js:
   - Uses the Swedish JobTech API directly based on the specifications.
   - Handles Swedish specific municipality logic (Stockholm, Gothenburg, Malmö) by assigning corresponding IDs, checking boundaries, and mapping their longitudes/latitudes along with radius.
   - Incorporates the URLSearchParams format and guarantees strict API requests structure while using console.error to output the executed queries.
   - Normalizes returned payload into the standard structure expected by the frontend.

2. Updated server/api/search.js Routing:
   - Added logic to import and map source === 'arbets' queries directly to the newly constructed jobtech.js provider, ensuring they only operate when the country is configured as se.

3. Frontend Adjustments in src/components/SearchForm.jsx:
   - Appended <option value="se">Sweden</option> to the Country form selection.
   - Updated the form handlers so arbets automatically appears in the job source toggles.
   - Integrated logic to dynamically configure and constrain available provider arrays. When "Sweden" is selected, only jsearch and arbets are active job sources (while reed, adzuna, and nhs are properly disabled and labeled).

4. Updated List UI in src/components/JobList.jsx:
   - Added ARBETS onto the frontend tab layout so Arbetsförmedlingen hits can be separately filtered in the result view.

5. Tweaked server/api/providers/jsearch.js:
   - Outfitted handling to resolve queries mapped to Sweden (se) by routing fallback parameters correctly (e.g., using kr for currency layout and returning Sweden for unstructured locations vs UK or USA).

## PHASE 16 COMPLETED: Added support for Sweden to search EnglishJobSearch.se
   
1. Installed cheerio: Added cheerio to dependencies using pnpm to enable HTML parsing on the server-side.
2. Created englishjobsearch.js: Built the server/api/providers/englishjobsearch.js module. It uses axios to fetch data and cheerio to parse the HTML responses directly from the englishjobsearch.se SERP endpoints, matching the logic for dynamically structuring URL strings based on whether the query or location arguments are provided. It maps the parsed data into the standard JSON response format used across the platform.
3. Updated search.js Router: Registered the new source (englishjobsearch) in server/api/search.js and added the same location restrictions as Arbetsförmedlingen so it only executes when country is set to 'se'.
4. Updated SearchForm.jsx Frontend: Added englishjobsearch as an available source toggle. The form dynamically restricts selection of this provider strictly to when the user has set the country to "Sweden", and automatically enables it when Sweden is selected alongside jsearch and arbets.

