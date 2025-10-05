export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { filename, content } = req.body || {};
  // Placeholder: in real app you'd process the file contents
  res.status(200).json({ ok: true, filename, length: content ? content.length : 0 });
}
