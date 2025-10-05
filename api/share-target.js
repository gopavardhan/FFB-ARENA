import formidable from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'parsing error' });
    // For now just echo back
    res.status(200).json({ fields, files });
  });
}
