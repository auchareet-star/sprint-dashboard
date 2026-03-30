import { useState, useEffect, useMemo } from 'react';
import { rawAll, rawBugs } from '../data/sampleData';
import { fetchAllCards, fetchBugs, fetchTeamMembers, fetchSprintGoals, fetchNextSprintGoals, fetchOverviewUpdate, fetchSprintList, fetchIssuesEncountered, resolveSprintDates, isGoogleSheetsConfigured } from '../data/googleSheets';

export function useData() {
  const [cards, setCards] = useState(rawAll);
  const [bugs, setBugs] = useState(rawBugs);
  const [team, setTeam] = useState([]);
  const [sprintGoals, setSprintGoals] = useState({ meta: {}, items: [] });
  const [nextSprintGoals, setNextSprintGoals] = useState({ meta: {}, items: [] });
  const [issues, setIssues] = useState([]);
  const [overviewUpdate, setOverviewUpdate] = useState([]);
  const [sprintList, setSprintList] = useState([]);
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

    const loadIssues = fetchIssuesEncountered()
      .then((i) => { console.log('Issues loaded:', i.length); setIssues(i); })
      .catch((err) => console.warn('fetchIssuesEncountered failed:', err));

    const loadOverview = fetchOverviewUpdate()
      .then((o) => { console.log('Overview Update loaded:', o.length); setOverviewUpdate(o); })
      .catch((err) => console.warn('fetchOverviewUpdate failed:', err));

    const loadSprintList = fetchSprintList()
      .then((s) => { console.log('Sprint list loaded:', s.length); setSprintList(s); })
      .catch((err) => console.warn('fetchSprintList failed:', err));

    Promise.all([loadCards, loadBugs, loadTeam, loadGoals, loadNextGoals, loadIssues, loadOverview, loadSprintList]).finally(() => {
      setSource(cardsOk || bugsOk ? 'google' : 'sample');
      setLoading(false);
    });
  }, []);

  // Resolve sprint dates from Sprint sheet
  const resolvedGoals = useMemo(() => resolveSprintDates(sprintGoals, sprintList), [sprintGoals, sprintList]);
  const resolvedNextGoals = useMemo(() => resolveSprintDates(nextSprintGoals, sprintList), [nextSprintGoals, sprintList]);

  return { cards, bugs, team, sprintGoals: resolvedGoals, nextSprintGoals: resolvedNextGoals, issues, overviewUpdate, sprintList, loading, source };
}
