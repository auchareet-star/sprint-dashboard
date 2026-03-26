import { useState, useEffect } from 'react';
import { rawAll, rawBugs } from '../data/sampleData';
import { fetchAllCards, fetchBugs, fetchTeamMembers, isGoogleSheetsConfigured } from '../data/googleSheets';

export function useData() {
  const [cards, setCards] = useState(rawAll);
  const [bugs, setBugs] = useState(rawBugs);
  const [team, setTeam] = useState([]);
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

    const loadTeam = fetchTeamMembers()
      .then((t) => { console.log('Team loaded:', t.length); setTeam(t); })
      .catch((err) => console.warn('fetchTeamMembers failed:', err));

    Promise.all([loadCards, loadBugs, loadTeam]).finally(() => setLoading(false));
  }, []);

  return { cards, bugs, team, loading, source };
}
