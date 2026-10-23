'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import CanvasEditor from '@/components/CanvasEditor';

function EditorContent() {
  const searchParams = useSearchParams();
  const posterId = searchParams.get('id');
  const type = searchParams.get('type') || 'POSTER';

  return <CanvasEditor posterId={posterId} defaultType={type} />;
}

export default function EditorPage() {
  return (
    <Suspense fallback={null}>
      <EditorContent />
    </Suspense>
  );
}