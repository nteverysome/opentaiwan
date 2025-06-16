export default function handler(req, res) {
  res.status(200).json({ quota: 'Unlimited' });
}
