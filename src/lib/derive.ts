import type { Acquisition, WorkItem, WorkstreamKey } from './types';
import { WORKSTREAMS } from './meta';

export function workstreamProgress(acq: Acquisition, work: WorkItem[]) {
  return WORKSTREAMS.map((w) => {
    const items = work.filter((x) => x.acqId === acq.id && x.workstream === w.key);
    const base = acq.requestList?.[w.key as WorkstreamKey] ?? { done: 0, total: 0 };
    const done = base.done + items.filter((x) => x.status === 'Complete').length;
    const total = base.total + items.length;
    const blocked = items.filter((x) => x.status === 'Blocked').length;
    return { ...w, done, total, open: items.filter((x) => x.status !== 'Complete').length, blocked, pct: total ? Math.round((done / total) * 100) : 0 };
  }).filter((w) => w.total > 0);
}
