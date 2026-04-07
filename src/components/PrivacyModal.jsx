import React from 'react';

const PrivacyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4 font-mono">
      <div className="bg-white border-2 border-black w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="border-b-2 border-black p-4 flex justify-between items-center bg-[#005eb8] text-white">
          <h2 className="text-xl font-bold uppercase tracking-tight">Privacy & Data Processing Notice</h2>
          <button 
            onClick={onClose}
            className="border border-white px-2 py-1 hover:bg-white hover:text-[#005eb8] transition-colors uppercase text-sm font-bold"
          >
            [CLOSE]
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-sm space-y-6 leading-relaxed">
          <p className="font-bold">
            This notice explains the minimal technical data processing required to make this website function securely and effectively.
          </p>

          <section>
            <h3 className="font-bold border-b border-black mb-2 uppercase">1. No Third-Party Tracking or Cookies</h3>
            <p>This website does not use tracking cookies, behavioral analytics, or marketing tools.</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><span className="font-bold">Local Assets:</span> All styling, fonts, and interactive scripts are hosted directly on our infrastructure.</li>
              <li><span className="font-bold">No CDNs:</span> Your browser is not forced to connect to public Content Delivery Networks (CDNs) to load these assets, preventing "passive" tracking by third-party providers.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold border-b border-black mb-2 uppercase">2. Website Hosting (Vercel)</h3>
            <p>This website is hosted by <span className="font-bold">Vercel Inc.</span></p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><span className="font-bold">The Data Processor:</span> Vercel acts as a Data Processor to securely serve this website to your device.</li>
              <li><span className="font-bold">What is Processed:</span> Vercel’s servers automatically process your IP address and standard web request data. This is strictly necessary to route the website's files to your browser and to protect the site against cyber threats (e.g., DDoS attacks).</li>
              <li><span className="font-bold">Strictly No Analytics:</span> I have explicitly disabled Vercel Web Analytics and Vercel Speed Insights. Your visit is not tracked, and your browsing session is not recorded.</li>
              <li><span className="font-bold">International Transfers:</span> Vercel is a United States company and this site and its functions are hosted in the US. Vercel is officially certified under the <span className="font-bold">EU-U.S. Data Privacy Framework (DPF)</span> to ensure data remains protected under European privacy standards.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold border-b border-black mb-2 uppercase">3. Job Searches & IP Masking</h3>
            <p>
              Your Job Search preferences are sent to the Job Search APIs provided by Reed, Adzuna and jSearch. When you perform a search, your request is handled via a <span className="font-bold">"Backend-for-Frontend"</span> architecture to protect your identity.
            </p>
            <div className="mt-4 border border-black overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b border-black">
                    <th className="p-2 border-r border-black font-bold uppercase text-xs">Feature</th>
                    <th className="p-2 font-bold uppercase text-xs">How it works</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-black">
                    <td className="p-2 border-r border-black font-bold text-xs uppercase">Direct Masking</td>
                    <td className="p-2 text-xs">Your IP address is <span className="font-bold">never</span> shared with the third-party job providers (Reed, Adzuna, or jSearch).</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-2 border-r border-black font-bold text-xs uppercase">Proxying</td>
                    <td className="p-2 text-xs">These providers only see the IP address of our Vercel serverless function, effectively masking your individual connection.</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-black font-bold text-xs uppercase">No Logging</td>
                    <td className="p-2 text-xs">We do not record, retain, or monetize your search queries or the IP addresses associated with them.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h3 className="font-bold border-b border-black mb-2 uppercase">4. Local Storage (Persistent Preferences)</h3>
            <p>To improve your experience, this site saves specific data directly to your device’s browser storage (using Zustand).</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><span className="font-bold">Persistent Tracking:</span> We save your search history and the IDs of jobs you have already viewed. This allows the site to remember your progress even if you close your browser and return later.</li>
              <li><span className="font-bold">Privacy-First:</span> This data is stored exclusively on your device. It is never transmitted to, stored by, or accessible to our servers.</li>
              <li><span className="font-bold">User Control:</span> You remain in full control of this data. You can wipe all "seen" job history and search preferences at any time by clearing your browser’s cache or local storage.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold border-b border-black mb-2 uppercase">5. External Links</h3>
            <p>This site provides links to third-party job boards. When you click a link to view a full job description, you are leaving this site. We have no control over the privacy practices or cookie policies of these external platforms.</p>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-black p-4 bg-gray-50 flex justify-end">
          <button 
            onClick={onClose}
            className="border-2 border-black px-6 py-2 bg-[#005eb8] text-white hover:bg-white hover:text-[#005eb8] transition-colors uppercase font-bold text-sm"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyModal;
