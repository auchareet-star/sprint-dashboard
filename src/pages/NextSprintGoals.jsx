import { SprintGoalsView } from './SprintGoals';

export default function NextSprintGoals({ data, slideRef }) {
  return <SprintGoalsView goals={data.nextSprintGoals} title="Next Sprint Goals" slideRef={slideRef} />;
}
