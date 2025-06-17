export default function handler(req, res) { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ status: 'success', quota: { used: 3, total: 10 } })); }
