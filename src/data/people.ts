import type { Person } from '@/lib/types';

// SYNTHETIC DEMO DATA. All people and firms are fictional.
export const ACQUIRER = {
  name: 'Meridian Field Services',
  description: 'Texas-based platform of commercial and residential trade service businesses (synthetic).',
  acquisitionsToDate: 5,
  strategy: 'Buy-and-build in Texas mechanical, plumbing, electrical and fire/life-safety services. Prefer $10–25M revenue founder-owned businesses with ≥25% recurring service revenue.',
};

export const PEOPLE: Person[] = [
  { id: 'p-marcus', name: 'Marcus Hale', initials: 'MH', title: 'VP Corporate Development', function: 'Corp Dev', org: 'Internal', color: 'teal' },
  { id: 'p-priya', name: 'Priya Raman', initials: 'PR', title: 'Chief Financial Officer', function: 'CFO', org: 'Internal', color: 'indigo' },
  { id: 'p-dan', name: 'Dan Whitaker', initials: 'DW', title: 'Chief Executive Officer', function: 'CEO', org: 'Internal', color: 'dark' },
  { id: 'p-elena', name: 'Elena Torres', initials: 'ET', title: 'Corporate Controller', function: 'Finance', org: 'Internal', color: 'cyan' },
  { id: 'p-james', name: 'James Okafor', initials: 'JO', title: 'General Counsel', function: 'Legal', org: 'Internal', color: 'grape' },
  { id: 'p-rachel', name: 'Rachel Kim', initials: 'RK', title: 'VP Operations & Integration', function: 'Integration Lead', org: 'Internal', color: 'orange' },
  { id: 'p-tom', name: 'Tom Brennan', initials: 'TB', title: 'HR Director', function: 'HR', org: 'Internal', color: 'pink' },
  { id: 'p-luis', name: 'Luis Ortega', initials: 'LO', title: 'IT Manager', function: 'IT', org: 'Internal', color: 'lime' },
  { id: 'p-hannah', name: 'Hannah Weiss', initials: 'HW', title: 'Transaction Services Partner', function: 'QoE', org: 'Advisor', firm: 'Halvorsen & Pike LLP', color: 'blue' },
  { id: 'p-ben', name: 'Ben Adler', initials: 'BA', title: 'M&A Partner, Outside Counsel', function: 'Legal', org: 'Advisor', firm: 'Carrow Lindqvist LLP', color: 'violet' },
  { id: 'p-nora', name: 'Nora Feld', initials: 'NF', title: 'State & Local Tax Director', function: 'Tax', org: 'Advisor', firm: 'Halvorsen & Pike LLP', color: 'yellow' },
];

export const personById = (id: string) => PEOPLE.find((p) => p.id === id);
