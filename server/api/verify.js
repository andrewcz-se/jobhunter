export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { password } = req.body || {};
  const SITE_PASSWORD = process.env.SITE_PASSWORD;

  if (!SITE_PASSWORD) {
    console.error('SITE_PASSWORD environment variable is not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (password === SITE_PASSWORD) {
    return res.status(200).json({ success: true, token: 'vault_access_granted' });
  } else {
    return res.status(401).json({ error: 'Invalid password' });
  }
}
