'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import CatalogEditor from '@/components/CatalogEditor';

 function CatalogEditorContent() {
  const searchParams = useSearchParams();
  const catalogId = searchParams.get('id');

  if (!catalogId) return <p className="p-6">Falta el ID del catálogo.</p>;

  return <CatalogEditor catalogId={catalogId} />;

}
export default function CatalogEditorPage() {
  return (
    <Suspense fallback={null}>
      <CatalogEditorContent />
    </Suspense>
  );
}