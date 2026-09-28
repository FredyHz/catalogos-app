'use client';

import { useSearchParams } from 'next/navigation';
import CatalogEditor from '@/components/CatalogEditor';

export default function CatalogEditorPage() {
  const searchParams = useSearchParams();
  const catalogId = searchParams.get('id');

  if (!catalogId) return <p className="p-6">Falta el ID del catálogo.</p>;

  return <CatalogEditor catalogId={catalogId} />;
}