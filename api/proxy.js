
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Lấy URL từ query parameter
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'Missing url parameter' });
    }

    // Decode URL
    const apiUrl = decodeURIComponent(url);
    
    // Kiểm tra URL có hợp lệ không
    if (!apiUrl.startsWith('https://phimapi.com')) {
      return res.status(403).json({ error: 'Invalid API endpoint' });
    }

    // Fetch data từ API
    const response = await fetch(apiUrl);
    const data = await response.json();

    // Trả về data
    return res.status(200).json(data);
    
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch data',
      message: error.message 
    });
  }
}