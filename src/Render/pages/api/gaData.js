import { fetchGAData } from '../../lib/bigqueryClient';

export default async function handler(req, res) {
  try {
    const data = await fetchGAData();
    res.status(200).json(data);
  } catch (error) {
    console.error('Failed to fetch GA data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}