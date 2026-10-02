'use client';

import { MantineProvider, Loader, Center } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { useEffect, useState, type ReactNode } from 'react';
import { theme } from '@/app/theme';
import { useStore } from '@/lib/store';

export function Providers({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      Promise.resolve(useStore.persist?.rehydrate())
        .catch(() => undefined)
        .finally(() => setReady(true));
    } catch {
      setReady(true);
    }
  }, []);
  return (
    <MantineProvider theme={theme} defaultColorScheme="light" forceColorScheme="light">
      <Notifications position="bottom-right" limit={3} />
      {ready ? (
        children
      ) : (
        <Center h="100vh">
          <Loader size="sm" color="gray" />
        </Center>
      )}
    </MantineProvider>
  );
}
