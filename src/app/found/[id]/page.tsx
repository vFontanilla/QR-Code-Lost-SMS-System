'use client';
import { useParams } from 'next/navigation';
import FoundMessageForm from '@/components/FoundMessageForm';

export default function FoundPage() {
  const params = useParams();
  const documentId = params?.id as string; // ✅ cast to string

  return (
    <div>
      <h1>Report Found Item</h1>
      <FoundMessageForm documentId={documentId} />
    </div>
  );
}
