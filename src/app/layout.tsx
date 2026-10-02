import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@blocknote/core/fonts/inter.css';
import './globals.css';
import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'Meridian · Acquisition Workspace (prototype)',
  description: 'High-fidelity front-end prototype of an intelligent M&A workspace for lean serial acquirers. Synthetic demo data.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript forceColorScheme="light" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
