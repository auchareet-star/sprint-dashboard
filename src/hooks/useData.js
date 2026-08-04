import { useState, useEffect, useMemo } from 'react';
import { rawAll, rawBugs } from '../data/sampleData';
import { fetchAllCards, fetchBugs, fetchMAIssues, fetchTeamMembers, fetchSprintGoals, fetchNextSprintGoals, fetchOverviewUpdate, fetchSprintList, fetchIssuesEncountered, fetchProject, resolveSprintDates, isGoogleSheetsConfigured } from '../data/googleSheets';

export function useData() {
  const [cards, setCards] = useState(rawAll);
  const [bugs, setBugs] = useState(rawBugs);
  const [maIssues, setMaIssues] = useState([]);
  const [team, setTeam] = useState([]);
  const [sprintGoals, setSprintGoals] = useState({ meta: {}, items: [] });
  const [nextSprintGoals, setNextSprintGoals] = useState({ meta: {}, items: [] });
  const [issues, setIssues] = useState([]);
  const [overviewUpdate, setOverviewUpdate] = useState([]);
  const [sprintList, setSprintList] = useState([]);
  const [project, setProject] = useState({ name: '' });
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

    const loadMAIssues = fetchMAIssues()
      .then((m) => { console.log('MA Issues loaded:', m.length); setMaIssues(m); })
      .catch((err) => console.warn('fetchMAIssues failed:', err));

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

    const loadProject = fetchProject()
      .then((p) => { console.log('Project loaded:', p.name); setProject(p); })
      .catch((err) => console.warn('fetchProject failed:', err));

    Promise.all([loadCards, loadBugs, loadMAIssues, loadTeam, loadGoals, loadNextGoals, loadIssues, loadOverview, loadSprintList, loadProject]).finally(() => {
      setSource(cardsOk || bugsOk ? 'google' : 'sample');
      setLoading(false);
    });
  }, []);

  // Resolve sprint dates from Sprint sheet
  const resolvedGoals = useMemo(() => resolveSprintDates(sprintGoals, sprintList), [sprintGoals, sprintList]);
  const resolvedNextGoals = useMemo(() => resolveSprintDates(nextSprintGoals, sprintList), [nextSprintGoals, sprintList]);

  return { cards, bugs, maIssues, team, sprintGoals: resolvedGoals, nextSprintGoals: resolvedNextGoals, issues, overviewUpdate, sprintList, project, loading, source };
}
