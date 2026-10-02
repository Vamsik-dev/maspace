import type { Person } from '@/lib/types';

// SYNTHETIC DEMO DATA. All people and firms are fictional.
export const ACQUIRER = {
  name: 'Meridian Field Services',
  description: 'Texas-based platform of commercial and residential trade service businesses (synthetic).',
  acquisitionsToDate: 5,
  strategy: 'Buy-and-build in Texas mechanical, plumbing, electrical and fire/life-safety services. Prefer $10–25M revenue founder-owned businesses with ≥25% recurring service revenue.',
};

export const PEOPLE: Person[] = [
  { orgId: 'org-meridian', id: 'p-marcus', name: 'Marcus Hale', initials: 'MH', title: 'VP Corporate Development', function: 'Corp Dev', org: 'Internal', color: 'teal' },
  { orgId: 'org-meridian', id: 'p-priya', name: 'Priya Raman', initials: 'PR', title: 'Chief Financial Officer', function: 'CFO', org: 'Internal', color: 'indigo' },
  { orgId: 'org-meridian', id: 'p-dan', name: 'Dan Whitaker', initials: 'DW', title: 'Chief Executive Officer', function: 'CEO', org: 'Internal', color: 'dark' },
  { orgId: 'org-meridian', id: 'p-elena', name: 'Elena Torres', initials: 'ET', title: 'Corporate Controller', function: 'Finance', org: 'Internal', color: 'cyan' },
  { orgId: 'org-meridian', id: 'p-james', name: 'James Okafor', initials: 'JO', title: 'General Counsel', function: 'Legal', org: 'Internal', color: 'grape' },
  { orgId: 'org-meridian', id: 'p-rachel', name: 'Rachel Kim', initials: 'RK', title: 'VP Operations & Integration', function: 'Integration Lead', org: 'Internal', color: 'orange' },
  { orgId: 'org-meridian', id: 'p-tom', name: 'Tom Brennan', initials: 'TB', title: 'HR Director', function: 'HR', org: 'Internal', color: 'pink' },
  { orgId: 'org-meridian', id: 'p-luis', name: 'Luis Ortega', initials: 'LO', title: 'IT Manager', function: 'IT', org: 'Internal', color: 'lime' },
  { orgId: 'org-meridian', id: 'p-hannah', name: 'Hannah Weiss', initials: 'HW', title: 'Transaction Services Partner', function: 'QoE', org: 'Advisor', firm: 'Halvorsen & Pike LLP', color: 'blue' },
  { orgId: 'org-meridian', id: 'p-ben', name: 'Ben Adler', initials: 'BA', title: 'M&A Partner, Outside Counsel', function: 'Legal', org: 'Advisor', firm: 'Carrow Lindqvist LLP', color: 'violet' },
  { orgId: 'org-meridian', id: 'p-nora', name: 'Nora Feld', initials: 'NF', title: 'State & Local Tax Director', function: 'Tax', org: 'Advisor', firm: 'Halvorsen & Pike LLP', color: 'yellow' },
  // Halcyon Health Partners (synthetic)
  { orgId: 'org-halcyon', id: 'p-h-sameer', name: 'Sameer Patel', initials: 'SP', title: 'VP Corporate Development', function: 'Corp Dev', org: 'Internal', color: 'teal' },
  { orgId: 'org-halcyon', id: 'p-h-laura', name: 'Laura Bennett', initials: 'LB', title: 'Chief Executive Officer', function: 'CEO', org: 'Internal', color: 'dark' },
  { orgId: 'org-halcyon', id: 'p-h-grace', name: 'Grace Liu', initials: 'GL', title: 'Chief Financial Officer', function: 'CFO', org: 'Internal', color: 'indigo' },
  { orgId: 'org-halcyon', id: 'p-h-reyes', name: 'Dr. Michael Reyes', initials: 'MR', title: 'Chief Medical Officer', function: 'Clinical', org: 'Internal', color: 'red' },
  { orgId: 'org-halcyon', id: 'p-h-dana', name: 'Dana Whitfield', initials: 'DW', title: 'General Counsel & Chief Compliance Officer', function: 'Legal / Compliance', org: 'Internal', color: 'grape' },
  { orgId: 'org-halcyon', id: 'p-h-olivia', name: 'Olivia Brandt', initials: 'OB', title: 'VP Operations & Integration', function: 'Integration Lead', org: 'Internal', color: 'orange' },
  { orgId: 'org-halcyon', id: 'p-h-ellis', name: 'Ellis Grant', initials: 'EG', title: 'Healthcare Regulatory Partner', function: 'Regulatory', org: 'Advisor', firm: 'Marlow & Pierce LLP', color: 'violet' },
];

export const personById = (id: string) => PEOPLE.find((p) => p.id === id);
