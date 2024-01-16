import express from 'express';
import { fetchDomainByName, fetchUrlsByDomainName } from '../../db/db';

const router = express.Router();

router.get('/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const domain = await fetchDomainByName(name);
    if (!domain) {
      return res.status(404).json({ message: 'Domain not found' });
    }
    res.json(domain);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
});

router.get('/:name/urls', async (req, res) => {
  try {
    const { name } = req.params;
    const urls = await fetchUrlsByDomainName(name);
    res.json(urls);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
});

export default router;