export default async function handler(req, res) {
  // Simple placeholder endpoint used by periodic sync to refresh server-side cache
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({ ok: true, refreshedAt: new Date().toISOString() });
}
