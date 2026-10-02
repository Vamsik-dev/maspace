'use client';

import { useShallow } from 'zustand/react/shallow';
import { useStore } from './store';
import { ORGS } from '@/data/playbooks';
import type { Acquisition } from './types';

export const useOrg = () => {
  const id = useStore((s) => s.currentOrgId);
  return ORGS.find((o) => o.id === id)!;
};

export const usePlaybook = (acq?: Pick<Acquisition, 'playbookId'>) => useStore((s) => s.playbooks.find((p) => p.id === acq?.playbookId));

export const useOrgPlaybook = () => {
  const org = useOrg();
  return useStore((s) => s.playbooks.find((p) => p.id === org.playbookId)!);
};

/** Acquisition memory is scoped to one organization; it never crosses tenants. */
export const usePriors = (orgId: string) => useStore(useShallow((s) => s.priors.filter((p) => p.orgId === orgId)));

import { PEOPLE } from '@/data/people';
import { PLAYBOOKS } from '@/data/playbooks';

/** People in the current organization (the tenant boundary). */
export const useOrgPeople = () => {
  const id = useStore((s) => s.currentOrgId);
  return PEOPLE.filter((p) => p.orgId === id);
};

/** Workstreams defined by the acquisition's playbook. */
export const useWorkstreams = (acqId: string) => {
  const pbId = useStore((s) => s.acquisitions.find((a) => a.id === acqId)?.playbookId);
  const pb = useStore((s) => s.playbooks.find((p) => p.id === pbId));
  return pb?.workstreams ?? PLAYBOOKS[0].workstreams;
};
