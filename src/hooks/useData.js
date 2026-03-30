import { useState, useEffect } from 'react';
import { rawAll, rawBugs } from '../data/sampleData';
import { fetchAllCards, fetchBugs, fetchTeamMembers, fetchSprintGoals, fetchNextSprintGoals, isGoogleSheetsConfigured } from '../data/googleSheets';

export function useData() {
  const [cards, setCards] = useState(rawAll);
  const [bugs, setBugs] = useState(rawBugs);
  const [team, setTeam] = useState([]);
  const [sprintGoals, setSprintGoals] = useState({ meta: {}, items: [] });
  const [nextSprintGoals, setNextSprintGoals] = useState({ meta: {}, items: [] });
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState('sample');

  useEffect(() => {
    if (!isGoogleSheetsConfigured()) return;

    setLoading(true);

    let cardsOk = false;
    let bugsOk = false;

    const loadCards = fetchAllCards()
      .then((c) => { console.log('Cards loaded:', c.length); setCards(c); cardsOk = true; })
      .catch((err) => { console.warn('fetchAllCards failed:', err); });

    const loadBugs = fetchBugs()
      .then((b) => { console.log('Bugs loaded:', b.length); setBugs(b); bugsOk = true; })
      .catch((err) => { console.warn('fetchBugs failed:', err); });

    const loadTeam = fetchTeamMembers()
      .then((t) => { console.log('Team loaded:', t.length); setTeam(t); })
      .catch((err) => console.warn('fetchTeamMembers failed:', err));

    const loadGoals = fetchSprintGoals()
      .then((g) => { console.log('Sprint Goals loaded:', g.items.length); setSprintGoals(g); })
      .catch((err) => console.warn('fetchSprintGoals failed:', err));

    const loadNextGoals = fetchNextSprintGoals()
      .then((g) => { console.log('Next Sprint Goals loaded:', g.items.length); setNextSprintGoals(g); })
      .catch((err) => console.warn('fetchNextSprintGoals failed:', err));

    Promise.all([loadCards, loadBugs, loadTeam, loadGoals, loadNextGoals]).finally(() => {
      setSource(cardsOk || bugsOk ? 'google' : 'sample');
      setLoading(false);
    });
  }, []);

  return { cards, bugs, team, sprintGoals, nextSprintGoals, loading, source };
}
