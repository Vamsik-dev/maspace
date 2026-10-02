'use client';

import '@blocknote/mantine/style.css';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import type { PartialBlock } from '@blocknote/core';

// BlockNote is the single rich-text editor in the app: generated deliverables
// open as structured, editable documents rather than static AI output.
export default function DocEditor({ initial, onChange }: { initial: unknown[]; onChange: (doc: unknown[]) => void }) {
  const editor = useCreateBlockNote({ initialContent: initial as PartialBlock[] });
  return <BlockNoteView editor={editor} theme="light" onChange={() => onChange(editor.document as unknown[])} />;
}
