import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/spotlight/styles.css';
import '@fontsource-variable/mona-sans/standard.css';
import '@/app/globals.css';
import { createRoot } from 'react-dom/client';
import { useSyncExternalStore, type ComponentType, type ReactNode } from 'react';
import { Providers } from '@/components/Providers';
import { ParamsContext } from './navigation';
import { getSnapshot, subscribe } from './location';

import Portfolio from '@/app/page';
import Memory from '@/app/memory/page';
import Guide from '@/app/guide/page';
import Feedback from '@/app/feedback/page';
import Workspace from '@/app/acquisitions/[id]/layout';
import Welcome from '@/app/welcome/page';
import Overview from '@/app/acquisitions/[id]/page';
import Atlas from '@/app/acquisitions/[id]/atlas/page';
import Phase from '@/app/acquisitions/[id]/phase/[phase]/page';
import Workstreams from '@/app/acquisitions/[id]/workstreams/page';
import Workstream from '@/app/acquisitions/[id]/workstreams/[ws]/page';
import Work from '@/app/acquisitions/[id]/work/page';
import Findings from '@/app/acquisitions/[id]/findings/page';
import Finding from '@/app/acquisitions/[id]/findings/[fid]/page';
import Risks from '@/app/acquisitions/[id]/risks/page';
import Decisions from '@/app/acquisitions/[id]/decisions/page';
import Decision from '@/app/acquisitions/[id]/decisions/[did]/page';
import Documents from '@/app/acquisitions/[id]/documents/page';
import Document from '@/app/acquisitions/[id]/documents/[docId]/page';
import Deliverables from '@/app/acquisitions/[id]/deliverables/page';
import Deliverable from '@/app/acquisitions/[id]/deliverables/[delId]/page';
import Team from '@/app/acquisitions/[id]/team/page';
import Activity from '@/app/acquisitions/[id]/activity/page';
import Inbox from '@/app/acquisitions/[id]/inbox/page';
import Research from '@/app/acquisitions/[id]/research/page';
import Intake from '@/app/acquisitions/[id]/intake/page';
import NewAcq from '@/app/new/page';
import Playbooks from '@/app/playbooks/page';
import Pipeline from '@/app/pipeline/page';
import QA from '@/app/acquisitions/[id]/qa/page';

const TOP: [string, ComponentType][] = [
  ['/', Portfolio],
  ['/memory', Memory],
  ['/guide', Guide],
  ['/feedback', Feedback],
  ['/new', NewAcq],
  ['/playbooks', Playbooks],
  ['/pipeline', Pipeline],
  ['/welcome', Welcome],
];
const DEAL: [string, ComponentType][] = [
  ['', Overview],
  ['/atlas', Atlas],
  ['/phase/:phase', Phase],
  ['/workstreams', Workstreams],
  ['/workstreams/:ws', Workstream],
  ['/work', Work],
  ['/findings', Findings],
  ['/findings/:fid', Finding],
  ['/risks', Risks],
  ['/decisions', Decisions],
  ['/decisions/:did', Decision],
  ['/documents', Documents],
  ['/documents/:docId', Document],
  ['/deliverables', Deliverables],
  ['/deliverables/:delId', Deliverable],
  ['/team', Team],
  ['/activity', Activity],
  ['/inbox', Inbox],
  ['/qa', QA],
  ['/research', Research],
  ['/intake', Intake],
];

function match(pattern: string, path: string): Record<string, string> | null {
  const a = pattern.split('/').filter(Boolean);
  const b = path.split('/').filter(Boolean);
  if (a.length !== b.length) return null;
  const out: Record<string, string> = {};
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith(':')) out[a[i].slice(1)] = decodeURIComponent(b[i]);
    else if (a[i] !== b[i]) return null;
  }
  return out;
}

function Router() {
  const { pathname } = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  let content: ReactNode = null;
  let params: Record<string, string> = {};
  const deal = pathname.match(/^\/acquisitions\/([^/]+)(.*)$/);
  if (deal) {
    const rest = deal[2].replace(/\/$/, '');
    for (const [p, C] of DEAL) {
      const m = match(p, rest);
      if (m) {
        params = { id: deal[1], ...m };
        content = (
          <Workspace>
            <C key={pathname} />
          </Workspace>
        );
        break;
      }
    }
  } else {
    for (const [p, C] of TOP) {
      if (match(p, pathname)) {
        content = <C />;
        break;
      }
    }
  }
  return <ParamsContext.Provider value={params}>{content ?? <Portfolio />}</ParamsContext.Provider>;
}

createRoot(document.getElementById('root')!).render(
  <Providers>
    <Router />
  </Providers>,
);
