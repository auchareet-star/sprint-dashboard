import { useState, useEffect } from 'react';
import { rawAll, rawBugs } from '../data/sampleData';
import { fetchAllCards, fetchBugs, isGoogleSheetsConfigured } from '../data/googleSheets';

export function useData() {
  const [cards, setCards] = useState(rawAll);
  const [bugs, setBugs] = useState(rawBugs);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState('sample');

  useEffect(() => {
    if (!isGoogleSheetsConfigured()) return;

    setLoading(true);
    setSource('google');

    const loadCards = fetchAllCards()
      .then((c) => { console.log('Cards loaded:', c.length); setCards(c); })
      .catch((err) => console.warn('fetchAllCards failed:', err));

    const loadBugs = fetchBugs()
      .then((b) => { console.log('Bugs loaded:', b.length); setBugs(b); })
      .catch((err) => console.warn('fetchBugs failed:', err));

    Promise.all([loadCards, loadBugs]).finally(() => setLoading(false));
  }, []);

  return { cards, bugs, loading, source };
}
