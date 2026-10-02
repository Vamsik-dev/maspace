'use client';

import { create } from 'zustand';
import type { AtlasAnswer } from './atlas';

// Ephemeral UI state only (not persisted, not domain data).
interface UiState {
  atlasOpen: boolean;
  atlasPrompt: string | null;
  feedbackOpen: boolean;
  threads: Record<string, AtlasAnswer[]>;
  pushAnswer: (acqId: string, a: AtlasAnswer) => void;
  clearThread: (acqId: string) => void;
  openAtlas: (prompt?: string) => void;
  closeAtlas: () => void;
  consumePrompt: () => string | null;
  setFeedbackOpen: (v: boolean) => void;
}

export const useUi = create<UiState>((set, get) => ({
  atlasOpen: false,
  atlasPrompt: null,
  feedbackOpen: false,
  threads: {},
  pushAnswer: (acqId, a) => set((s) => ({ threads: { ...s.threads, [acqId]: [...(s.threads[acqId] ?? []), a] } })),
  clearThread: (acqId) => set((s) => ({ threads: { ...s.threads, [acqId]: [] } })),
  openAtlas: (prompt) => set({ atlasOpen: true, atlasPrompt: prompt ?? null }),
  closeAtlas: () => set({ atlasOpen: false }),
  consumePrompt: () => {
    const p = get().atlasPrompt;
    set({ atlasPrompt: null });
    return p;
  },
  setFeedbackOpen: (v) => set({ feedbackOpen: v }),
}));
