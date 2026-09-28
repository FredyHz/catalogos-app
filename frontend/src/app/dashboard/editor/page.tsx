'use client';

import { useSearchParams } from 'next/navigation';
import CanvasEditor from '@/components/CanvasEditor';

export default function EditorPage() {
  const searchParams = useSearchParams();
  const posterId = searchParams.get('id');
  const type = searchParams.get('type') || 'POSTER';

  return <CanvasEditor posterId={posterId} defaultType={type} />;
}